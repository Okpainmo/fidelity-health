import { Router } from 'express';
import accessMiddleware from '../../../middlewares/auth.access.middleware.js';
import sessionsMiddleware from '../../../middlewares/auth.sessions.middleware.js';
import { validateData } from '../../../middlewares/validateData.middleware.js';
import { recordFilesUpload } from '../../../utils/storage/uploads.js';
import { createRecordController } from '../controllers/records.create.controller.js';
import { getRecordController } from '../controllers/records.get.controller.js';
import { listRecordsController } from '../controllers/records.list.controller.js';
import { reviewRecordController } from '../controllers/records.review.controller.js';
import { searchPatientsController } from '../controllers/records.searchPatients.controller.js';
import { recordParamsSchema, reviewRecordSchema } from '../schema/records.schema.js';

const router = Router();
const auth = [sessionsMiddleware, accessMiddleware];

// Must come before '/:recordId'.
router.get('/patients/search', ...auth, searchPatientsController);

router.get('/', ...auth, listRecordsController);
// Auth runs before the upload, so files are never read for signed-out requests.
router.post('/', ...auth, recordFilesUpload, createRecordController);
router.get('/:recordId', validateData({ params: recordParamsSchema }), ...auth, getRecordController);
router.patch('/:recordId/review', validateData({ params: recordParamsSchema, body: reviewRecordSchema }), ...auth, reviewRecordController);

export default router;
