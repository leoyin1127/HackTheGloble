import { Router } from 'express';
import { AIChatController, aiChatMessageSchema } from '../controllers/ai-chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   POST /api/ai-chat/message
 * @desc    Send a message to AI and get a response
 * @access  Private
 */
router.post(
    '/message',
    authenticate,
    validate(aiChatMessageSchema),
    wrapAuthController(AIChatController.sendMessage)
);

/**
 * @route   GET /api/ai-chat/conversation/:conversationId
 * @desc    Get conversation history
 * @access  Private
 */
router.get(
    '/conversation/:conversationId',
    authenticate,
    wrapAuthController(AIChatController.getConversation)
);

export default router; 