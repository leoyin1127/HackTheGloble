import { z } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// User schemas
export const registerSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const updateUserSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    location: z.string().optional(),
    shippingAddress: z.string().optional(),
    preferences: z.array(z.string()).optional(),
});

// Product schemas
export const productSchema = z.object({
    title: z.string().min(3).max(100),
    price: z.number().positive(),
    description: z.string().min(10),
    condition: z.string(),
    brand: z.string().optional(),
    size: z.string().optional(),
    material: z.string().optional(),
    color: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    sustainabilityInfo: z.object({
        impact: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        condition: z.string().optional(),
    }).optional(),
    sustainability: z.number().min(0).max(100).optional(),
    sustainabilityBadges: z.array(z.string()).optional(),
});

// Cart schemas
export const cartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
});

// Order schemas
export const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
    })),
    shippingAddress: z.string(),
    shippingMethod: z.string(),
    paymentMethod: z.string(),
    totalAmount: z.number().positive(),
});

// Chat schemas
export const messageSchema = z.object({
    text: z.string(),
    recipientId: z.string(),
    itemId: z.string().optional(),
    images: z.array(z.string()).optional(),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema<any>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: 'Validation failed',
                    errors: error.errors,
                });
            } else {
                res.status(500).json({
                    message: 'Internal server error during validation',
                });
            }
        }
    };
}; 