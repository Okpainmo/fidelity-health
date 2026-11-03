import { prisma } from '../../../lib/prisma.js';
import type { Viewer } from './records.account.js';
import type { RecordViewer } from './records.serialize.js';
import { recordInclude } from './records.serialize.js';

/**
 * One record, if the viewer may see it - with which view they get. Hospitals
 * see records they submitted; patients see their own (not rejected, visible to
 * them); admins see everything. Returns null otherwise.
 */
export async function getRecordFor(viewer: Viewer, recordId: string) {
  const record = await prisma.medicalRecord.findUnique({ where: { id: recordId }, include: { ...recordInclude } });
  if (!record) return null;

  // A record's own hospital and patient see it in their role, even if they're also admins.
  let view: RecordViewer | null = null;
  if (record.hospital.userId === viewer.userId) view = 'hospital';
  else if (record.patient.userId === viewer.userId && record.visibleToPatient && record.status !== 'rejected') view = 'patient';
  else if (viewer.isAdmin) view = 'admin';

  return view ? { record, view } : null;
}
