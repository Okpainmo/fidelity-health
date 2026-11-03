import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import type { UserSpecs } from '../schema/user.schema.js';

/**
 * Updates a user found by email (preferred) or ID, and returns the updated
 * user without their password.
 */
export async function updateUser({ userId, email, requestBody }: { userId?: string | number; email?: string; requestBody: UserSpecs }) {
  try {
    const where = email ? { email } : userId !== undefined ? { id: Number(userId) } : null;
    if (!where) return null;

    return await prisma.user.update({
      where,
      data: {
        name: requestBody.name || undefined,
        email: requestBody.email,
        password: requestBody.password,
        isAdmin: requestBody.isAdmin,
        isActive: requestBody.isActive,
        accountType: requestBody.accountType,
        accessToken: requestBody.accessToken,
        refreshToken: requestBody.refreshToken
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true,
        accountType: true,
        createdAt: true,
        updatedAt: true,
        accessToken: true,
        refreshToken: true
      }
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return;
  }
}
