import { prisma } from '../../../lib/prisma.js';
import type { ReviewRecordInput } from '../schema/records.schema.js';
import { recordInclude } from './records.serialize.js';

/** Verifies or rejects a record. Only the hospital that submitted it may. Returns null if it isn't theirs. */
export async function reviewRecord(hospitalUserId: number, recordId: string, input: ReviewRecordInput) {
  const { count } = await prisma.medicalRecord.updateMany({
    where: { id: recordId, hospital: { userId: hospitalUserId } },
    data: { status: input.status, reviewNote: input.note || null, reviewedAt: new Date() }
  });
  if (count === 0) return null;
  return prisma.medicalRecord.findUnique({ where: { id: recordId }, include: recordInclude });
}
