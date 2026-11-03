import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { initialHospitalProfile, initialPatientProfile } from '../../user/lib/user.profileHelpers.js';
import type { UserSpecs } from '../../user/schema/user.schema.js';

/**
 * Creates a user and their (empty) patient or hospital profile in one
 * transaction, and returns the user's public profile (no password or tokens).
 */
export async function createUser(data: { user: UserSpecs }) {
  try {
    const accountType = data.user.accountType ?? 'patient';

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.user.name as string,
          email: data.user.email as string,
          password: data.user.password as string,
          accountType
        },
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          isActive: true,
          accountType: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (user.accountType === 'hospital') {
        await tx.hospitalProfile.create({ data: initialHospitalProfile(user) });
      } else {
        await tx.patientProfile.create({ data: initialPatientProfile(user) });
      }

      return user;
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return;
  }
}
