import { z } from 'zod';

export const MISSIE_MESSAGE_MAX_LENGTH = 4000;

const chatTurn = {
  message: z
    .string({ required_error: 'Message is required.' })
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(MISSIE_MESSAGE_MAX_LENGTH, `Message must be ${MISSIE_MESSAGE_MAX_LENGTH} characters or fewer.`),
  // Leave out to start a new conversation.
  conversationId: z.string().uuid('Invalid conversation ID.').optional()
};

/* POST /api/v1/missie/chat */
export const missieChatRequestSchema = z.object(chatTurn).strict();

/* WebSocket /api/v1/missie/chat/stream - message payloads sent by the client.

   Browsers can't set custom headers on a WebSocket, so the client authenticates
   with its first message instead: { type: 'auth', payload: { email, accessToken } }.
   The auth cookie still has to come with the handshake. */
export const missieStreamAuthSchema = z
  .object({
    email: z.string().email('Please provide a valid email address'),
    accessToken: z.string().min(1, 'Access token is required.')
  })
  .strict();

export const missieStreamChatSchema = z.object(chatTurn).strict();

export type MissieChatRequest = z.infer<typeof missieChatRequestSchema>;
export type MissieStreamAuth = z.infer<typeof missieStreamAuthSchema>;
export type MissieStreamChat = z.infer<typeof missieStreamChatSchema>;

/* /api/v1/missie/conversations/:conversationId */
export const missieConversationParamsSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID.')
});

/* PATCH /api/v1/missie/conversations/:conversationId */
export const missieRenameConversationSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required.' })
      .trim()
      .min(1, 'Title cannot be empty.')
      .max(120, 'Title must be 120 characters or fewer.')
  })
  .strict();

export type MissieRenameConversation = z.infer<typeof missieRenameConversationSchema>;
