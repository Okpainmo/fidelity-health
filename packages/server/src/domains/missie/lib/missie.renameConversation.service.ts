import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { conversationFields } from '../../../utils/missie/missie.selectFields.js';

/**
 * Renames one of the user's conversations. Returns null if it isn't theirs.
 * Keeps `updatedAt` as it was, so a rename doesn't move the chat to the top
 * of the list (that order reflects the last message).
 */
export async function renameMissieConversation(userId: number, conversationId: string, title: string) {
  try {
    const existing = await prisma.missieConversation.findFirst({ where: { id: conversationId, userId }, select: { updatedAt: true } });
    if (!existing) return null;

    return await prisma.missieConversation.update({
      where: { id: conversationId },
      data: { title, updatedAt: existing.updatedAt },
      select: conversationFields
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
