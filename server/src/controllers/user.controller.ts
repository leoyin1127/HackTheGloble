import { Response } from 'express';
import { UserModel } from '../models/user.model';
import { errorHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
    /**
     * Get user profile
     */
    static async getProfile(req: AuthRequest, res: Response) {
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

    /**
     * Update user profile
     */
    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { username, email, location, shippingAddress, preferences } = req.body;

            const updatedUser = await UserModel.update(req.user.id, {
                username,
                email,
                location,
                shippingAddress,
                preferences,
            });

            return res.status(200).json({
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    location: updatedUser.location,
                    shippingAddress: updatedUser.shippingAddress,
                    preferences: updatedUser.preferences,
                },
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Change password
     */
    static async changePassword(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { password } = req.body;

            await UserModel.update(req.user.id, { password });

            return res.status(200).json({
                message: 'Password changed successfully',
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Delete user account
     */
    static async deleteAccount(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            await UserModel.delete(req.user.id);

            return res.status(200).json({
                message: 'Account deleted successfully',
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 