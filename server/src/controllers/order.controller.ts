import { Response } from 'express';
import { OrderModel } from '../models/order.model';
import { CartModel } from '../models/cart.model';
import { errorHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';

export class OrderController {
    /**
     * Create a new order from cart
     */
    static async createOrderFromCart(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { shippingAddress, shippingMethod, paymentMethod } = req.body;

            // Get user's cart
            const cartItems = await CartModel.getCartByUserId(req.user.id);

            if (cartItems.length === 0) {
                return res.status(400).json({
                    message: 'Your cart is empty',
                });
            }

            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => {
                const price = item.product?.price || 0;
                return sum + (price * item.quantity);
            }, 0);

            // Create order items
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product?.price || 0,
            }));

            // Create order
            const order = await OrderModel.create({
                userId: req.user.id,
                items: orderItems,
                totalAmount,
                shippingAddress,
                shippingMethod,
                paymentMethod,
            });

            // Clear cart after successful order
            await CartModel.clearCart(req.user.id);

            return res.status(201).json({
                message: 'Order created successfully',
                order,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get user's orders
     */
    static async getUserOrders(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const orders = await OrderModel.findByUserId(req.user.id);

            return res.status(200).json({
                orders,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get order by ID
     */
    static async getOrderById(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { id } = req.params;
            const order = await OrderModel.findById(id);

            if (!order) {
                return res.status(404).json({
                    message: 'Order not found',
                });
            }

            // Verify ownership or admin
            if (order.userId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'You do not have permission to view this order',
                });
            }

            return res.status(200).json({
                order,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Update order status (admin only)
     */
    static async updateOrderStatus(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            // Only admins can update order status
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'You do not have permission to update order status',
                });
            }

            const { id } = req.params;
            const { status } = req.body;

            const order = await OrderModel.updateStatus(id, status);

            return res.status(200).json({
                message: 'Order status updated successfully',
                order,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Cancel order (user can only cancel their own pending orders)
     */
    static async cancelOrder(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { id } = req.params;
            const order = await OrderModel.findById(id);

            if (!order) {
                return res.status(404).json({
                    message: 'Order not found',
                });
            }

            // Verify ownership
            if (order.userId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'You do not have permission to cancel this order',
                });
            }

            // Only pending orders can be cancelled
            if (order.status !== 'pending') {
                return res.status(400).json({
                    message: 'Only pending orders can be cancelled',
                });
            }

            const updatedOrder = await OrderModel.updateStatus(id, 'cancelled');

            return res.status(200).json({
                message: 'Order cancelled successfully',
                order: updatedOrder,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 