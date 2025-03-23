import supabase from '../utils/supabase';
import api from '../utils/api';

// No need for hardcoded API_URL anymore, using the api utility instead

// Interface for product data
export interface Product {
    id: string;
    title: string;
    price: number;
    description: string;
    images: string[];
    supabase_image_url?: string; // Add Supabase image URL field
    condition: string;
    brand?: string;
    size?: string;
    material?: string;
    color?: string;
    seller_id: string;
    sellerName?: string;
    sustainability: number;
    sustainability_badges: string[];
    sustainability_info: any;
    created_at: Date;
    updated_at: Date;
    // Fashion dataset specific fields
    gender?: string;
    master_category?: string;
    sub_category?: string;
    article_type?: string;
    base_colour?: string;
    season?: string;
    year?: string;
    usage?: string;
    product_display_name?: string;
}

// Type for product filters
export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    brand?: string;
    minSustainability?: number;
    searchQuery?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'sustainability';
    limit?: number;
    offset?: number;
}

class ProductService {
    // Get products with optional filters
    async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
        try {
            let query = supabase
                .from('products')
                .select(`
          *,
          product_images (url, position)
        `);

            // Apply filters
            if (filters.category) {
                query = query.eq('master_category', filters.category)
                    .or(`sub_category.eq.${filters.category}`);
            }

            if (filters.minPrice !== undefined) {
                query = query.gte('price', filters.minPrice);
            }

            if (filters.maxPrice !== undefined) {
                query = query.lte('price', filters.maxPrice);
            }

            if (filters.condition) {
                query = query.eq('condition', filters.condition);
            }

            if (filters.brand) {
                query = query.eq('brand', filters.brand);
            }

            if (filters.minSustainability !== undefined) {
                query = query.gte('sustainability', filters.minSustainability);
            }

            if (filters.searchQuery) {
                query = query.ilike('title', `%${filters.searchQuery}%`)
                    .or(`description.ilike.%${filters.searchQuery}%`);
            }

            // Apply sorting
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price_asc':
                        query = query.order('price', { ascending: true });
                        break;
                    case 'price_desc':
                        query = query.order('price', { ascending: false });
                        break;
                    case 'newest':
                        query = query.order('created_at', { ascending: false });
                        break;
                    case 'sustainability':
                        query = query.order('sustainability', { ascending: false });
                        break;
                }
            } else {
                // Default sort by newest
                query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit);
            } else {
                query = query.limit(20); // Default limit
            }

            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching products:', error);
                throw new Error(error.message);
            }

            // Transform the data to match our Product interface
            return this.transformProducts(data || []);
        } catch (error) {
            console.error('Error in getProducts:', error);
            throw error;
        }
    }

    // Get a single product by ID
    async getProductDetails(id: string): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching product details:', error);
                throw new Error(error.message);
            }

            if (!data) {
                return null;
            }

            return this.transformProduct(data);
        } catch (error) {
            console.error('Error in getProductDetails:', error);
            throw error;
        }
    }

    // Get saved products for SavedItemsScreen
    async getSavedProducts(savedIds: string[]): Promise<Product[]> {
        if (!savedIds || savedIds.length === 0) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
                `)
                .in('id', savedIds);

            if (error) {
                console.error('Error fetching saved products:', error);
                throw new Error(error.message);
            }

            return this.transformProducts(data || []);
        } catch (error) {
            console.error('Error in getSavedProducts:', error);
            throw error;
        }
    }

    // Get products by category with pagination for SearchScreen
    async getProductsByCategory(category: string, page = 1, pageSize = 20): Promise<{ products: Product[], totalCount: number }> {
        try {
            // First get count for pagination
            const { count, error: countError } = await supabase
                .from('products')
                .select('id', { count: 'exact' })
                .eq('master_category', category);

            if (countError) {
                console.error('Error counting products by category:', countError);
                throw new Error(countError.message);
            }

            // Calculate pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            // Get paginated data
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
                `)
                .eq('master_category', category)
                .range(from, to);

            if (error) {
                console.error('Error fetching products by category:', error);
                throw new Error(error.message);
            }

            return {
                products: this.transformProducts(data || []),
                totalCount: count || 0
            };
        } catch (error) {
            console.error('Error in getProductsByCategory:', error);
            throw error;
        }
    }

    // Get related products for ItemDetailScreen
    async getRelatedProducts(productId: string, category: string, limit = 5): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
                `)
                .eq('master_category', category)
                .neq('id', productId)
                .limit(limit);

            if (error) {
                console.error('Error fetching related products:', error);
                throw new Error(error.message);
            }

            return this.transformProducts(data || []);
        } catch (error) {
            console.error('Error in getRelatedProducts:', error);
            throw error;
        }
    }

    // Get featured/recommended products
    async getFeaturedProducts(limit = 10): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
                `)
                .order('sustainability', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching featured products:', error);
                throw new Error(error.message);
            }

            return this.transformProducts(data || []);
        } catch (error) {
            console.error('Error in getFeaturedProducts:', error);
            throw error;
        }
    }

    // Helper function to transform product data
    private transformProduct(product: any): Product {
        if (!product) {
            console.warn('Received null or undefined product in transformProduct');
            return {
                id: 'placeholder',
                title: 'Product Not Available',
                price: 0,
                description: 'This product is currently unavailable',
                images: [],
                condition: 'unknown',
                seller_id: '',
                sustainability: 0,
                sustainability_badges: [],
                sustainability_info: {},
                created_at: new Date(),
                updated_at: new Date(),
            };
        }

        try {
            // Log raw product data to debug
            console.log('Raw product data:', JSON.stringify(product));

            // Extract and sort images from product_images relation
            let images: string[] = [];

            // PRIORITY 1: Use Supabase image URL if available (highest quality)
            if (product.supabase_image_url) {
                console.log('Using Supabase image URL:', product.supabase_image_url);
                images = [product.supabase_image_url];
            }
            // PRIORITY 2: Use product_images relation if available (from join)
            else if (Array.isArray(product.product_images) && product.product_images.length > 0) {
                console.log('Processing product_images array:', JSON.stringify(product.product_images));
                images = product.product_images
                    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                    .map((img: any) => {
                        if (!img.url) return '';

                        // Support both Supabase and local paths
                        if (img.url.startsWith('http')) {
                            return img.url;
                        }
                        return api.getUrl(img.url);
                    })
                    .filter((url: string) => !!url);
            }
            // PRIORITY 3: Use direct images array
            else if (Array.isArray(product.images) && product.images.length > 0) {
                console.log('Using direct images array:', JSON.stringify(product.images));

                // Map the image paths to full URLs
                images = product.images
                    .map((imgPath: string) => {
                        if (!imgPath) return '';

                        // Use URL directly if it's a full URL (Supabase or other)
                        if (imgPath.startsWith('http')) {
                            return imgPath;
                        }

                        // Otherwise use API URL
                        return api.getUrl(imgPath);
                    })
                    .filter((url: string) => !!url);
            }
            // PRIORITY 4: Use single image string if available
            else if (typeof product.image === 'string' && product.image) {
                console.log('Using single image string:', product.image);
                // If it's a full URL, use it directly
                if (product.image.startsWith('http')) {
                    images = [product.image];
                } else {
                    // Otherwise use API URL
                    images = [api.getUrl(product.image)];
                }
            }

            // FALLBACK: Use placeholder if no images found
            if (images.length === 0) {
                images = ['https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image'];
            }

            console.log('Final processed images:', JSON.stringify(images));

            // Parse price safely
            let price = 0;
            try {
                price = typeof product.price === 'number'
                    ? product.price
                    : parseFloat(product.price || '0');
            } catch (e) {
                console.warn('Error parsing product price:', e);
            }

            // Ensure required fields with defaults for safety
            return {
                ...product,
                id: product.id || 'unknown',
                title: product.title || 'Untitled Product',
                price: isNaN(price) ? 0 : price,
                description: product.description || '',
                images,
                condition: product.condition || 'unknown',
                seller_id: product.seller_id || '',
                sustainability: product.sustainability || 0,
                sustainability_badges: Array.isArray(product.sustainability_badges)
                    ? product.sustainability_badges
                    : [],
                sustainability_info: product.sustainability_info || {},
                created_at: product.created_at ? new Date(product.created_at) : new Date(),
                updated_at: product.updated_at ? new Date(product.updated_at) : new Date(),
            };
        } catch (error) {
            console.error('Error transforming product:', error, product);
            return {
                id: product?.id || 'error',
                title: 'Error Loading Product',
                price: 0,
                description: 'There was an error processing this product',
                images: [],
                condition: 'unknown',
                seller_id: '',
                sustainability: 0,
                sustainability_badges: [],
                sustainability_info: {},
                created_at: new Date(),
                updated_at: new Date(),
            };
        }
    }

    // Helper function to transform an array of products
    private transformProducts(products: any[]): Product[] {
        return products.map(product => this.transformProduct(product));
    }
}

export default new ProductService(); 