// Option lists for the records and profile forms. Record type values match
// the server's RecordType enum.

export const RECORD_TYPES = [
  { value: 'outpatient', label: 'Outpatient visit' },
  { value: 'admission', label: 'Admission' },
  { value: 'discharge', label: 'Discharge summary' },
  { value: 'lab', label: 'Lab result' },
  { value: 'imaging', label: 'Imaging / radiology' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'immunization', label: 'Immunisation' },
  { value: 'surgery', label: 'Surgical report' },
  { value: 'referral', label: 'Referral letter' },
  { value: 'other', label: 'Other' },
] as const;

export type RecordTypeValue = (typeof RECORD_TYPES)[number]['value'];

export function recordTypeLabel(value: RecordTypeValue) {
  return RECORD_TYPES.find((type) => type.value === value)?.label ?? 'Record';
}

export const DEPARTMENTS = [
  'General outpatient',
  'Accident & emergency',
  'Internal medicine',
  'Surgery',
  'Paediatrics',
  'Obstetrics & gynaecology',
  'Cardiology',
  'Radiology',
  'Laboratory',
  'Pharmacy',
  'Other',
] as const;

// Hospital profile options.
export const INSTITUTION_TYPES = [
  'General hospital',
  'Teaching hospital',
  'Specialist hospital',
  'Children’s hospital',
  'Clinic / medical centre',
  'Diagnostic laboratory',
  'Imaging centre',
  'Other',
] as const;
export const OWNERSHIP_TYPES = ['Public / government', 'Private', 'Faith-based / mission', 'Non-profit'] as const;

export const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Prof', 'Master'] as const;
export const SEXES = ['Female', 'Male', 'Intersex'] as const;
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Separated', 'Widowed', 'Prefer not to say'] as const;
export const ID_TYPES = ['National ID', 'Passport', 'Driver’s licence', 'Voter’s card', 'Birth certificate', 'Other'] as const;
export const RELATIONSHIPS = ['Spouse / partner', 'Parent', 'Child', 'Sibling', 'Guardian', 'Relative', 'Friend', 'Other'] as const;
export const PAYMENT_TYPES = ['Self-pay', 'Private insurance', 'Government health scheme', 'Employer-sponsored', 'Other'] as const;
export const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'] as const;
export const GENOTYPES = ['AA', 'AS', 'AC', 'SS', 'SC', 'Unknown'] as const;
export const CHRONIC_CONDITIONS = [
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Sickle cell disease',
  'Heart disease',
  'Chronic kidney disease',
  'Epilepsy',
  'HIV',
  'Hepatitis B / C',
  'Cancer',
  'Mental health condition',
] as const;
export const SMOKING_STATUSES = ['Never', 'Former', 'Current', 'Unknown'] as const;
export const ALCOHOL_USE = ['None', 'Occasional', 'Regular', 'Unknown'] as const;
export const ALLERGY_SEVERITIES = ['Mild', 'Moderate', 'Severe', 'Life-threatening'] as const;
export const CONSENT_METHODS = ['Written', 'Verbal (witnessed)', 'Electronic'] as const;
export const ATTACHMENT_CATEGORIES = ['Clinical notes', 'Lab report', 'Imaging', 'Prescription', 'Consent form', 'ID document', 'Other'] as const;
