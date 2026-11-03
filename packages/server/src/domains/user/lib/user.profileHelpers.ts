import type { Prisma } from '../../../../generated/prisma/client.js';
import { institutionId, patientFhId } from '../../../utils/fidelityIds.js';
import { photoUrlFor } from '../../records/lib/records.serialize.js';

type AccountUser = { id: number; name: string; email: string; accountType: 'patient' | 'hospital' };

// Initial profile row for a new (or not-yet-profiled) account, pre-filled
// from what sign-up already knows.
export function initialPatientProfile(user: AccountUser): Prisma.PatientProfileUncheckedCreateInput {
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  return {
    userId: user.id,
    fhId: patientFhId(user.id),
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts[parts.length - 1] : null,
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : null,
    contactEmail: user.email
  };
}

export function initialHospitalProfile(user: AccountUser): Prisma.HospitalProfileUncheckedCreateInput {
  return { userId: user.id, institutionId: institutionId(user.id), contactEmail: user.email };
}

const DATE_FIELDS = ['dateOfBirth', 'policyExpiry', 'licenceExpiry'] as const;

// Prepares a profile row for the client: dates as YYYY-MM-DD, no internal ids,
// and the photo as a short-lived signed URL (`photoUrl`) instead of its S3 key.
export async function serializeProfile<T extends Record<string, unknown>>(profile: T) {
  const out: Record<string, unknown> = { ...profile };
  delete out.id;
  delete out.userId;
  if ('photoKey' in out) {
    out.photoUrl = await photoUrlFor(typeof out.photoKey === 'string' ? out.photoKey : null);
    delete out.photoKey;
  }
  for (const field of DATE_FIELDS) {
    const value = out[field];
    if (value instanceof Date) out[field] = value.toISOString().slice(0, 10);
  }
  return out;
}
