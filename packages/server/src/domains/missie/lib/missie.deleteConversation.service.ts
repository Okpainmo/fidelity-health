import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';

/** Deletes one of the user's conversations. Returns false if it isn't theirs. */
export async function deleteMissieConversation(userId: number, conversationId: string) {
  try {
    const { count } = await prisma.missieConversation.deleteMany({ where: { id: conversationId, userId } });
    return count > 0;
  } catch (error) {
    customServiceErrorHandler(error);
    return false;
  }
}
