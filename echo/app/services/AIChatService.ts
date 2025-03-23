import axios from 'axios';
import { API_URL } from '../config/constants';
import { getToken } from '../utils/auth';

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface AIResponse {
    content: string;
    timestamp: Date;
}

export class AIChatService {
    /**
     * Send a message to the AI chatbot and get a response
     */
    static async sendMessage(message: string): Promise<AIResponse> {
        try {
            const token = await getToken();

            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await axios.post(
                `${API_URL}/ai-chat/message`,
                { message },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error sending message to AI:', error);
            throw error;
        }
    }

    /**
     * Get conversation history
     */
    static async getConversation(conversationId: string): Promise<Message[]> {
        try {
            const token = await getToken();

            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await axios.get(
                `${API_URL}/ai-chat/conversation/${conversationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data.messages;
        } catch (error) {
            console.error('Error getting conversation history:', error);
            throw error;
        }
    }
} 