// Public IDs shown to users, derived from the numeric user id so they're
// stable and unique. Patients: FH-1012-4387. Institutions: FHI-0012.
export function patientFhId(userId: number): string {
  return `FH-${1000 + userId}-${String((userId * 7919) % 10000).padStart(4, '0')}`;
}

export function institutionId(userId: number): string {
  return `FHI-${String(userId).padStart(4, '0')}`;
}
