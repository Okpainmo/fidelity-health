import { prisma } from '../../../lib/prisma.js';
import { isoDate, patientDisplayName, photoUrlFor } from './records.serialize.js';

/**
 * Registered (active) patients matching a name, Fidelity Health ID or phone
 * number. Used by hospitals to pick the patient a record belongs to.
 */
export async function searchPatients(query: string) {
  const q = query.trim();
  const patients = await prisma.patientProfile.findMany({
    where: {
      user: { isActive: true, accountType: 'patient' },
      OR: [
        { fhId: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { phone: { contains: q } }
      ]
    },
    include: { user: { select: { name: true } } },
    orderBy: { fhId: 'asc' },
    take: 10
  });

  return Promise.all(
    patients.map(async (patient) => ({
      fhId: patient.fhId,
      name: patientDisplayName(patient),
      dateOfBirth: isoDate(patient.dateOfBirth),
      sexAtBirth: patient.sexAtBirth,
      phone: patient.phone,
      city: patient.city,
      bloodGroup: patient.bloodGroup,
      genotype: patient.genotype,
      allergies: Array.isArray(patient.allergies)
        ? patient.allergies.map((item) => (item && typeof item === 'object' && 'allergen' in item ? String(item.allergen) : '')).filter(Boolean)
        : [],
      noKnownAllergies: patient.noKnownAllergies,
      photoUrl: await photoUrlFor(patient.photoKey)
    }))
  );
}
