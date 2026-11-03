import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { conversationFields } from '../../../utils/missie/missie.selectFields.js';

/** The user's conversations, most recently active first. */
export async function listMissieConversations(userId: number) {
  try {
    return await prisma.missieConversation.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, select: conversationFields });
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
