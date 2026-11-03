import { randomUUID } from 'node:crypto';
import { prisma } from '../../../lib/prisma.js';
import { deleteObjects, putObject, safeFileName } from '../../../utils/storage/s3.js';
import type { CreateRecordInput } from '../schema/records.schema.js';
import { recordInclude } from './records.serialize.js';

export class PatientNotFoundError extends Error {}

// The record's own columns from the validated input (consent and declaration
// are confirmations, not stored; the patient and files are linked separately).
function recordFields(input: CreateRecordInput) {
  return {
    recordType: input.recordType,
    department: input.department,
    officerName: input.officerName,
    officerStaffId: input.officerStaffId,
    submittedOn: input.submittedOn,
    title: input.title,
    encounterDate: input.encounterDate,
    clinician: input.clinician,
    clinicianLicence: input.clinicianLicence,
    reason: input.reason,
    diagnosis: input.diagnosis,
    icd10: input.icd10,
    notes: input.notes,
    prescribed: input.prescribed,
    newAllergies: input.newAllergies,
    followUpDate: input.followUpDate,
    followUpNotes: input.followUpNotes,
    bpSystolic: input.bpSystolic,
    bpDiastolic: input.bpDiastolic,
    pulse: input.pulse,
    temperatureC: input.temperatureC,
    spo2: input.spo2,
    respRate: input.respRate,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    consentMethod: input.consentMethod,
    visibleToPatient: input.visibleToPatient,
    signature: input.signature,
    signedOn: input.signedOn
  };
}

/**
 * Creates a record for a registered patient. Files go to S3 first; if saving
 * the record then fails, the uploaded files are deleted again.
 */
export async function createRecord(hospitalProfileId: number, input: CreateRecordInput, files: Express.Multer.File[]) {
  const patient = await prisma.patientProfile.findUnique({ where: { fhId: input.patientFhId }, include: { user: { select: { isActive: true } } } });
  if (!patient || !patient.user.isActive) throw new PatientNotFoundError('patient not found or not registered');

  const recordId = randomUUID();
  const uploaded: string[] = [];

  try {
    const attachments = [];
    for (const [index, file] of files.entries()) {
      const storageKey = `records/${recordId}/${randomUUID()}-${safeFileName(file.originalname)}`;
      await putObject('files', storageKey, file.buffer, file.mimetype || 'application/octet-stream');
      uploaded.push(storageKey);
      attachments.push({
        fileName: file.originalname,
        contentType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size,
        category: input.attachments[index]?.category ?? 'Other',
        storageKey
      });
    }

    return await prisma.medicalRecord.create({
      data: {
        ...recordFields(input),
        id: recordId,
        patientProfileId: patient.id,
        hospitalProfileId,
        attachments: { create: attachments }
      },
      include: recordInclude
    });
  } catch (error) {
    await deleteObjects('files', uploaded);
    throw error;
  }
}
