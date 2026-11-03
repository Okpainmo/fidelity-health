import type { Attachment } from './sections/AttachmentsConsentSections';

// Turns the upload form into the body for POST /records (the server's
// createRecordSchema). Optional fields are sent as '' when empty, which the
// server stores as nothing.
export function buildRecordPayload(form: HTMLFormElement, patientFhId: string, attachments: Attachment[]) {
  const data = new FormData(form);
  const text = (name: string) => {
    const value = data.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };

  return {
    patientFhId,

    // Submission
    recordType: text('recordType'),
    department: text('department'),
    officerName: text('officerName'),
    officerStaffId: text('officerStaffId'),
    submittedOn: text('submittedOn'),

    // Record details
    title: text('recordTitle'),
    encounterDate: text('encounterDate'),
    clinician: text('clinician'),
    clinicianLicence: text('clinicianLicence'),
    reason: text('reason'),
    diagnosis: text('diagnosis'),
    icd10: text('icd10'),
    notes: text('notes'),
    prescribed: text('prescribed'),
    newAllergies: text('newAllergies'),
    followUpDate: text('followUp'),
    followUpNotes: text('followUpNotes'),

    // Vitals
    bpSystolic: text('bpSystolic'),
    bpDiastolic: text('bpDiastolic'),
    pulse: text('pulse'),
    temperatureC: text('temperature'),
    spo2: text('spo2'),
    respRate: text('respRate'),
    heightCm: text('heightCm'),
    weightKg: text('weightKg'),

    // Consent and declaration
    patientConsent: data.has('patientConsent'),
    declaration: data.has('declaration'),
    consentMethod: text('consentMethod'),
    visibleToPatient: data.has('shareWithPatient'),
    signature: text('signature'),
    signedOn: text('signedOn'),

    attachments: attachments.map((item) => ({ category: item.category })),
  };
}
