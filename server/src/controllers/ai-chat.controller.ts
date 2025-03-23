import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorHandler } from '../utils/helpers';
import { OpenAIService } from '../services/openai.service';
import { z } from 'zod';

// Schema for chat message validation
export const aiChatMessageSchema = z.object({
    message: z.string().min(1, { message: 'Message is required' }),
    conversationId: z.string().optional()
});

export class AIChatController {
    /**
     * Send a message to the AI assistant
     */
    static async sendMessage(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { message, conversationId } = req.body;

            // We can fetch previous messages from database based on conversationId
            // For now, we'll just implement direct message/response functionality

            // Get AI response using OpenAI service
            const aiResponse = await OpenAIService.getFashionAdvice(message);

            // Here we could also save the conversation to the database
            // with conversationId or create a new one if needed

            return res.status(200).json({
                message: 'AI response generated successfully',
                data: {
                    content: aiResponse,
                    timestamp: new Date(),
                },
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get conversation history
     * This would typically fetch the conversation history from a database
     */
    static async getConversation(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { conversationId } = req.params;

            // TODO: Fetch conversation history from database
            // For now, return empty array or mock data

            return res.status(200).json({
                messages: [],
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 