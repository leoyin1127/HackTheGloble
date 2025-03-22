import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { updateUserSchema } from '../utils/validation';
import { wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, wrapAuthController(UserController.getProfile));

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
    '/profile',
    authenticate,
    validate(updateUserSchema),
    wrapAuthController(UserController.updateProfile)
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
    '/change-password',
    authenticate,
    wrapAuthController(UserController.changePassword)
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authenticate, wrapAuthController(UserController.deleteAccount));

export default router; 