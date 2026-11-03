/**
 * @description List the signed-in user's Missie conversations, most recent first.
 * @request GET
 * @route /api/v1/missie/conversations
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { listMissieConversations } from '../lib/missie.listConversations.service.js';

export const listConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userData?.user?.id;
    if (!userId) return errorHandler__401({ errorMessage: 'not signed in' }, res);

    const conversations = await listMissieConversations(userId);

    res.status(200).json({
      responseMessage: 'Conversations retrieved successfully',
      response: { conversations, accessToken: req.userData?.newUserAccessToken, refreshToken: req.userData?.newUserRefreshToken }
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
