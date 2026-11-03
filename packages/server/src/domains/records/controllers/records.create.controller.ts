/**
 * @description Upload a medical record for a registered patient (verified hospitals only)
 * @request POST (multipart/form-data: `data` JSON + `files`)
 * @route /api/v1/records
 * @access Private (verified hospital)
 */

import type { Request, Response } from 'express';
import {
  errorHandler__400,
  errorHandler__401,
  errorHandler__404,
  errorHandler__500,
  errorHandler__503
} from '../../../utils/errorHandlers/codedErrorHandlers.js';
import log from '../../../utils/logger.js';
import { respondOk } from '../../../utils/respond.js';
import { isStorageEnabled, StorageNotConfiguredError } from '../../../utils/storage/s3.js';
import { firstIssue } from '../../../utils/zodFields.js';
import { viewerFrom } from '../lib/records.account.js';
import { createRecord, PatientNotFoundError } from '../lib/records.create.service.js';
import { requireVerifiedHospital } from '../lib/records.requireHospital.js';
import { serializeRecordDetail } from '../lib/records.serialize.js';
import { createRecordSchema } from '../schema/records.schema.js';

export const createRecordController = async (req: Request, res: Response) => {
  try {
    const viewer = viewerFrom(req.userData?.user);
    if (!viewer) return errorHandler__401({ errorMessage: 'not signed in' }, res);
    const hospital = await requireVerifiedHospital(viewer, res);
    if (!hospital) return;

    if (!isStorageEnabled('files')) {
      return errorHandler__503({ errorMessage: "File storage isn't configured on the server, so records can't be uploaded yet." }, res);
    }

    let body: unknown;
    try {
      body = JSON.parse(typeof req.body?.data === 'string' ? req.body.data : '');
    } catch {
      return errorHandler__400({ errorMessage: 'The record details (`data`) must be valid JSON.' }, res);
    }

    const parsed = createRecordSchema.safeParse(body);
    if (!parsed.success) return errorHandler__400({ errorMessage: firstIssue(parsed.error) }, res);

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) return errorHandler__400({ errorMessage: 'Attach at least one file.' }, res);
    if (files.length !== parsed.data.attachments.length) {
      return errorHandler__400({ errorMessage: 'Each attached file needs a document type.' }, res);
    }

    const record = await createRecord(hospital.id, parsed.data, files);
    log.info({ level: 'info', recordId: record.id, hospitalId: hospital.id, files: files.length }, 'Medical record created');

    respondOk(req, res, 'Record submitted for review', { record: await serializeRecordDetail(record, 'hospital') }, 201);
  } catch (error) {
    if (error instanceof PatientNotFoundError) return errorHandler__404({ errorMessage: 'No registered patient has that Fidelity Health ID.' }, res);
    if (error instanceof StorageNotConfiguredError) return errorHandler__503({ errorMessage: "File storage isn't configured on the server." }, res);
    errorHandler__500(error, res);
  }
};
