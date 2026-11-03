import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';

/**
 * Retrieves a page of users, optionally filtered by email.
 */
export async function getUsers(params?: { email?: string; limit?: number; offset?: number }) {
  try {
    const { email, limit = 50, offset = 0 } = params ?? {};

    return await prisma.user.findMany({
      where: email ? { email } : undefined,
      skip: offset,
      take: limit
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return [];
  }
}
