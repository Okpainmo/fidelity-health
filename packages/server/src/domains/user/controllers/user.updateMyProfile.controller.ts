/**
 * @description Update the signed-in account's own profile. The body is
 * validated against the patient or hospital schema based on the account type.
 * @request PATCH
 * @route /api/v1/user/me/profile
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__400, errorHandler__401, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import log from '../../../utils/logger.js';
import { updateHospitalProfile, updatePatientProfile } from '../lib/user.updateOwnProfile.service.js';
import { hospitalProfileUpdateSchema, patientProfileUpdateSchema } from '../schema/profile.schema.js';

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    accountType: 'patient' | 'hospital';
    profile: Record<string, unknown>;
    userProfile: Record<string, unknown>;
    accessToken?: string;
    refreshToken?: string;
  };
};

export const updateMyProfile = async (req: Request, res: Response<ResponseSpecs>) => {
  try {
    const user = req.userData?.user;
    if (!user?.id || !user.email) {
      errorHandler__401({ errorMessage: 'not signed in' }, res);
      return;
    }

    const accountType = user.accountType ?? 'patient';
    const account = { id: user.id, name: user.name ?? '', email: user.email, accountType };

    const parsed = accountType === 'hospital' ? hospitalProfileUpdateSchema.safeParse(req.body) : patientProfileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.join('.');
      const message = issue ? (field ? `${field}: ${issue.message}` : issue.message) : 'invalid profile details';
      errorHandler__400({ errorMessage: message }, res);
      return;
    }

    const result =
      accountType === 'hospital'
        ? await updateHospitalProfile(account, parsed.data as Parameters<typeof updateHospitalProfile>[1])
        : await updatePatientProfile(account, parsed.data as Parameters<typeof updatePatientProfile>[1]);

    if (!result) {
      errorHandler__500(new Error('could not save profile'), res);
      return;
    }

    log.info({ level: 'info', userId: user.id, accountType, fields: Object.keys(parsed.data) }, 'Profile updated');

    res.status(200).json({
      responseMessage: 'Profile updated successfully',
      response: {
        accountType,
        profile: result.profile,
        userProfile: result.userProfile,
        accessToken: req.userData?.newUserAccessToken,
        refreshToken: req.userData?.newUserRefreshToken
      }
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
