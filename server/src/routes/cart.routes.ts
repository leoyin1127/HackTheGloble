import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { cartItemSchema } from '../utils/validation';
import { wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', authenticate, wrapAuthController(CartController.getCart));

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    validate(cartItemSchema),
    wrapAuthController(CartController.addToCart)
);

/**
 * @route   PUT /api/cart/:id
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put(
    '/:id',
    authenticate,
    wrapAuthController(CartController.updateCartItem)
);

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:id', authenticate, wrapAuthController(CartController.removeFromCart));

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', authenticate, wrapAuthController(CartController.clearCart));

export default router; 