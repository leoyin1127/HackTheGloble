import { Response } from 'express';
import { ChatModel } from '../models/chat.model';
import { errorHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for chat image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/chat';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

export const chatUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed') as any);
        }
    }
});

export class ChatController {
    /**
     * Send a message
     */
    static async sendMessage(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { recipientId, itemId, text } = req.body;

            // Get uploaded image paths
            const uploadedFiles = req.files as Express.Multer.File[];
            const images = uploadedFiles ? uploadedFiles.map(file => `/uploads/chat/${file.filename}`) : undefined;

            const message = await ChatModel.sendMessage({
                senderId: req.user.id,
                recipientId,
                itemId,
                text,
                images,
            });

            return res.status(201).json({
                message: 'Message sent successfully',
                data: message,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get conversation with another user
     */
    static async getConversation(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { userId } = req.params;
            const { itemId } = req.query;

            const messages = await ChatModel.getConversation(
                req.user.id,
                userId,
                itemId as string
            );

            // Mark messages as read
            await ChatModel.markAsRead(req.user.id, userId);

            return res.status(200).json({
                messages,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get all user's chats
     */
    static async getChatList(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const chats = await ChatModel.getChatList(req.user.id);

            return res.status(200).json({
                chats,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get unread message count
     */
    static async getUnreadCount(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const count = await ChatModel.getUnreadCount(req.user.id);

            return res.status(200).json({
                unreadCount: count,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Delete a message
     */
    static async deleteMessage(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { messageId } = req.params;

            await ChatModel.deleteMessage(messageId, req.user.id);

            return res.status(200).json({
                message: 'Message deleted successfully',
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 