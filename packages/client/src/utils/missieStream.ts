import { API_URL_BASE } from '@/utils/axiosBase';
import { AUTH_STORAGE_KEYS, readStoredUser } from '@/utils/authStorage';
import { handleSessionExpiry } from '@/utils/sessionExpiry';
import type { ChatMessage } from '@/rtk-base/slices/chatSlice';

// Streams one reply from Missie over a WebSocket (server: /missie/chat/stream).
// Opens a socket, authenticates, sends the message, then closes once the reply is done.

export interface StreamStart {
  conversation: { id: string; title: string };
  userMessage: ChatMessage;
}

interface StreamEvents {
  onStart: (start: StreamStart) => void;
  onDelta: (delta: string) => void;
  onDone: (reply: ChatMessage) => void;
  onError: (message: string) => void;
}

const STREAM_URL = `${API_URL_BASE.replace(/^http/, 'ws')}/missie/chat/stream`;

// The server closes with these codes when the session is no longer valid.
const SESSION_CLOSE_CODES = [4401, 4403];

export function streamMissieChat(chat: { message: string; conversationId?: string }, events: StreamEvents) {
  const socket = new WebSocket(STREAM_URL);
  let finished = false;

  function finish(error?: string) {
    if (finished) return;
    finished = true;
    if (error) events.onError(error);
    socket.close();
  }

  const send = (type: string, payload: unknown) => socket.send(JSON.stringify({ type, payload }));

  // Browsers can't add headers to a WebSocket, so the first message logs in.
  socket.onopen = () => {
    send('auth', { email: readStoredUser()?.email, accessToken: localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) });
  };

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === 'auth.ok') send('chat', chat);
    if (type === 'chat.start') events.onStart(payload);
    if (type === 'chat.delta') events.onDelta(payload.delta);
    if (type === 'chat.done') {
      events.onDone(payload.reply);
      finish();
    }
    if (type === 'error') finish(payload.message);
  };

  socket.onclose = (event) => {
    if (SESSION_CLOSE_CODES.includes(event.code)) handleSessionExpiry();
    finish("Couldn't reach Missie. Please try again.");
  };
}
