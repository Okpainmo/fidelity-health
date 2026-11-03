/**
 * @description List the records the signed-in account may see (own records for patients, submitted records for hospitals)
 * @request GET
 * @route /api/v1/records
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { respondOk } from '../../../utils/respond.js';
import { viewerFrom } from '../lib/records.account.js';
import { listRecordsFor } from '../lib/records.list.service.js';
import { serializeRecordSummary } from '../lib/records.serialize.js';

export const listRecordsController = async (req: Request, res: Response) => {
  try {
    const viewer = viewerFrom(req.userData?.user);
    if (!viewer) return errorHandler__401({ errorMessage: 'not signed in' }, res);

    const records = await listRecordsFor(viewer);
    respondOk(req, res, 'Records retrieved successfully', { records: records.map(serializeRecordSummary) });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
