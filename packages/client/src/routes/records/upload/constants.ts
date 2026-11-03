// Sections of the upload form, in order. Used for the side navigation.
export const UPLOAD_SECTIONS = [
  { id: 'submission', title: 'Submission details' },
  { id: 'patient', title: 'Patient' },
  { id: 'encounter', title: 'Record details' },
  { id: 'vitals', title: 'Vitals' },
  { id: 'attachments', title: 'Attachments' },
  { id: 'consent', title: 'Consent and declaration' },
] as const;

export const MAX_FILE_SIZE_MB = 25;
export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.dcm,.doc,.docx';
