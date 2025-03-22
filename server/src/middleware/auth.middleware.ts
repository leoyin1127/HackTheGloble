import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

// Extended Request interface to include user property
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Authentication failed. No token provided or invalid format.'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                message: 'Authentication failed. Token is required.'
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        (req as AuthRequest).user = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if ((error as Error).name === 'TokenExpiredError') {
            res.status(401).json({
                message: 'Authentication failed. Token has expired.'
            });
            return;
        }

        if ((error as Error).name === 'JsonWebTokenError') {
            res.status(401).json({
                message: 'Authentication failed. Invalid token.'
            });
            return;
        }

        res.status(500).json({
            message: 'Internal server error during authentication.'
        });
    }
};

export const isAdmin: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.role === 'admin') {
        next();
        return;
    }

    res.status(403).json({
        message: 'Access denied. Admin privileges required.'
    });
}; 