import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { conversationFields, messageFields } from '../../../utils/missie/missie.selectFields.js';

/** One of the user's conversations with all its messages, or null if it isn't theirs. */
export async function getMissieConversation(userId: number, conversationId: string) {
  try {
    return await prisma.missieConversation.findFirst({
      where: { id: conversationId, userId },
      select: { ...conversationFields, messages: { orderBy: { createdAt: 'asc' }, select: messageFields } }
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
