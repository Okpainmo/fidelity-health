import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { messageFields } from '../../../utils/missie/missie.selectFields.js';

/** Saves Missie's reply and bumps the conversation to the top of the user's list. */
export async function saveMissieReply(params: { conversationId: string; content: string; model: string }) {
  try {
    const { conversationId, content, model } = params;

    const [reply] = await prisma.$transaction([
      prisma.missieMessage.create({ data: { conversationId, role: 'missie', content, model }, select: messageFields }),
      prisma.missieConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })
    ]);

    return reply;
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
