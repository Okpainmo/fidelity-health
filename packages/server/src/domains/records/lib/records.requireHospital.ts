import type { Response } from 'express';
import { errorHandler__403 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import type { Viewer } from './records.account.js';
import { hospitalProfileOf } from './records.account.js';

/**
 * The viewer's hospital profile, if they're a hospital whose institution has
 * been verified by an admin. Otherwise sends a 403 and returns null.
 */
export async function requireVerifiedHospital(viewer: Viewer, res: Response) {
  if (viewer.accountType !== 'hospital') {
    errorHandler__403({ errorMessage: 'Only hospital accounts can do this.' }, res);
    return null;
  }
  const hospital = await hospitalProfileOf(viewer.userId);
  if (!hospital || hospital.verificationStatus !== 'verified') {
    errorHandler__403({ errorMessage: 'Your institution must be verified by Fidelity Health before it can add records.' }, res);
    return null;
  }
  return hospital;
}
