import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';

/**
 * Finds a user by ID or email. Returns null when neither is given or no user matches.
 */
export async function findUser(params: { userId?: string | number; email?: string }) {
  try {
    const { userId, email } = params;

    if (email) return await prisma.user.findUnique({ where: { email } });
    if (userId !== undefined) return await prisma.user.findUnique({ where: { id: Number(userId) } });

    return null;
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
