import type { Prisma } from '../../../../generated/prisma/client.js';
import { isStorageEnabled, signedUrl } from '../../../utils/storage/s3.js';

// Relations loaded with every record.
export const recordInclude = {
  patient: { include: { user: { select: { name: true } } } },
  hospital: { include: { user: { select: { name: true } } } },
  attachments: { orderBy: { createdAt: 'asc' } }
} satisfies Prisma.MedicalRecordInclude;

export type RecordWithRelations = Prisma.MedicalRecordGetPayload<{ include: typeof recordInclude }>;

// Who is looking at a record decides how much of it they get.
export type RecordViewer = 'patient' | 'hospital' | 'admin';

export const recordReference = (number: number) => `FHR-${String(number).padStart(6, '0')}`;

export const isoDate = (value: Date | null | undefined) => (value ? value.toISOString().slice(0, 10) : null);

export function patientDisplayName(patient: { firstName: string | null; lastName: string | null; user: { name: string } }) {
  return [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.user.name;
}

function allergyNames(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === 'object' && 'allergen' in item ? String((item as { allergen: unknown }).allergen) : ''))
    .filter(Boolean);
}

export async function photoUrlFor(photoKey: string | null) {
  if (!photoKey || !isStorageEnabled('images')) return null;
  try {
    return await signedUrl('images', photoKey, { expiresIn: 3600 });
  } catch {
    return null;
  }
}

/** The short form used in lists. */
export function serializeRecordSummary(record: RecordWithRelations) {
  return {
    id: record.id,
    reference: recordReference(record.number),
    recordType: record.recordType,
    title: record.title,
    department: record.department,
    clinician: record.clinician,
    encounterDate: isoDate(record.encounterDate),
    submittedOn: isoDate(record.submittedOn),
    status: record.status,
    createdAt: record.createdAt,
    attachmentCount: record.attachments.length,
    patient: { fhId: record.patient.fhId, name: patientDisplayName(record.patient) },
    hospital: { institutionId: record.hospital.institutionId, name: record.hospital.user.name }
  };
}

/** Everything about a record, with short-lived links to its files. */
export async function serializeRecordDetail(record: RecordWithRelations, viewer: RecordViewer) {
  const filesEnabled = isStorageEnabled('files');
  const attachments = await Promise.all(
    record.attachments.map(async (file) => ({
      id: file.id,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      category: file.category,
      url: filesEnabled ? await signedUrl('files', file.storageKey) : null,
      downloadUrl: filesEnabled ? await signedUrl('files', file.storageKey, { downloadName: file.fileName }) : null
    }))
  );

  const forStaff = viewer !== 'patient';
  const { patient, hospital } = record;

  return {
    ...serializeRecordSummary(record),
    officerName: record.officerName,
    officerStaffId: forStaff ? record.officerStaffId : null,
    clinicianLicence: record.clinicianLicence,
    reason: record.reason,
    diagnosis: record.diagnosis,
    icd10: record.icd10,
    notes: record.notes,
    prescribed: record.prescribed,
    newAllergies: record.newAllergies,
    followUpDate: isoDate(record.followUpDate),
    followUpNotes: record.followUpNotes,
    vitals: {
      bpSystolic: record.bpSystolic,
      bpDiastolic: record.bpDiastolic,
      pulse: record.pulse,
      temperatureC: record.temperatureC,
      spo2: record.spo2,
      respRate: record.respRate,
      heightCm: record.heightCm,
      weightKg: record.weightKg
    },
    consentMethod: record.consentMethod,
    visibleToPatient: record.visibleToPatient,
    signature: forStaff ? record.signature : null,
    signedOn: isoDate(record.signedOn),
    reviewNote: forStaff ? record.reviewNote : null,
    reviewedAt: record.reviewedAt,
    attachments,
    patient: {
      fhId: patient.fhId,
      name: patientDisplayName(patient),
      dateOfBirth: isoDate(patient.dateOfBirth),
      sexAtBirth: patient.sexAtBirth,
      phone: forStaff ? patient.phone : null,
      bloodGroup: patient.bloodGroup,
      genotype: patient.genotype,
      allergies: allergyNames(patient.allergies),
      noKnownAllergies: patient.noKnownAllergies,
      photoUrl: forStaff ? await photoUrlFor(patient.photoKey) : null
    },
    hospital: {
      institutionId: hospital.institutionId,
      name: hospital.user.name,
      city: hospital.city,
      phone: hospital.phone,
      contactEmail: hospital.contactEmail
    }
  };
}
