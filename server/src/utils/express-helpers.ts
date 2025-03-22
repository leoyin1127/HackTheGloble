import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

// Type for controller functions that use regular Request
export type ControllerFunction = (
    req: Request,
    res: Response,
    next?: NextFunction
) => Promise<any> | any;

// Type for controller functions that use AuthRequest
export type AuthControllerFunction = (
    req: AuthRequest,
    res: Response,
    next?: NextFunction
) => Promise<any> | any;

/**
 * Wraps a controller function to be compatible with Express's RequestHandler type
 */
export const wrapController = (fn: ControllerFunction): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Wraps an authenticated controller function to be compatible with Express's RequestHandler type
 */
export const wrapAuthController = (fn: AuthControllerFunction): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
    };
}; 