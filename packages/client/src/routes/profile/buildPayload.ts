import type { AccountType } from '@/utils/authStorage';

// Turns the submitted profile form into the PATCH /user/me/profile body.
// Every known field is sent: a field that isn't on screen (e.g. insurance
// details after choosing "Self-pay") is sent as '' so the server clears it.

const PATIENT_TEXT_FIELDS = [
  'title', 'firstName', 'middleName', 'lastName', 'preferredName', 'dateOfBirth', 'sexAtBirth', 'maritalStatus',
  'nationality', 'preferredLanguage', 'occupation', 'idType', 'idNumber',
  'phone', 'altPhone', 'contactEmail', 'address1', 'address2', 'city', 'region', 'postalCode', 'country',
  'kinName', 'kinRelationship', 'kinPhone', 'kinEmail', 'kinAddress', 'emergencyName', 'emergencyRelationship', 'emergencyPhone',
  'paymentType', 'insuranceProvider', 'policyNumber', 'groupNumber', 'policyHolder', 'holderRelationship', 'policyExpiry',
  'bloodGroup', 'genotype', 'heightCm', 'weightKg', 'otherConditions', 'pastSurgeries', 'familyHistory', 'smoking', 'alcohol',
  'disability', 'pregnancy',
] as const;

const HOSPITAL_TEXT_FIELDS = [
  'institutionName', 'institutionType', 'ownership', 'licenceNumber', 'licenceExpiry', 'yearEstablished', 'beds', 'accreditation',
  'address1', 'address2', 'city', 'region', 'postalCode', 'country', 'phone', 'emergencyPhone', 'contactEmail', 'website',
  'otherServices', 'emrSystem',
  'recordsAdminName', 'recordsAdminRole', 'recordsAdminEmail', 'recordsAdminPhone', 'dpoName', 'dpoEmail', 'dpoPhone',
] as const;

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

// Zips repeated inputs (one per row) into objects, skipping rows whose first field is empty.
function zipRows<K extends string>(form: FormData, fields: Record<K, string>): Record<K, string>[] {
  const keys = Object.keys(fields) as K[];
  const columns = keys.map((key) => form.getAll(fields[key]).map((value) => (typeof value === 'string' ? value.trim() : '')));
  const count = Math.max(0, ...columns.map((column) => column.length));
  const result: Record<K, string>[] = [];
  for (let i = 0; i < count; i += 1) {
    const row = Object.fromEntries(keys.map((key, k) => [key, columns[k][i] ?? ''])) as Record<K, string>;
    if (row[keys[0]]) result.push(row);
  }
  return result;
}

export function buildProfilePayload(accountType: AccountType, formElement: HTMLFormElement): Record<string, unknown> {
  const form = new FormData(formElement);

  if (accountType === 'hospital') {
    const payload: Record<string, unknown> = Object.fromEntries(HOSPITAL_TEXT_FIELDS.map((name) => [name, text(form, name)]));
    payload.departments = form.getAll('departments').filter((value): value is string => typeof value === 'string');
    return payload;
  }

  const payload: Record<string, unknown> = Object.fromEntries(PATIENT_TEXT_FIELDS.map((name) => [name, text(form, name)]));
  payload.emergencySameAsKin = form.has('emergencySameAsKin');
  payload.chronicConditions = form.getAll('chronicConditions').filter((value): value is string => typeof value === 'string');
  payload.noKnownAllergies = form.has('noKnownAllergies');
  payload.allergies = payload.noKnownAllergies ? [] : zipRows(form, { allergen: 'allergen', reaction: 'allergyReaction', severity: 'allergySeverity' });
  payload.medications = zipRows(form, { name: 'medication', dose: 'medicationDose', frequency: 'medicationFrequency' });
  return payload;
}
