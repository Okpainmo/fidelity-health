import { Router } from 'express';
import { adminRoutesProtector } from '../../../middlewares/adminRoutesProtectorMiddleware.js';
import accessMiddleware from '../../../middlewares/auth.access.middleware.js';
import sessionsMiddleware from '../../../middlewares/auth.sessions.middleware.js';
import { validateData } from '../../../middlewares/validateData.middleware.js';
import { userIdParamsSchema, userSchema } from '../../user/schema/user.schema.js';
import {
  adminGetHospital,
  adminGetUser,
  adminListHospitals,
  adminListRecords,
  adminListUsers,
  adminOverview,
  adminSetHospitalVerification,
  adminSetUserStatus
} from '../controllers/admin.dashboard.controller.js';
import { deactivateUser } from '../controllers/admin.deactivateUser.controller.js';
import { hospitalVerificationSchema, userStatusSchema } from '../schema/admin.schema.js';

const router = Router();

// Every admin route: a valid session, then the admin check.
const adminOnly = [sessionsMiddleware, accessMiddleware, adminRoutesProtector];
const userParams = validateData({ params: userIdParamsSchema });

router.get('/overview', ...adminOnly, adminOverview);

router.get('/hospitals', ...adminOnly, adminListHospitals);
router.get('/hospitals/:userId', userParams, ...adminOnly, adminGetHospital);
router.patch(
  '/hospitals/:userId/verification',
  validateData({ params: userIdParamsSchema, body: hospitalVerificationSchema }),
  ...adminOnly,
  adminSetHospitalVerification
);

router.get('/users', ...adminOnly, adminListUsers);
router.get('/users/:userId', userParams, ...adminOnly, adminGetUser);
router.patch('/users/:userId/status', validateData({ params: userIdParamsSchema, body: userStatusSchema }), ...adminOnly, adminSetUserStatus);

router.get('/records', ...adminOnly, adminListRecords);

// Older endpoint, kept for compatibility. Prefer PATCH /users/:userId/status.
router.patch('/deactivate-user/:userId', validateData({ params: userIdParamsSchema, body: userSchema }), ...adminOnly, deactivateUser);

export default router;
