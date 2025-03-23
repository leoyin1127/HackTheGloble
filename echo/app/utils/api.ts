/**
 * API Utility for connecting to the backend server
 */

// Configuration options for different environments
const CONFIG = {
    development: {
        // Default to port 3000, but can be overridden
        baseUrl: 'http://localhost:3000',
    },
    production: {
        // In production, this would be your deployed server URL
        baseUrl: 'https://your-production-server.com',
    }
};

// Get current environment
const ENV = process.env.NODE_ENV || 'development';

// API base URL - can be overridden
let apiBaseUrl = CONFIG[ENV as keyof typeof CONFIG]?.baseUrl || CONFIG.development.baseUrl;

/**
 * Set a custom API base URL if needed (e.g. for different devices or ports)
 * @param url The new base URL
 */
export const setApiBaseUrl = (url: string) => {
    apiBaseUrl = url;
    console.log(`API base URL set to: ${apiBaseUrl}`);
};

/**
 * Get the full URL for an API endpoint or resource
 * @param path The path to the resource (e.g. "/uploads/products/123.jpg")
 * @returns The complete URL
 */
export const getUrl = (path: string): string => {
    if (!path) return '';

    // If already a full URL, return as is
    if (path.startsWith('http')) {
        return path;
    }

    // Make sure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
};

export default {
    baseUrl: apiBaseUrl,
    getUrl,
    setApiBaseUrl,
}; 