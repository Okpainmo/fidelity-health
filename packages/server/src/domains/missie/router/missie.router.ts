import { Router } from 'express';
import { validateData } from '../../../middlewares/validateData.middleware.js';
import sessionsMiddleware from '../../../middlewares/auth.sessions.middleware.js';
import accessMiddleware from '../../../middlewares/auth.access.middleware.js';
import { missieChatRequestSchema, missieConversationParamsSchema, missieRenameConversationSchema } from '../schema/missie.schema.js';
import { chatWithMissie } from '../controllers/missie.chat.controller.js';
import { listConversations } from '../controllers/missie.listConversations.controller.js';
import { getConversation } from '../controllers/missie.getConversation.controller.js';
import { deleteConversation } from '../controllers/missie.deleteConversation.controller.js';
import { renameConversation } from '../controllers/missie.renameConversation.controller.js';

const router = Router();
const auth = [sessionsMiddleware, accessMiddleware];
const conversationParams = validateData({ params: missieConversationParamsSchema });

router.post('/chat', validateData({ body: missieChatRequestSchema }), ...auth, chatWithMissie);

router.get('/conversations', ...auth, listConversations);
router.get('/conversations/:conversationId', conversationParams, ...auth, getConversation);
router.patch(
  '/conversations/:conversationId',
  validateData({ params: missieConversationParamsSchema, body: missieRenameConversationSchema }),
  ...auth,
  renameConversation
);
router.delete('/conversations/:conversationId', conversationParams, ...auth, deleteConversation);

/* The streaming version of /chat, /api/v1/missie/chat/stream, is a WebSocket (see
   controllers/missie.chatStream.controller.ts). WebSocket upgrades are routed in app.ts,
   not by Express, so it isn't registered here. */

export default router;
