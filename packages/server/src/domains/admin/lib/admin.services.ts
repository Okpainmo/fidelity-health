import { prisma } from '../../../lib/prisma.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { serializeProfile } from '../../user/lib/user.profileHelpers.js';
import { recordInclude, serializeRecordSummary } from '../../records/lib/records.serialize.js';
import type { HospitalVerificationInput } from '../schema/admin.schema.js';

/* Admin data access: platform overview, institutions, users and records. */

const DAY = 24 * 60 * 60 * 1000;
const LIST_LIMIT = 200;

const publicUser = { id: true, name: true, email: true, accountType: true, isAdmin: true, isActive: true, createdAt: true, updatedAt: true } as const;

// { pending: 3, verified: 10, rejected: 0 } from grouped counts (missing statuses count as 0).
function countByStatus<T extends string>(rows: { status: string; count: number }[], statuses: readonly T[]) {
  return Object.fromEntries(statuses.map((status) => [status, rows.find((row) => row.status === status)?.count ?? 0])) as Record<T, number>;
}

export async function getOverview() {
  const since = new Date(Date.now() - 30 * DAY);
  const [patients, hospitals, admins, inactive, signups30d, hospitalStatuses, recordStatuses, records30d, pendingHospitals, recentRecords] =
    await Promise.all([
      prisma.user.count({ where: { accountType: 'patient' } }),
      prisma.user.count({ where: { accountType: 'hospital' } }),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.hospitalProfile.groupBy({ by: ['verificationStatus'], _count: { _all: true } }),
      prisma.medicalRecord.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.medicalRecord.count({ where: { createdAt: { gte: since } } }),
      prisma.hospitalProfile.findMany({
        where: { verificationStatus: 'pending' },
        include: { user: { select: publicUser } },
        orderBy: { createdAt: 'asc' },
        take: 5
      }),
      prisma.medicalRecord.findMany({ include: recordInclude, orderBy: { createdAt: 'desc' }, take: 6 })
    ]);

  const hospitalCounts = countByStatus(
    hospitalStatuses.map((row) => ({ status: row.verificationStatus, count: row._count._all })),
    ['pending', 'verified', 'rejected']
  );
  const recordCounts = countByStatus(
    recordStatuses.map((row) => ({ status: row.status, count: row._count._all })),
    ['pending', 'verified', 'rejected']
  );

  return {
    users: { patients, hospitals, admins, inactive, total: patients + hospitals, signupsLast30Days: signups30d },
    hospitals: hospitalCounts,
    records: {
      ...recordCounts,
      total: recordCounts.pending + recordCounts.verified + recordCounts.rejected,
      lastThirtyDays: records30d
    },
    pendingHospitals: pendingHospitals.map(hospitalListItem),
    recentRecords: recentRecords.map(serializeRecordSummary)
  };
}

type HospitalWithUser = Prisma.HospitalProfileGetPayload<{ include: { user: { select: typeof publicUser } } }> & { _count?: { records: number } };

function hospitalListItem(hospital: HospitalWithUser) {
  return {
    userId: hospital.userId,
    institutionId: hospital.institutionId,
    name: hospital.user.name,
    email: hospital.user.email,
    isActive: hospital.user.isActive,
    verificationStatus: hospital.verificationStatus,
    verifiedAt: hospital.verifiedAt,
    institutionType: hospital.institutionType,
    city: hospital.city,
    region: hospital.region,
    licenceNumber: hospital.licenceNumber,
    recordCount: hospital._count?.records ?? 0,
    createdAt: hospital.user.createdAt
  };
}

export async function listHospitals(filters: { status?: 'pending' | 'verified' | 'rejected'; q?: string }) {
  const q = filters.q?.trim();
  const hospitals = await prisma.hospitalProfile.findMany({
    where: {
      verificationStatus: filters.status,
      ...(q
        ? {
            OR: [
              { institutionId: { contains: q, mode: 'insensitive' } },
              { licenceNumber: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
              { user: { name: { contains: q, mode: 'insensitive' } } },
              { user: { email: { contains: q, mode: 'insensitive' } } }
            ]
          }
        : {})
    },
    include: { user: { select: publicUser }, _count: { select: { records: true } } },
    orderBy: { createdAt: 'desc' },
    take: LIST_LIMIT
  });
  return hospitals.map(hospitalListItem);
}

export async function getHospital(userId: number) {
  const hospital = await prisma.hospitalProfile.findUnique({
    where: { userId },
    include: { user: { select: publicUser }, _count: { select: { records: true } } }
  });
  if (!hospital) return null;
  const { user, _count, ...profile } = hospital;
  return { user, recordCount: _count.records, profile: await serializeProfile(profile) };
}

export async function setHospitalVerification(userId: number, input: HospitalVerificationInput) {
  const { count } = await prisma.hospitalProfile.updateMany({
    where: { userId },
    data: {
      verificationStatus: input.status,
      verificationNote: input.note || null,
      verifiedAt: input.status === 'verified' ? new Date() : null
    }
  });
  return count > 0 ? getHospital(userId) : null;
}

export async function listUsers(filters: { type?: 'patient' | 'hospital' | 'admin'; status?: 'active' | 'inactive'; q?: string }) {
  const q = filters.q?.trim();
  const users = await prisma.user.findMany({
    where: {
      ...(filters.type === 'admin' ? { isAdmin: true } : filters.type ? { accountType: filters.type } : {}),
      ...(filters.status ? { isActive: filters.status === 'active' } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { patientProfile: { fhId: { contains: q, mode: 'insensitive' } } },
              { hospitalProfile: { institutionId: { contains: q, mode: 'insensitive' } } }
            ]
          }
        : {})
    },
    select: {
      ...publicUser,
      patientProfile: { select: { fhId: true, _count: { select: { records: true } } } },
      hospitalProfile: { select: { institutionId: true, verificationStatus: true, _count: { select: { records: true } } } }
    },
    orderBy: { createdAt: 'desc' },
    take: LIST_LIMIT
  });

  return users.map(({ patientProfile, hospitalProfile, ...user }) => ({
    ...user,
    publicId: patientProfile?.fhId ?? hospitalProfile?.institutionId ?? null,
    verificationStatus: hospitalProfile?.verificationStatus ?? null,
    recordCount: patientProfile?._count.records ?? hospitalProfile?._count.records ?? 0
  }));
}

export async function getUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...publicUser, patientProfile: true, hospitalProfile: true }
  });
  if (!user) return null;
  const { patientProfile, hospitalProfile, ...account } = user;
  const profile = patientProfile ?? hospitalProfile;
  const recordCount = patientProfile
    ? await prisma.medicalRecord.count({ where: { patientProfileId: patientProfile.id } })
    : hospitalProfile
      ? await prisma.medicalRecord.count({ where: { hospitalProfileId: hospitalProfile.id } })
      : 0;
  return { user: account, recordCount, profile: profile ? await serializeProfile(profile) : null };
}

export async function setUserActive(userId: number, isActive: boolean) {
  const { count } = await prisma.user.updateMany({ where: { id: userId }, data: { isActive } });
  return count > 0 ? getUser(userId) : null;
}

export async function listAllRecords(filters: { status?: 'pending' | 'verified' | 'rejected'; q?: string }) {
  const q = filters.q?.trim();
  const records = await prisma.medicalRecord.findMany({
    where: {
      status: filters.status,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { clinician: { contains: q, mode: 'insensitive' } },
              { patient: { fhId: { contains: q, mode: 'insensitive' } } },
              { patient: { user: { name: { contains: q, mode: 'insensitive' } } } },
              { hospital: { user: { name: { contains: q, mode: 'insensitive' } } } }
            ]
          }
        : {})
    },
    include: recordInclude,
    orderBy: { createdAt: 'desc' },
    take: LIST_LIMIT
  });
  return records.map(serializeRecordSummary);
}
