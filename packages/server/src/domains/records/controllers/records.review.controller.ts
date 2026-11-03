/**
 * @description Verify or reject a record (the hospital that submitted it)
 * @request PATCH
 * @route /api/v1/records/:recordId/review
 * @access Private (submitting hospital)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__403, errorHandler__404, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import log from '../../../utils/logger.js';
import { respondOk } from '../../../utils/respond.js';
import { viewerFrom } from '../lib/records.account.js';
import { reviewRecord } from '../lib/records.review.service.js';
import { serializeRecordDetail } from '../lib/records.serialize.js';
import type { ReviewRecordInput } from '../schema/records.schema.js';

export const reviewRecordController = async (req: Request, res: Response) => {
  try {
    const viewer = viewerFrom(req.userData?.user);
    if (!viewer) return errorHandler__401({ errorMessage: 'not signed in' }, res);
    if (viewer.accountType !== 'hospital') return errorHandler__403({ errorMessage: 'Only the submitting hospital can review a record.' }, res);

    const record = await reviewRecord(viewer.userId, req.params.recordId as string, req.body as ReviewRecordInput);
    if (!record) return errorHandler__404({ errorMessage: 'record not found' }, res);

    log.info({ level: 'info', recordId: record.id, status: record.status }, 'Medical record reviewed');
    respondOk(req, res, record.status === 'verified' ? 'Record verified' : 'Record rejected', {
      record: await serializeRecordDetail(record, 'hospital')
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
