import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import { initialHospitalProfile, initialPatientProfile, serializeProfile } from './user.profileHelpers.js';

type AccountUser = { id: number; name: string; email: string; accountType: 'patient' | 'hospital' };

/**
 * Returns the signed-in account's profile, creating an empty one first if it
 * doesn't exist yet (accounts made before profiles existed).
 */
export async function getOwnProfile(user: AccountUser) {
  try {
    if (user.accountType === 'hospital') {
      const profile =
        (await prisma.hospitalProfile.findUnique({ where: { userId: user.id } })) ??
        (await prisma.hospitalProfile.create({ data: initialHospitalProfile(user) }));
      return await serializeProfile(profile);
    }

    const profile =
      (await prisma.patientProfile.findUnique({ where: { userId: user.id } })) ??
      (await prisma.patientProfile.create({ data: initialPatientProfile(user) }));
    return await serializeProfile(profile);
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
