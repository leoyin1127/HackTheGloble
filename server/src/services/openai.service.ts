import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatCompletionOptions {
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    max_tokens?: number;
    temperature?: number;
    model?: string;
}

export class OpenAIService {
    /**
     * Get a completion from ChatGPT
     */
    static async getChatCompletion(options: ChatCompletionOptions): Promise<string> {
        try {
            // Set default values
            const model = options.model || 'gpt-3.5-turbo';
            const temperature = options.temperature || 0.7;
            const max_tokens = options.max_tokens || 500;

            // Call the OpenAI API
            const response = await openai.chat.completions.create({
                model,
                messages: options.messages,
                temperature,
                max_tokens,
            });

            // Return the response text
            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }

    /**
     * Get fashion style advice from the AI
     * This is a specialized method for the Echo fashion assistant
     */
    static async getFashionAdvice(userMessage: string, conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = []): Promise<string> {
        try {
            // Create initial system message if not provided in history
            if (!conversationHistory.some(msg => msg.role === 'system')) {
                conversationHistory.unshift({
                    role: 'system',
                    content: 'You are Echo, a sustainable fashion assistant. You provide fashion advice, styling tips, and information about sustainable fashion. Your responses are helpful, friendly, and focused on sustainable and eco-friendly fashion choices.'
                });
            }

            // Add the user's message to conversation history
            conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // Get completion
            const response = await this.getChatCompletion({
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 500,
                model: 'gpt-3.5-turbo'
            });

            return response;
        } catch (error) {
            console.error('Error getting fashion advice:', error);
            throw error;
        }
    }
} 