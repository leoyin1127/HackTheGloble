import { Response } from 'express';
import { CartModel } from '../models/cart.model';
import { errorHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';

export class CartController {
    /**
     * Get user's cart
     */
    static async getCart(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const cartItems = await CartModel.getCartByUserId(req.user.id);

            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => {
                const price = item.product?.price || 0;
                return sum + (price * item.quantity);
            }, 0);

            return res.status(200).json({
                items: cartItems,
                totalAmount,
                itemCount: cartItems.length,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Add item to cart
     */
    static async addToCart(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { productId, quantity } = req.body;

            const cartItem = await CartModel.addItem(
                req.user.id,
                productId,
                quantity
            );

            return res.status(200).json({
                message: 'Item added to cart',
                cartItem,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Update cart item quantity
     */
    static async updateCartItem(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { id } = req.params;
            const { quantity } = req.body;

            const cartItem = await CartModel.updateQuantity(id, quantity);

            return res.status(200).json({
                message: 'Cart item updated',
                cartItem,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Remove item from cart
     */
    static async removeFromCart(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { id } = req.params;

            await CartModel.removeItem(id);

            return res.status(200).json({
                message: 'Item removed from cart',
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Clear cart
     */
    static async clearCart(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            await CartModel.clearCart(req.user.id);

            return res.status(200).json({
                message: 'Cart cleared',
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 