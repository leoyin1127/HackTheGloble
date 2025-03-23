import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SCHEMA_PATH = path.join(__dirname, '../database/schema.sql');

// Helper function to execute a SQL query
const executeQuery = async (query: string): Promise<void> => {
    try {
        const { error } = await supabase.from('_temp_').select('*').limit(1).csv();

        if (error && error.message.includes('relation "_temp_" does not exist')) {
            console.log("Supabase connection seems to be working");
        } else {
            console.log("Error testing Supabase connection:", error);
        }
    } catch (error) {
        console.error('Error executing query:', error);
    }
};

const setupDatabase = async () => {
    try {
        console.log('Setting up database schema...');
        console.log('Supabase URL:', process.env.SUPABASE_URL);

        // Test Supabase connection
        await executeQuery('SELECT 1');

        console.log('\nIMPORTANT: Supabase does not allow executing arbitrary SQL via the client API.');
        console.log('To set up your database schema, please:');
        console.log('1. Log in to your Supabase dashboard at https://app.supabase.com');
        console.log('2. Select your project "rpknbarpqtaznukaaadu"');
        console.log('3. Go to the SQL Editor');
        console.log('4. Copy and paste the following SQL and run it:');
        console.log('\n-------- COPY FROM HERE --------');

        // Read and display the schema SQL
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        console.log(schema);

        console.log('-------- COPY TO HERE --------\n');

        console.log('After running the SQL in the Supabase dashboard, you can run the data import:');
        console.log('npm run import-data');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
};

// Run the setup
setupDatabase().catch(console.error); 