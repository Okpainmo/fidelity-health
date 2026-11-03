/**
 * @description Send a message to Missie and get the full reply in one response.
 * Leave out `conversationId` to start a new conversation.
 * @request POST
 * @route /api/v1/missie/chat
 * @access Private (session)
 */

import type { Request, Response } from 'express';
import { errorHandler__401, errorHandler__404, errorHandler__500 } from '../../../utils/errorHandlers/codedErrorHandlers.js';
import log from '../../../utils/logger.js';
import { startMissieTurn } from '../lib/missie.startTurn.service.js';
import { saveMissieReply } from '../lib/missie.saveReply.service.js';
import { generateMissieReply } from '../lib/missie.generateReply.service.js';
import { MISSIE_MODEL } from '../../../utils/missie/missie.client.js';
import type { MissieChatRequest } from '../schema/missie.schema.js';

type ChatMessage = { id: string; role: 'user' | 'missie'; content: string; createdAt: Date };

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    conversation: { id: string; title: string; isNew: boolean };
    userMessage: ChatMessage;
    reply: ChatMessage;
    accessToken?: string;
    refreshToken?: string;
  };
};

export const chatWithMissie = async (req: Request, res: Response<ResponseSpecs>) => {
  try {
    const userId = req.userData?.user?.id;
    if (!userId) {
      errorHandler__401({ errorMessage: 'not signed in' }, res);
      return;
    }

    const { message, conversationId } = req.body as MissieChatRequest;

    const turn = await startMissieTurn({ userId, message, conversationId });
    if (!turn) {
      errorHandler__404({ errorMessage: 'conversation not found', context: { userId, conversationId } }, res);
      return;
    }

    const content = await generateMissieReply(turn.history);
    const reply = await saveMissieReply({ conversationId: turn.conversation.id, content, model: MISSIE_MODEL });
    if (!reply) {
      errorHandler__500(new Error('could not save reply'), res);
      return;
    }

    log.info({ level: 'info', userId, conversationId: turn.conversation.id }, 'Missie replied');

    res.status(200).json({
      responseMessage: 'Missie replied successfully',
      response: {
        conversation: turn.conversation,
        userMessage: turn.userMessage,
        reply,
        accessToken: req.userData?.newUserAccessToken,
        refreshToken: req.userData?.newUserRefreshToken
      }
    });
  } catch (error) {
    errorHandler__500(error, res);
  }
};
