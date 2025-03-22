import { Router } from 'express';
import { ChatController, chatUpload } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { messageSchema } from '../utils/validation';
import { wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   POST /api/chat/messages
 * @desc    Send a message
 * @access  Private
 */
router.post(
    '/messages',
    authenticate,
    chatUpload.array('images', 5),
    validate(messageSchema),
    wrapAuthController(ChatController.sendMessage)
);

/**
 * @route   GET /api/chat/messages/:userId
 * @desc    Get conversation with another user
 * @access  Private
 */
router.get(
    '/messages/:userId',
    authenticate,
    wrapAuthController(ChatController.getConversation)
);

/**
 * @route   GET /api/chat/list
 * @desc    Get all user's chats
 * @access  Private
 */
router.get('/list', authenticate, wrapAuthController(ChatController.getChatList));

/**
 * @route   GET /api/chat/unread
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread', authenticate, wrapAuthController(ChatController.getUnreadCount));

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete(
    '/messages/:messageId',
    authenticate,
    wrapAuthController(ChatController.deleteMessage)
);

export default router; 