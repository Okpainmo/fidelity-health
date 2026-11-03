/**
 * @description Delete one of the signed-in user's Missie conversations.
 * @request DELETE
 * @route /api/v1/missie/conversations/:conversationId
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__404, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { deleteMissieConversation } from '../lib/missie.deleteConversation.service.js';

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.userData?.user?.id;
    if (!userId) return errorHandler__401({ errorMessage: 'not signed in' }, res);

    const deleted = await deleteMissieConversation(userId, req.params.conversationId as string);
    if (!deleted) return errorHandler__404({ errorMessage: 'conversation not found' }, res);

    res.status(200).json({
      responseMessage: 'Conversation deleted successfully',
      response: { accessToken: req.userData?.newUserAccessToken, refreshToken: req.userData?.newUserRefreshToken }
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
