import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import http from 'http';
import dotenv from 'dotenv';

// Load environment variables - try multiple potential env file locations
const envFiles = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.development'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../.env.development')
];

for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
        console.log(`Loading environment from: ${envFile}`);
        dotenv.config({ path: envFile });
        break;
    }
}

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);
const isDevelopment = process.env.NODE_ENV === 'development';
let PORT = DEFAULT_PORT;

// Log environment variables (hide sensitive values)
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SUPABASE_URL: process.env.SUPABASE_URL ? '[DEFINED]' : '[MISSING]',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? '[DEFINED]' : '[MISSING]',
    JWT_SECRET: process.env.JWT_SECRET ? '[DEFINED]' : '[MISSING]'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create directory structure if it doesn't exist
const uploadDirs = ['products', 'chat'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../uploads', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Routes
try {
    // Import routes
    const authRoutes = require('./routes/auth.routes').default;
    app.use('/api/auth', authRoutes);
    console.log('Loaded auth routes');
} catch (err) {
    const error = err as Error;
    console.warn('Auth routes not available:', error.message);
    app.use('/api/auth', mockRoutes('Auth'));
}

try {
    const userRoutes = require('./routes/user.routes').default;
    app.use('/api/users', userRoutes);
    console.log('Loaded user routes');
} catch (err) {
    const error = err as Error;
    console.warn('User routes not available:', error.message);
    app.use('/api/users', mockRoutes('User'));
}

try {
    const productRoutes = require('./routes/product.routes').default;
    app.use('/api/products', productRoutes);
    console.log('Loaded product routes');
} catch (err) {
    const error = err as Error;
    console.warn('Product routes not available:', error.message);
    app.use('/api/products', mockRoutes('Product'));
}

try {
    const cartRoutes = require('./routes/cart.routes').default;
    app.use('/api/cart', cartRoutes);
    console.log('Loaded cart routes');
} catch (err) {
    const error = err as Error;
    console.warn('Cart routes not available:', error.message);
    app.use('/api/cart', mockRoutes('Cart'));
}

try {
    const orderRoutes = require('./routes/order.routes').default;
    app.use('/api/orders', orderRoutes);
    console.log('Loaded order routes');
} catch (err) {
    const error = err as Error;
    console.warn('Order routes not available:', error.message);
    app.use('/api/orders', mockRoutes('Order'));
}

try {
    const chatRoutes = require('./routes/chat.routes').default;
    app.use('/api/chat', chatRoutes);
    console.log('Loaded chat routes');
} catch (err) {
    const error = err as Error;
    console.warn('Chat routes not available:', error.message);
    app.use('/api/chat', mockRoutes('Chat'));
}

// Function to create mock routes for development
function mockRoutes(name: string) {
    const router = express.Router();
    router.all('*', (req, res) => {
        res.status(200).json({
            message: `Mock ${name} API response`,
            path: req.path,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query,
            isDevelopment: true
        });
    });
    return router;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        environment: process.env.NODE_ENV
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Not Found - The requested resource does not exist',
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack }),
    });
});

// Create a server with error handling for port conflicts
const server = http.createServer(app);

// Try to start the server on the configured port
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
        // If port is in use, try the next port
        PORT = PORT + 1;
        console.log(`Port ${PORT - 1} is in use, trying port ${PORT}...`);
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
    } else {
        console.error('Server error:', e);
    }
});

export default app; 