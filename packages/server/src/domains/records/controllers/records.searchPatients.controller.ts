/**
 * @description Search registered patients by name, Fidelity Health ID or phone (verified hospitals only)
 * @request GET
 * @route /api/v1/records/patients/search?q=
 * @access Private (verified hospital)
 */

import type { Request, Response } from 'express';
import { errorHandler__400, errorHandler__401, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { respondOk } from '../../../utils/respond.js';
import { firstIssue } from '../../../utils/zodFields.js';
import { viewerFrom } from '../lib/records.account.js';
import { requireVerifiedHospital } from '../lib/records.requireHospital.js';
import { searchPatients } from '../lib/records.searchPatients.service.js';
import { patientSearchQuerySchema } from '../schema/records.schema.js';

export const searchPatientsController = async (req: Request, res: Response) => {
  try {
    const viewer = viewerFrom(req.userData?.user);
    if (!viewer) return errorHandler__401({ errorMessage: 'not signed in' }, res);
    if (!(await requireVerifiedHospital(viewer, res))) return;

    const parsed = patientSearchQuerySchema.safeParse(req.query);
    if (!parsed.success) return errorHandler__400({ errorMessage: firstIssue(parsed.error) }, res);

    const patients = await searchPatients(parsed.data.q);
    respondOk(req, res, 'Patients retrieved successfully', { patients });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
