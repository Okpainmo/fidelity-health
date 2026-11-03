/**
 * Admin dashboard endpoints (all under /api/v1/admin, admins only):
 *   GET   /overview                         platform counts, pending institutions, recent records
 *   GET   /hospitals?status=&q=             institutions
 *   GET   /hospitals/:userId                one institution's full profile
 *   PATCH /hospitals/:userId/verification   { status, note? } verify / decline / reset
 *   GET   /users?type=&status=&q=           all accounts
 *   GET   /users/:userId                    one account with its profile
 *   PATCH /users/:userId/status             { isActive } activate / deactivate
 *   GET   /records?status=&q=               every medical record
 */

import type { Request, Response } from 'express';
import { errorHandler__400, errorHandler__404, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import log from '../../../utils/logger.js';
import { respondOk } from '../../../utils/respond.js';
import { firstIssue } from '../../../utils/zodFields.js';
import {
  getHospital,
  getOverview,
  getUser,
  listAllRecords,
  listHospitals,
  listUsers,
  setHospitalVerification,
  setUserActive
} from '../lib/admin.services.js';
import { adminHospitalsQuerySchema, adminRecordsQuerySchema, adminUsersQuerySchema } from '../schema/admin.schema.js';
import type { HospitalVerificationInput } from '../schema/admin.schema.js';

const userIdOf = (req: Request) => Number(req.params.userId);

export const adminOverview = async (req: Request, res: Response) => {
  try {
    respondOk(req, res, 'Overview retrieved successfully', { overview: await getOverview() });
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminListHospitals = async (req: Request, res: Response) => {
  try {
    const parsed = adminHospitalsQuerySchema.safeParse(req.query);
    if (!parsed.success) return errorHandler__400({ errorMessage: firstIssue(parsed.error) }, res);
    respondOk(req, res, 'Institutions retrieved successfully', { hospitals: await listHospitals(parsed.data) });
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminGetHospital = async (req: Request, res: Response) => {
  try {
    const hospital = await getHospital(userIdOf(req));
    if (!hospital) return errorHandler__404({ errorMessage: 'institution not found' }, res);
    respondOk(req, res, 'Institution retrieved successfully', { hospital });
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminSetHospitalVerification = async (req: Request, res: Response) => {
  try {
    const input = req.body as HospitalVerificationInput;
    const hospital = await setHospitalVerification(userIdOf(req), input);
    if (!hospital) return errorHandler__404({ errorMessage: 'institution not found' }, res);

    log.info(
      { level: 'info', adminId: req.userData?.user?.id, hospitalUserId: userIdOf(req), status: input.status },
      'Institution verification updated'
    );
    respondOk(req, res, 'Verification updated', { hospital });
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminListUsers = async (req: Request, res: Response) => {
  try {
    const parsed = adminUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) return errorHandler__400({ errorMessage: firstIssue(parsed.error) }, res);
    respondOk(req, res, 'Users retrieved successfully', { users: await listUsers(parsed.data) });
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminGetUser = async (req: Request, res: Response) => {
  try {
    const user = await getUser(userIdOf(req));
    if (!user) return errorHandler__404({ errorMessage: 'user not found' }, res);
    respondOk(req, res, 'User retrieved successfully', user);
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminSetUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = userIdOf(req);
    const { isActive } = req.body as { isActive: boolean };
    if (!isActive && userId === req.userData?.user?.id) {
      return errorHandler__400({ errorMessage: "You can't deactivate your own account." }, res);
    }

    const user = await setUserActive(userId, isActive);
    if (!user) return errorHandler__404({ errorMessage: 'user not found' }, res);

    log.info({ level: 'info', adminId: req.userData?.user?.id, userId, isActive }, 'User status updated');
    respondOk(req, res, isActive ? 'Account activated' : 'Account deactivated', user);
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const adminListRecords = async (req: Request, res: Response) => {
  try {
    const parsed = adminRecordsQuerySchema.safeParse(req.query);
    if (!parsed.success) return errorHandler__400({ errorMessage: firstIssue(parsed.error) }, res);
    respondOk(req, res, 'Records retrieved successfully', { records: await listAllRecords(parsed.data) });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
