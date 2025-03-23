import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables - try multiple potential env file locations
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

// For development without actual Supabase credentials
const isDevelopment = process.env.NODE_ENV === 'development';
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL ? '[DEFINED]' : '[MISSING]',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? '[DEFINED]' : '[MISSING]'
});

// Define a type for our mock client to match SupabaseClient's structure
interface MockClient {
    from: (table: string) => any;
    rpc: (fn: string, params?: any) => Promise<any>;
    storage: {
        listBuckets: () => Promise<any>;
        createBucket: (name: string, options?: any) => Promise<any>;
        from: (bucket: string) => {
            upload: (path: string, file: any, options?: any) => Promise<any>;
            getPublicUrl: (path: string) => { data: { publicUrl: string } };
        };
    };
}

// Create a mock Supabase client for development
const createMockClient = (): MockClient => {
    console.log('Using mock Supabase client in development mode');
    return {
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { code: 'PGRST116' } })
                }),
                order: () => ({
                    range: () => Promise.resolve({ data: [], error: null, count: 0 })
                }),
                limit: () => Promise.resolve({ data: [], error: null }),
                contains: () => {
                    return {
                        gte: () => ({
                            lte: () => ({
                                eq: () => ({
                                    or: () => ({
                                        order: () => ({
                                            range: () => Promise.resolve({ data: [], error: null, count: 0 })
                                        })
                                    })
                                })
                            })
                        })
                    };
                },
                range: () => Promise.resolve({ data: [], error: null, count: 0 }),
                single: () => Promise.resolve({ data: null, error: null }),
            }),
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: { id: 'mock-id' }, error: null })
                })
            }),
            update: () => ({
                eq: () => ({
                    select: () => ({
                        single: async () => ({ data: { id: 'mock-id' }, error: null })
                    })
                })
            }),
            delete: () => ({
                eq: () => Promise.resolve({ error: null })
            })
        }),
        rpc: (fn: string, params?: any) => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
        storage: {
            listBuckets: () => Promise.resolve({ data: [], error: null }),
            createBucket: (name: string, options?: any) => Promise.resolve({
                data: { name }, error: null
            }),
            from: (bucket: string) => ({
                upload: (path: string, file: any, options?: any) => Promise.resolve({
                    data: { Key: path }, error: null
                }),
                getPublicUrl: (path: string) => ({
                    data: { publicUrl: `https://mock-storage-url.com/${bucket}/${path}` }
                })
            })
        }
    };
};

// Use real client if credentials are available, otherwise use mock in development
let supabase: SupabaseClient | MockClient;

if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    console.log('Using real Supabase credentials');
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );
} else if (isDevelopment) {
    supabase = createMockClient();
} else {
    throw new Error('Missing Supabase URL or key in environment variables');
}

export { supabase };
export default supabase; 