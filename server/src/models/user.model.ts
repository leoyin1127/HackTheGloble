import { supabase } from '../config/supabase';
import { hashPassword } from '../utils/helpers';

export interface User {
    id: string;
    username: string;
    email: string;
    password?: string;
    location?: string;
    shippingAddress?: string;
    preferences?: string[];
    role?: 'user' | 'admin';
    createdAt?: string;
    updatedAt?: string;
}

export interface UserInput {
    username: string;
    email: string;
    password: string;
    location?: string;
    shippingAddress?: string;
    preferences?: string[];
}

export class UserModel {
    /**
     * Create a new user in the database
     */
    static async create(userData: UserInput): Promise<User> {
        const hashedPassword = await hashPassword(userData.password);

        const { data, error } = await supabase
            .from('users')
            .insert({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                location: userData.location || null,
                shipping_address: userData.shippingAddress || null,
                preferences: userData.preferences || [],
                role: 'user',
                created_at: new Date(),
                updated_at: new Date(),
            })
            .select('id, username, email, location, shipping_address, preferences, role, created_at, updated_at')
            .single();

        if (error) {
            throw error;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            location: data.location,
            shippingAddress: data.shipping_address,
            preferences: data.preferences,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Find a user by email
     */
    static async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No user found
            }
            throw error;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            location: data.location,
            shippingAddress: data.shipping_address,
            preferences: data.preferences,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Find a user by ID
     */
    static async findById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, location, shipping_address, preferences, role, created_at, updated_at')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No user found
            }
            throw error;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            location: data.location,
            shippingAddress: data.shipping_address,
            preferences: data.preferences,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Update a user's information
     */
    static async update(id: string, userData: Partial<User>): Promise<User> {
        const updateData: any = {
            updated_at: new Date(),
        };

        if (userData.username) updateData.username = userData.username;
        if (userData.email) updateData.email = userData.email;
        if (userData.location) updateData.location = userData.location;
        if (userData.shippingAddress) updateData.shipping_address = userData.shippingAddress;
        if (userData.preferences) updateData.preferences = userData.preferences;
        if (userData.password) updateData.password = await hashPassword(userData.password);

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, username, email, location, shipping_address, preferences, role, created_at, updated_at')
            .single();

        if (error) {
            throw error;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            location: data.location,
            shippingAddress: data.shipping_address,
            preferences: data.preferences,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Delete a user
     */
    static async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return true;
    }
} 