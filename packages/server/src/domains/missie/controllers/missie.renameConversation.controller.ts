/**
 * @description Rename one of the signed-in user's Missie conversations.
 * @request PATCH
 * @route /api/v1/missie/conversations/:conversationId
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__404, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import { renameMissieConversation } from '../lib/missie.renameConversation.service.js';
import type { MissieRenameConversation } from '../schema/missie.schema.js';

export const renameConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.userData?.user?.id;
    if (!userId) return errorHandler__401({ errorMessage: 'not signed in' }, res);

    const { title } = req.body as MissieRenameConversation;
    const conversation = await renameMissieConversation(userId, req.params.conversationId as string, title);
    if (!conversation) return errorHandler__404({ errorMessage: 'conversation not found' }, res);

    res.status(200).json({
      responseMessage: 'Conversation renamed successfully',
      response: { conversation, accessToken: req.userData?.newUserAccessToken, refreshToken: req.userData?.newUserRefreshToken }
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
