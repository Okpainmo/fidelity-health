import { z } from 'zod';

const search = z.string().trim().max(80).optional();

/* GET /api/v1/admin/hospitals */
export const adminHospitalsQuerySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  q: search
});

/* PATCH /api/v1/admin/hospitals/:userId/verification */
export const hospitalVerificationSchema = z
  .object({
    status: z.enum(['pending', 'verified', 'rejected'], { errorMap: () => ({ message: "Status must be 'pending', 'verified' or 'rejected'." }) }),
    note: z.string().trim().max(500, 'Note must be 500 characters or fewer.').optional()
  })
  .strict();

/* GET /api/v1/admin/users */
export const adminUsersQuerySchema = z.object({
  type: z.enum(['patient', 'hospital', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  q: search
});

/* PATCH /api/v1/admin/users/:userId/status */
export const userStatusSchema = z.object({ isActive: z.boolean({ required_error: 'isActive is required.' }) }).strict();

/* GET /api/v1/admin/records */
export const adminRecordsQuerySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  q: search
});

export type HospitalVerificationInput = z.infer<typeof hospitalVerificationSchema>;
