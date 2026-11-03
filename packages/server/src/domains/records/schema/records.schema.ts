import { z } from 'zod';
import { date, number, requiredDate, requiredText, text } from '../../../utils/zodFields.js';

export const RECORD_TYPES = [
  'outpatient',
  'admission',
  'discharge',
  'lab',
  'imaging',
  'prescription',
  'immunization',
  'surgery',
  'referral',
  'other'
] as const;

/* POST /api/v1/records - multipart: `files` (the attachments) plus `data`, a
   JSON string matching this schema. `attachments[i].category` describes `files[i]`. */
export const createRecordSchema = z
  .object({
    patientFhId: requiredText('Patient', 30),

    // Submission
    recordType: z.enum(RECORD_TYPES, { errorMap: () => ({ message: 'Choose a record type.' }) }),
    department: requiredText('Department', 100),
    officerName: requiredText('Submitting officer', 120),
    officerStaffId: requiredText('Staff ID', 60),
    submittedOn: requiredDate('Date of submission'),

    // Record details
    title: requiredText('Record title', 120),
    encounterDate: requiredDate('Date of visit'),
    clinician: requiredText('Attending clinician', 120),
    clinicianLicence: text(60),
    reason: requiredText('Reason for visit', 1000),
    diagnosis: text(300),
    icd10: z
      .union([
        z
          .string()
          .trim()
          .regex(/^[A-Za-z][0-9]{2}(\.[0-9A-Za-z]{1,4})?$/, 'Use an ICD-10 code like J20 or J20.9.'),
        z.literal('')
      ])
      .transform((value) => (value === '' ? null : value.toUpperCase()))
      .nullable()
      .optional(),
    notes: requiredText('Clinical notes', 10000),
    prescribed: text(4000),
    newAllergies: text(2000),
    followUpDate: date,
    followUpNotes: text(500),

    // Vitals
    bpSystolic: number(50, 260, true),
    bpDiastolic: number(30, 160, true),
    pulse: number(20, 250, true),
    temperatureC: number(30, 45),
    spo2: number(50, 100, true),
    respRate: number(4, 80, true),
    heightCm: number(30, 250),
    weightKg: number(0.5, 400),

    // Consent and declaration
    patientConsent: z.literal(true, { errorMap: () => ({ message: "The patient's consent is required." }) }),
    declaration: z.literal(true, { errorMap: () => ({ message: 'Please confirm the declaration.' }) }),
    consentMethod: requiredText('Consent method', 40),
    visibleToPatient: z.boolean().default(true),
    signature: requiredText('Signature', 120),
    signedOn: requiredDate('Signature date'),

    attachments: z
      .array(z.object({ category: requiredText('Document type', 60) }))
      .min(1, 'Attach at least one file.')
      .max(10, 'Attach at most 10 files.')
  })
  .strict();

export type CreateRecordInput = z.infer<typeof createRecordSchema>;

/* PATCH /api/v1/records/:recordId/review */
export const reviewRecordSchema = z
  .object({
    status: z.enum(['verified', 'rejected'], { errorMap: () => ({ message: "Status must be 'verified' or 'rejected'." }) }),
    note: z.string().trim().max(500, 'Note must be 500 characters or fewer.').optional()
  })
  .strict();

export type ReviewRecordInput = z.infer<typeof reviewRecordSchema>;

/* GET /api/v1/records/patients/search?q= */
export const patientSearchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Type at least 2 characters.').max(80)
});

export const recordParamsSchema = z.object({
  recordId: z.string().uuid('Invalid record ID.')
});
