/**
 * @description Get the signed-in account's own profile (patient or hospital)
 * @request GET
 * @route /api/v1/user/me/profile
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import log from '../../../utils/logger.js';
import { getOwnProfile } from '../lib/user.getOwnProfile.service.js';

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    accountType: 'patient' | 'hospital';
    profile: Record<string, unknown>;
    accessToken?: string;
    refreshToken?: string;
  };
};

export const getMyProfile = async (req: Request, res: Response<ResponseSpecs>) => {
  try {
    const user = req.userData?.user;
    if (!user?.id || !user.email) {
      errorHandler__401({ errorMessage: 'not signed in' }, res);
      return;
    }

    const accountType = user.accountType ?? 'patient';
    const profile = await getOwnProfile({ id: user.id, name: user.name ?? '', email: user.email, accountType });
    if (!profile) {
      errorHandler__500(new Error('could not load profile'), res);
      return;
    }

    log.info({ level: 'info', userId: user.id, accountType }, 'Profile retrieved');

    res.status(200).json({
      responseMessage: 'Profile retrieved successfully',
      response: {
        accountType,
        profile,
        accessToken: req.userData?.newUserAccessToken,
        refreshToken: req.userData?.newUserRefreshToken
      }
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
