/**
 * @description Upload (PUT, multipart `photo`) or remove (DELETE) the signed-in patient's passport photo
 * @route /api/v1/user/me/profile/photo
 * @access Private (patients)
 */

import type { Request, Response } from 'express';
import {
  errorHandler__400,
  errorHandler__401,
  errorHandler__403,
  errorHandler__500,
  errorHandler__503
} from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { respondOk } from '../../../utils/respond.js';
import { isStorageEnabled } from '../../../utils/storage/s3.js';
import { removePatientPhoto, setPatientPhoto } from '../lib/user.profilePhoto.service.js';

function patientFrom(req: Request, res: Response) {
  const user = req.userData?.user;
  if (!user?.id || !user.email) {
    errorHandler__401({ errorMessage: 'not signed in' }, res);
    return null;
  }
  if ((user.accountType ?? 'patient') !== 'patient') {
    errorHandler__403({ errorMessage: 'Only patient accounts have a profile photo.' }, res);
    return null;
  }
  if (!isStorageEnabled('images')) {
    errorHandler__503({ errorMessage: "Image storage isn't configured on the server, so photos can't be saved yet." }, res);
    return null;
  }
  return { id: user.id, name: user.name ?? '', email: user.email, accountType: 'patient' as const };
}

export const uploadMyPhoto = async (req: Request, res: Response) => {
  try {
    const user = patientFrom(req, res);
    if (!user) return;
    if (!req.file) return errorHandler__400({ errorMessage: 'Choose a photo to upload.' }, res);

    const photoUrl = await setPatientPhoto(user, req.file);
    respondOk(req, res, 'Photo updated', { photoUrl });
  } catch (error) {
    errorHandler__500(error, res);
  }
};

export const deleteMyPhoto = async (req: Request, res: Response) => {
  try {
    const user = patientFrom(req, res);
    if (!user) return;

    await removePatientPhoto(user.id);
    respondOk(req, res, 'Photo removed', { photoUrl: null });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
