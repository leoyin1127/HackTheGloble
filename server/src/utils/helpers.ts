import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const SALT_ROUNDS = 10;

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: any): string => {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'user'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate a random UUID
 */
export const generateUUID = (): string => {
    return uuidv4();
};

/**
 * Handle catch blocks and error formatting
 */
export const errorHandler = (error: any, defaultMessage = 'An unexpected error occurred') => {
    console.error(error);

    if (error.code === '23505') {
        return {
            status: 409,
            message: 'A record with that unique key already exists',
        };
    }

    return {
        status: error.status || 500,
        message: error.message || defaultMessage,
    };
};

/**
 * Format a price to a string with currency
 */
export const formatPrice = (price: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price);
};

/**
 * Calculate pagination values
 */
export const getPagination = (page: number = 1, size: number = 10) => {
    const limit = size;
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    return { from, to, limit };
}; 