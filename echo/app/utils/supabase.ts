import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create custom AsyncStorage implementation compatible with Supabase
const ExpoAsyncStorage = {
    getItem: async (key: string) => {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.error('Error getting item from AsyncStorage:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            return await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error setting item in AsyncStorage:', error);
        }
    },
    removeItem: async (key: string) => {
        try {
            return await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item from AsyncStorage:', error);
        }
    }
};

// Supabase configuration - these values should match the server
const SUPABASE_URL = 'https://rpknbarpqtaznukaaadu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwa25iYXJwcXRhem51a2FhYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2ODEzMTAsImV4cCI6MjA1ODI1NzMxMH0.PR39gdE-U_mIj_3P5UOvfJ9rMrqxMh_XahgUmDX-Z6Q';

// Define a fallback client in case initialization fails
const fallbackClient = {
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
        signIn: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
    }
};

// Initialize Supabase client with error handling
let supabaseClient;
try {
    // Create Supabase client with our custom storage
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            storage: ExpoAsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        }
    });

    console.log('Supabase client initialized successfully');
} catch (error) {
    console.error('Error initializing Supabase client:', error);
    // Use fallback client that won't crash the app
    supabaseClient = fallbackClient;
}

export const supabase = supabaseClient;
export default supabase; 