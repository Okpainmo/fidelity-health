import { prisma } from '../../../lib/prisma.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { Viewer } from './records.account.js';
import { recordInclude } from './records.serialize.js';

/**
 * The records a viewer may see:
 * - hospitals: everything they submitted;
 * - patients: their own verified and pending records that are visible to them.
 */
export async function listRecordsFor(viewer: Viewer) {
  let where: Prisma.MedicalRecordWhereInput;

  if (viewer.accountType === 'hospital') {
    where = { hospital: { userId: viewer.userId } };
  } else {
    where = { patient: { userId: viewer.userId }, visibleToPatient: true, status: { not: 'rejected' } };
  }

  return prisma.medicalRecord.findMany({ where, include: recordInclude, orderBy: [{ encounterDate: 'desc' }, { createdAt: 'desc' }], take: 500 });
}
