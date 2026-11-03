/**
 * @description One record with all its details and short-lived links to its files
 * @request GET
 * @route /api/v1/records/:recordId
 * @access Private (the record's patient or hospital, or an admin)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__404, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { respondOk } from '../../../utils/respond.js';
import { viewerFrom } from '../lib/records.account.js';
import { getRecordFor } from '../lib/records.get.service.js';
import { serializeRecordDetail } from '../lib/records.serialize.js';

export const getRecordController = async (req: Request, res: Response) => {
  try {
    const viewer = viewerFrom(req.userData?.user);
    if (!viewer) return errorHandler__401({ errorMessage: 'not signed in' }, res);

    const found = await getRecordFor(viewer, req.params.recordId as string);
    if (!found) return errorHandler__404({ errorMessage: 'record not found' }, res);

    respondOk(req, res, 'Record retrieved successfully', { record: await serializeRecordDetail(found.record, found.view), view: found.view });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
