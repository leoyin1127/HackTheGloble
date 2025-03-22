import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { orderSchema } from '../utils/validation';
import { wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order from cart
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    validate(orderSchema),
    wrapAuthController(OrderController.createOrderFromCart)
);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', authenticate, wrapAuthController(OrderController.getUserOrders));

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, wrapAuthController(OrderController.getOrderById));

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
router.put(
    '/:id/status',
    authenticate,
    isAdmin,
    wrapAuthController(OrderController.updateOrderStatus)
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put(
    '/:id/cancel',
    authenticate,
    wrapAuthController(OrderController.cancelOrder)
);

export default router; 