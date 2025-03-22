import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../utils/validation';
import { registerSchema, loginSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';
import { wrapController, wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), wrapController(AuthController.register));

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validate(loginSchema), wrapController(AuthController.login));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, wrapAuthController(AuthController.getCurrentUser));

export default router; 