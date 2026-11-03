import { randomUUID } from 'node:crypto';
import { prisma } from '../../../lib/prisma.js';
import { deleteObjects, putObject } from '../../../utils/storage/s3.js';
import { photoUrlFor } from '../../records/lib/records.serialize.js';
import { initialPatientProfile } from './user.profileHelpers.js';

type AccountUser = { id: number; name: string; email: string; accountType: 'patient' | 'hospital' };

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** Stores a patient's new passport photo (images bucket), replacing any old one. Returns its signed URL. */
export async function setPatientPhoto(user: AccountUser, file: Express.Multer.File) {
  const key = `profile-photos/${user.id}/${randomUUID()}.${EXTENSIONS[file.mimetype] ?? 'jpg'}`;
  await putObject('images', key, file.buffer, file.mimetype);

  try {
    const existing = await prisma.patientProfile.findUnique({ where: { userId: user.id }, select: { photoKey: true } });
    await prisma.patientProfile.upsert({
      where: { userId: user.id },
      create: { ...initialPatientProfile(user), photoKey: key },
      update: { photoKey: key }
    });
    if (existing?.photoKey) await deleteObjects('images', [existing.photoKey]);
  } catch (error) {
    await deleteObjects('images', [key]);
    throw error;
  }

  return photoUrlFor(key);
}

/** Removes a patient's photo. */
export async function removePatientPhoto(userId: number) {
  const existing = await prisma.patientProfile.findUnique({ where: { userId }, select: { photoKey: true } });
  if (!existing?.photoKey) return;
  await prisma.patientProfile.update({ where: { userId }, data: { photoKey: null } });
  await deleteObjects('images', [existing.photoKey]);
}
