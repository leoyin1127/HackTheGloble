import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { comparePassword, generateToken, errorHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
    /**
     * Register a new user
     */
    static async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    message: 'User with this email already exists',
                });
            }

            // Create new user
            const user = await UserModel.create({
                username,
                email,
                password,
            });

            // Generate JWT token
            const token = generateToken(user);

            // Return the user and token
            return res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Login user
     */
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await UserModel.findByEmail(email);

            if (!user || !user.password) {
                return res.status(401).json({
                    message: 'Invalid credentials',
                });
            }

            // Compare passwords
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    message: 'Invalid credentials',
                });
            }

            // Generate JWT token
            const token = generateToken(user);

            // Return the user and token
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    location: user.location,
                    shippingAddress: user.shippingAddress,
                    preferences: user.preferences,
                },
                token,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get current user
     */
    static async getCurrentUser(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                });
            }

            return res.status(200).json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    location: user.location,
                    shippingAddress: user.shippingAddress,
                    preferences: user.preferences,
                },
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 