import { OpenAIService } from './services/openai.service';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load environment variables from different possible locations
const envFiles = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.development'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../.env.development')
];

for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
        console.log(`Loading environment from: ${envFile}`);
        dotenv.config({ path: envFile });
        break;
    }
}

async function testOpenAI() {
    try {
        console.log('Testing OpenAI service...');

        if (!process.env.OPENAI_API_KEY) {
            console.error('ERROR: OPENAI_API_KEY is not set in the environment variables.');
            console.log('Please add your OpenAI API key to the .env or .env.development file:');
            console.log('OPENAI_API_KEY=your_api_key_here');
            return;
        }

        const testMessage = 'Hello, can you recommend a sustainable fashion brand?';
        console.log(`Sending test message: "${testMessage}"`);

        const response = await OpenAIService.getFashionAdvice(testMessage);

        console.log('\nResponse from OpenAI:');
        console.log('-'.repeat(50));
        console.log(response);
        console.log('-'.repeat(50));
        console.log('\nOpenAI integration test completed successfully!');
    } catch (error) {
        console.error('Error testing OpenAI service:', error);
    }
}

// Run the test
testOpenAI(); 