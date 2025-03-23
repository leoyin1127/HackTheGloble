import axios from 'axios';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../config/constants';

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

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class AIChatService {
    private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    private static readonly SYSTEM_PROMPT = 'You are Echo, a sustainable fashion assistant. You provide fashion advice, styling tips, and information about sustainable fashion. Your responses are helpful, friendly, and focused on sustainable and eco-friendly fashion choices.';

    private static conversationHistory: OpenAIMessage[] = [
        { role: 'system', content: AIChatService.SYSTEM_PROMPT }
    ];

    private static readonly FALLBACK_RESPONSES = [
        "I'd recommend trying a sustainable denim jacket with a white t-shirt and eco-friendly sneakers. It's a timeless look that works for many occasions!",
        "Based on what you're looking for, you might enjoy a minimalist style with earth tones. Have you considered adding more organic cotton pieces to your wardrobe?",
        "Your style sounds like it values both comfort and sustainability. I've found some recycled polyester athletic wear that might interest you.",
        "For your upcoming event, consider a secondhand formal outfit paired with vintage accessories for a unique, eco-conscious look.",
        "Bamboo fabric items are excellent choices! They're breathable, sustainable, and perfect for sensitive skin."
    ];

    /**
     * Send a message to the OpenAI API directly or use fallback responses if API fails
     */
    static async sendMessage(message: string): Promise<AIResponse> {
        try {
            // Check if API key is properly configured
            if (!OPENAI_API_KEY || OPENAI_API_KEY === '' || typeof OPENAI_API_KEY !== 'string') {
                console.log('Using fallback response - API key not found in environment variables');
                return this.getFallbackResponse(message, 'Missing API key in .env file. Please add your OpenAI API key to the .env file.');
            }

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: message
            });

            // Make direct request to OpenAI API
            const response = await axios.post(
                this.OPENAI_API_URL,
                {
                    model: OPENAI_MODEL,
                    messages: this.conversationHistory,
                    temperature: 0.7,
                    max_tokens: 500
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    }
                }
            );

            // Extract assistant response
            const assistantMessage = response.data.choices[0]?.message?.content ||
                "I'm sorry, I couldn't generate a response at this time.";

            // Add assistant response to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            // Keep conversation history at a reasonable length (last 10 messages)
            if (this.conversationHistory.length > 11) {
                // Always keep the system message at index 0
                const systemMessage = this.conversationHistory[0];
                this.conversationHistory = [
                    systemMessage,
                    ...this.conversationHistory.slice(-10)
                ];
            }

            return {
                content: assistantMessage,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error calling OpenAI API:', error);

            // Handle different error types
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    return this.getFallbackResponse(message, 'Authentication error: Your API key may be invalid. Please check your .env file.');
                } else if (error.response.status === 429) {
                    return this.getFallbackResponse(message, 'Rate limit exceeded: Your OpenAI account has reached its request limit.');
                }
            }

            // Return a fallback response for other errors
            return this.getFallbackResponse(message);
        }
    }

    /**
     * Get a fallback response when the API fails
     */
    private static getFallbackResponse(message: string, errorMessage?: string): AIResponse {
        const lowerMessage = message.toLowerCase();
        let response: string;

        // If there's a specific error message, use it for API/key related questions
        if (errorMessage && (lowerMessage.includes('api') || lowerMessage.includes('key') || lowerMessage.includes('error'))) {
            response = errorMessage;
        } else if (lowerMessage.includes('outfit') || lowerMessage.includes('wear')) {
            response = this.FALLBACK_RESPONSES[0];
        } else if (lowerMessage.includes('style') || lowerMessage.includes('look')) {
            response = this.FALLBACK_RESPONSES[1];
        } else if (lowerMessage.includes('comfortable') || lowerMessage.includes('athletic')) {
            response = this.FALLBACK_RESPONSES[2];
        } else if (lowerMessage.includes('event') || lowerMessage.includes('party')) {
            response = this.FALLBACK_RESPONSES[3];
        } else if (lowerMessage.includes('material') || lowerMessage.includes('fabric')) {
            response = this.FALLBACK_RESPONSES[4];
        } else {
            // Random fallback response if no keyword match
            response = this.FALLBACK_RESPONSES[Math.floor(Math.random() * this.FALLBACK_RESPONSES.length)];
        }

        return {
            content: response,
            timestamp: new Date()
        };
    }

    /**
     * Reset the conversation history
     */
    static resetConversation(): void {
        this.conversationHistory = [
            { role: 'system', content: this.SYSTEM_PROMPT }
        ];
    }
} 