import { prisma } from '../../../lib/prisma.js';
import { customServiceErrorHandler } from '../../../utils/errorHandlers/customServiceErrorHandler.js';
import type { HospitalProfileUpdate, PatientProfileUpdate } from '../schema/profile.schema.js';
import { initialHospitalProfile, initialPatientProfile, serializeProfile } from './user.profileHelpers.js';

type AccountUser = { id: number; name: string; email: string; accountType: 'patient' | 'hospital' };

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  isAdmin: true,
  isActive: true,
  accountType: true,
  createdAt: true,
  updatedAt: true
} as const;

/**
 * Saves profile changes for a patient. If first/last name change, the
 * account's display name follows so the rest of the app stays consistent.
 */
export async function updatePatientProfile(user: AccountUser, data: PatientProfileUpdate) {
  try {
    return await prisma.$transaction(async (tx) => {
      const profile = await tx.patientProfile.upsert({
        where: { userId: user.id },
        create: { ...initialPatientProfile(user), ...data },
        update: data
      });

      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').slice(0, 100);
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: fullName && fullName !== user.name ? { name: fullName } : {},
        select: publicUserFields
      });

      return { userProfile: updatedUser, profile: await serializeProfile(profile) };
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}

/**
 * Saves profile changes for a hospital. `institutionName` is the account's name.
 */
export async function updateHospitalProfile(user: AccountUser, data: HospitalProfileUpdate) {
  try {
    const { institutionName, ...profileData } = data;

    return await prisma.$transaction(async (tx) => {
      const profile = await tx.hospitalProfile.upsert({
        where: { userId: user.id },
        create: { ...initialHospitalProfile(user), ...profileData },
        update: profileData
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: institutionName && institutionName !== user.name ? { name: institutionName } : {},
        select: publicUserFields
      });

      return { userProfile: updatedUser, profile: await serializeProfile(profile) };
    });
  } catch (error) {
    customServiceErrorHandler(error);
    return null;
  }
}
