import { prisma } from '../../../lib/prisma.js';

// The signed-in user, as the records services need them.
export type Viewer = { userId: number; isAdmin: boolean; accountType: 'patient' | 'hospital' };

export function viewerFrom(user: { id?: number; isAdmin?: boolean; accountType?: 'patient' | 'hospital' } | undefined): Viewer | null {
  if (!user?.id) return null;
  return { userId: user.id, isAdmin: Boolean(user.isAdmin), accountType: user.accountType ?? 'patient' };
}

export const hospitalProfileOf = (userId: number) => prisma.hospitalProfile.findUnique({ where: { userId } });
export const patientProfileOf = (userId: number) => prisma.patientProfile.findUnique({ where: { userId } });
