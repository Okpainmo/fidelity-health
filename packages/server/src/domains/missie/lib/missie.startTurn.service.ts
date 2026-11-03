import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { messageFields } from '../../../utils/missie/missie.selectFields.js';
import type { MissieTurn } from '../../../utils/missie/missie.client.js';

// How many recent messages the model sees. Keeps prompts (and cost) bounded.
const HISTORY_LIMIT = 20;
const TITLE_LENGTH = 60;

/**
 * Saves the user's message and returns the conversation plus the recent history
 * to send to the model. Starts a new conversation when `conversationId` is not
 * given. Returns null when the conversation doesn't exist or isn't the user's.
 */
export async function startMissieTurn(params: { userId: number; message: string; conversationId?: string }) {
  try {
    const { userId, message, conversationId } = params;

    // New conversations are titled with the first message, on one line.
    const oneLine = message.replace(/\s+/g, ' ').trim();
    const title = oneLine.length > TITLE_LENGTH ? `${oneLine.slice(0, TITLE_LENGTH - 1)}…` : oneLine;

    return await prisma.$transaction(async (tx) => {
      const conversation = conversationId
        ? await tx.missieConversation.findFirst({ where: { id: conversationId, userId } })
        : await tx.missieConversation.create({ data: { userId, title } });

      if (!conversation) return null;

      const userMessage = await tx.missieMessage.create({
        data: { conversationId: conversation.id, role: 'user', content: message },
        select: messageFields
      });

      const recent = await tx.missieMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: HISTORY_LIMIT,
        select: { role: true, content: true }
      });

      const history: MissieTurn[] = recent.reverse();

      return { conversation: { id: conversation.id, title: conversation.title, isNew: !conversationId }, userMessage, history };
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
