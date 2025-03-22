import { Request, Response } from 'express';
import { ProductModel, ProductFilters } from '../models/product.model';
import { errorHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/products';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed') as any);
        }
    }
});

export class ProductController {
    /**
     * Create a new product
     */
    static async createProduct(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            // Get uploaded image paths
            const uploadedFiles = req.files as Express.Multer.File[];
            const images = uploadedFiles ? uploadedFiles.map(file => `/uploads/products/${file.filename}`) : [];

            const {
                title,
                price,
                description,
                condition,
                brand,
                size,
                material,
                color,
                categoryIds,
                sustainabilityInfo,
                sustainability,
                sustainabilityBadges
            } = req.body;

            const product = await ProductModel.create({
                title,
                price: parseFloat(price),
                description,
                images,
                condition,
                brand,
                size,
                material,
                color,
                sellerId: req.user.id,
                categoryIds: categoryIds ? JSON.parse(categoryIds) : undefined,
                sustainabilityInfo: sustainabilityInfo ? JSON.parse(sustainabilityInfo) : undefined,
                sustainability: sustainability ? parseFloat(sustainability) : undefined,
                sustainabilityBadges: sustainabilityBadges ? JSON.parse(sustainabilityBadges) : undefined,
            });

            return res.status(201).json({
                message: 'Product created successfully',
                product,
            });
        } catch (error) {
            console.error(error);
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get all products with filters
     */
    static async getProducts(req: Request, res: Response) {
        try {
            const filters: ProductFilters = {
                category: req.query.category as string,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                condition: req.query.condition as string,
                brand: req.query.brand as string,
                size: req.query.size as string,
                sellerId: req.query.sellerId as string,
                material: req.query.material as string,
                color: req.query.color as string,
                minSustainability: req.query.minSustainability ? parseFloat(req.query.minSustainability as string) : undefined,
                sortBy: req.query.sortBy as any,
                searchQuery: req.query.searchQuery as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
            };

            const { products, totalCount } = await ProductModel.findAll(filters);

            return res.status(200).json({
                products,
                pagination: {
                    page: filters.page || 1,
                    limit: filters.limit || 10,
                    totalCount,
                    totalPages: Math.ceil(totalCount / (filters.limit || 10)),
                },
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Get a product by ID
     */
    static async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found',
                });
            }

            return res.status(200).json({
                product,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Update a product
     */
    static async updateProduct(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { id } = req.params;
            const product = await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found',
                });
            }

            // Verify ownership
            if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'You do not have permission to update this product',
                });
            }

            // Get uploaded image paths
            const uploadedFiles = req.files as Express.Multer.File[];
            const newImages = uploadedFiles ? uploadedFiles.map(file => `/uploads/products/${file.filename}`) : undefined;

            const {
                title,
                price,
                description,
                condition,
                brand,
                size,
                material,
                color,
                categoryIds,
                sustainabilityInfo,
                sustainability,
                sustainabilityBadges
            } = req.body;

            const updatedProduct = await ProductModel.update(id, {
                title,
                price: price ? parseFloat(price) : undefined,
                description,
                images: newImages ? [...(product.images || []), ...newImages] : undefined,
                condition,
                brand,
                size,
                material,
                color,
                categoryIds: categoryIds ? JSON.parse(categoryIds) : undefined,
                sustainabilityInfo: sustainabilityInfo ? JSON.parse(sustainabilityInfo) : undefined,
                sustainability: sustainability ? parseFloat(sustainability) : undefined,
                sustainabilityBadges: sustainabilityBadges ? JSON.parse(sustainabilityBadges) : undefined,
            });

            return res.status(200).json({
                message: 'Product updated successfully',
                product: updatedProduct,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Delete a product
     */
    static async deleteProduct(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'Authentication failed. User information not found.',
                });
            }

            const { id } = req.params;
            const product = await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found',
                });
            }

            // Verify ownership
            if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'You do not have permission to delete this product',
                });
            }

            await ProductModel.delete(id);

            return res.status(200).json({
                message: 'Product deleted successfully',
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }

    /**
     * Import products from dataset
     */
    static async importProducts(req: AuthRequest, res: Response) {
        try {
            if (!req.user || !req.user.id || req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'Only admins can import products',
                });
            }

            const { products } = req.body;

            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    message: 'Invalid products data. Expected an array of products',
                });
            }

            const importedProducts = await Promise.all(
                products.map(async (productData) => {
                    // Map dataset fields to our product model
                    return ProductModel.create({
                        title: productData.productDisplayName || 'Unknown Product',
                        price: productData.price || Math.floor(Math.random() * 100) + 10,
                        description: productData.productDescription || 'No description available',
                        images: productData.image ? [`/uploads/products/${productData.image}`] : [],
                        condition: productData.condition || 'new',
                        brand: productData.brandName || 'Unknown Brand',
                        size: productData.size || null,
                        material: productData.material || null,
                        color: productData.baseColour || null,
                        sellerId: req.user.id,
                        categoryIds: productData.masterCategory ? [productData.masterCategory] : [],
                        sustainability: Math.floor(Math.random() * 60) + 40, // Random score between 40-100
                        sustainabilityBadges: ['Recycled', 'Eco-friendly', 'Sustainable'].slice(0, Math.floor(Math.random() * 3) + 1),
                    });
                })
            );

            return res.status(200).json({
                message: `Successfully imported ${importedProducts.length} products`,
                count: importedProducts.length,
            });
        } catch (error) {
            const { status, message } = errorHandler(error);
            return res.status(status).json({ message });
        }
    }
} 