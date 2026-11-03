/**
 * @description Chat with Missie over a WebSocket, with the reply streamed as it's generated.
 * @request WebSocket
 * @route /api/v1/missie/chat/stream
 * @access Private (session)
 *
 * Protocol (JSON messages, `{ type, payload }`):
 *
 *   client -> server
 *     auth         { email, accessToken }        must be the first message, within AUTH_TIMEOUT_MS
 *     chat         { message, conversationId? }  leave out conversationId to start a new conversation
 *     chat.cancel  {}                            stop the reply in progress (the partial reply is kept)
 *     ping         {}
 *
 *   server -> client
 *     auth.ok      { user }
 *     chat.start   { conversation, userMessage }
 *     chat.delta   { conversationId, delta }     one per text chunk
 *     chat.done    { conversationId, reply, cancelled }
 *     pong         {}
 *     error        { code, message }             code: BAD_REQUEST | UNAUTHORIZED | NOT_FOUND | BUSY | INTERNAL
 *
 * The auth cookie must be sent with the handshake (browsers do this automatically).
 * The socket closes with 4401 when auth fails or times out, and 4403 when the session has expired.
 */

import type { IncomingMessage } from 'http';
import type { ZodSchema } from 'zod';
import log from '../../../utils/logger.js';
import type { ConnectionHandler, ExtendedWebSocket, MessageHandler, CloseHandler } from '../../../lib/webSocketCore/types.js';
import { safeSendMessage } from '../../../lib/webSocketCore/utils/messageHandler.js';
import { safeCloseSocket } from '../../../lib/webSocketCore/utils/connectionHandler.js';
import { hasAuthCookie } from '../../../utils/cookieDeployHandlers.js';
import { startMissieTurn } from '../lib/missie.startTurn.service.js';
import { saveMissieReply } from '../lib/missie.saveReply.service.js';
import { streamMissieReply } from '../lib/missie.streamReply.service.js';
import { MISSIE_MODEL } from '../../../utils/missie/missie.client.js';
import { authenticateMissieStream, type MissieStreamUser } from '../lib/missie.streamAuth.service.js';
import { missieStreamAuthSchema, missieStreamChatSchema } from '../schema/missie.schema.js';

export const MISSIE_STREAM_PATH = '/api/v1/missie/chat/stream';

const AUTH_TIMEOUT_MS = 10_000;
const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_SESSION_EXPIRED = 4403;

type ErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'BUSY' | 'INTERNAL';

type SocketState = {
  user?: MissieStreamUser;
  authTimer?: NodeJS.Timeout;
  // Set while a reply is streaming; one reply at a time per socket.
  inFlight?: AbortController;
};

const sockets = new Map<string, SocketState>();

const send = (ws: ExtendedWebSocket, type: string, payload: unknown = {}) => safeSendMessage(ws, { type, payload });
const sendError = (ws: ExtendedWebSocket, code: ErrorCode, message: string) => send(ws, 'error', { code, message });

function parsePayload<T>(ws: ExtendedWebSocket, schema: ZodSchema<T>, payload: unknown): T | null {
  const parsed = schema.safeParse(payload ?? {});
  if (parsed.success) return parsed.data;

  const issue = parsed.error.issues[0];
  const field = issue?.path.join('.');
  sendError(ws, 'BAD_REQUEST', issue ? (field ? `${field}: ${issue.message}` : issue.message) : 'invalid payload');
  return null;
}

export const onMissieStreamConnection: ConnectionHandler = (ws: ExtendedWebSocket, request: IncomingMessage) => {
  if (!hasAuthCookie(request.headers.cookie)) {
    log.warn({ level: 'warn', connectionId: ws.id }, 'Missie stream rejected: no auth cookie');
    safeCloseSocket(ws, CLOSE_UNAUTHORIZED, 'Please re-authenticate');
    return;
  }

  const authTimer = setTimeout(() => {
    if (!sockets.get(ws.id)?.user) safeCloseSocket(ws, CLOSE_UNAUTHORIZED, 'Authentication timed out');
  }, AUTH_TIMEOUT_MS);

  sockets.set(ws.id, { authTimer });
};

async function handleAuth(ws: ExtendedWebSocket, state: SocketState, payload: unknown) {
  if (state.user) {
    send(ws, 'auth.ok', { user: state.user });
    return;
  }

  const credentials = parsePayload(ws, missieStreamAuthSchema, payload);
  if (!credentials) return;

  const result = await authenticateMissieStream(credentials);
  if (!result.ok) {
    log.warn({ level: 'warn', connectionId: ws.id, reason: result.reason }, 'Missie stream auth failed');
    sendError(ws, 'UNAUTHORIZED', result.message);
    safeCloseSocket(ws, result.reason === 'session_expired' ? CLOSE_SESSION_EXPIRED : CLOSE_UNAUTHORIZED, result.message);
    return;
  }

  clearTimeout(state.authTimer);
  state.user = result.user;
  ws.userId = String(result.user.id);
  send(ws, 'auth.ok', { user: result.user });
}

async function handleChat(ws: ExtendedWebSocket, state: SocketState, payload: unknown) {
  const user = state.user;
  if (!user) {
    sendError(ws, 'UNAUTHORIZED', 'send an auth message first');
    return;
  }
  if (state.inFlight) {
    sendError(ws, 'BUSY', 'Missie is still replying; wait for chat.done or send chat.cancel');
    return;
  }

  const chat = parsePayload(ws, missieStreamChatSchema, payload);
  if (!chat) return;

  const controller = new AbortController();
  state.inFlight = controller;

  let conversationId: string | undefined;
  let content = '';

  try {
    const turn = await startMissieTurn({ userId: user.id, message: chat.message, conversationId: chat.conversationId });
    if (!turn) {
      sendError(ws, 'NOT_FOUND', 'conversation not found');
      return;
    }

    conversationId = turn.conversation.id;
    send(ws, 'chat.start', { conversation: turn.conversation, userMessage: turn.userMessage });

    for await (const delta of streamMissieReply(turn.history, controller.signal)) {
      content += delta;
      send(ws, 'chat.delta', { conversationId, delta });
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      log.error({ level: 'error', connectionId: ws.id, userId: user.id, err: error }, 'Missie stream failed');
      sendError(ws, 'INTERNAL', 'Missie could not finish replying');
      return;
    }
    // Aborted (chat.cancel or socket closed): fall through and keep what was generated.
  } finally {
    state.inFlight = undefined;
  }

  if (!conversationId || !content) return;

  const reply = await saveMissieReply({ conversationId, content, model: MISSIE_MODEL });
  if (!reply) {
    sendError(ws, 'INTERNAL', 'could not save reply');
    return;
  }

  log.info({ level: 'info', userId: user.id, conversationId, cancelled: controller.signal.aborted }, 'Missie replied (stream)');
  send(ws, 'chat.done', { conversationId, reply, cancelled: controller.signal.aborted });
}

export const onMissieStreamMessage: MessageHandler = async (ws, message) => {
  const state = sockets.get(ws.id);
  if (!state) return; // rejected at connection; the socket is closing

  switch (message.type) {
    case 'auth':
      await handleAuth(ws, state, message.payload);
      break;

    case 'chat':
      await handleChat(ws, state, message.payload);
      break;

    case 'chat.cancel':
      state.inFlight?.abort();
      break;

    case 'ping':
      send(ws, 'pong');
      break;

    default:
      sendError(ws, 'BAD_REQUEST', `Unknown message type: ${message.type}`);
  }
};

export const onMissieStreamClose: CloseHandler = (ws) => {
  const state = sockets.get(ws.id);
  if (!state) return;

  clearTimeout(state.authTimer);
  state.inFlight?.abort();
  sockets.delete(ws.id);
};
