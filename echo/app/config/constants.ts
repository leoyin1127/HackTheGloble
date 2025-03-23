import {
    API_URL as ENV_API_URL,
    OPENAI_API_KEY as ENV_OPENAI_API_KEY,
    OPENAI_MODEL as ENV_OPENAI_MODEL,
    APP_NAME as ENV_APP_NAME,
    APP_VERSION as ENV_APP_VERSION
} from '@env';

// API Configuration
export const API_URL: string = ENV_API_URL || 'http://localhost:3000/api';

// OpenAI Configuration
// IMPORTANT: Replace with your actual OpenAI API key from https://platform.openai.com/api-keys
// The key should start with 'sk-' followed by a long string of characters
export const OPENAI_API_KEY: string = ENV_OPENAI_API_KEY;
export const OPENAI_MODEL: string = ENV_OPENAI_MODEL || 'gpt-3.5-turbo';

// App Configuration
export const APP_NAME: string = ENV_APP_NAME || 'Echo';
export const APP_VERSION: string = ENV_APP_VERSION || '1.0.0'; 