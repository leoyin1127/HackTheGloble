import { Router } from 'express';
import { ProductController, upload } from '../controllers/product.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { productSchema } from '../utils/validation';
import { wrapController, wrapAuthController } from '../utils/express-helpers';

const router = Router();

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    upload.array('images', 5),
    validate(productSchema),
    wrapAuthController(ProductController.createProduct)
);

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', wrapController(ProductController.getProducts));

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 */
router.get('/:id', wrapController(ProductController.getProductById));

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private
 */
router.put(
    '/:id',
    authenticate,
    upload.array('images', 5),
    wrapAuthController(ProductController.updateProduct)
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete('/:id', authenticate, wrapAuthController(ProductController.deleteProduct));

/**
 * @route   POST /api/products/import
 * @desc    Import products from dataset (admin only)
 * @access  Private/Admin
 */
router.post(
    '/import',
    authenticate,
    isAdmin,
    wrapAuthController(ProductController.importProducts)
);

export default router; 