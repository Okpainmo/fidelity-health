// sample domain router
import express from 'express';
import { validateData } from '../../../middlewares/validateData.middleware.js';
import { userIdParamsSchema } from '../schema/user.schema.js';
import { getUserProfile } from '../controllers/user.getUserProfile.controller.js';
import { getAllUsers } from '../controllers/user.getAllUserProfiles.controller.js';
import { getMyProfile } from '../controllers/user.getMyProfile.controller.js';
import { updateMyProfile } from '../controllers/user.updateMyProfile.controller.js';
import { deleteMyPhoto, uploadMyPhoto } from '../controllers/user.profilePhoto.controller.js';
import { profilePhotoUpload } from '../../../utils/storage/uploads.js';
import sessionsMiddleware from '../../../middlewares/auth.sessions.middleware.js';
import accessMiddleware from '../../../middlewares/auth.access.middleware.js';

// express router init
const router = express.Router();

// routes
// The signed-in account's own patient/hospital profile. Must come before '/:userId'.
router
  .route('/me/profile/photo')
  .put(sessionsMiddleware, accessMiddleware, profilePhotoUpload, uploadMyPhoto)
  .delete(sessionsMiddleware, accessMiddleware, deleteMyPhoto);
router.route('/me/profile').get(sessionsMiddleware, accessMiddleware, getMyProfile).patch(sessionsMiddleware, accessMiddleware, updateMyProfile);
router.route('/:userId').get(validateData({ params: userIdParamsSchema }), sessionsMiddleware, accessMiddleware, getUserProfile);
router.route('/').get(sessionsMiddleware, accessMiddleware, getAllUsers);

export default router;
