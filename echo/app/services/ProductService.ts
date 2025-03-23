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
    image_url?: string; // For compatibility with some components
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

            if (filters.offset !== undefined) {
                // Use the range method to implement proper offset-based pagination
                const startIndex = filters.offset;
                const endIndex = filters.offset + (filters.limit || 20) - 1;
                console.log(`ProductService: Applying pagination range from ${startIndex} to ${endIndex}`);
                query = query.range(startIndex, endIndex);
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
    async getProductById(id: string): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
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
            console.error('Error in getProductById:', error);
            throw error;
        }
    }

    // Get saved products by array of IDs
    async getProductsByIds(savedIds: string[]): Promise<Product[]> {
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
            console.error('Error in getProductsByIds:', error);
            throw error;
        }
    }

    // Get saved products for SavedItemsScreen (keeping for backward compatibility)
    async getSavedProducts(savedIds: string[]): Promise<Product[]> {
        return this.getProductsByIds(savedIds);
    }

    // Get products by category with pagination for SearchScreen
    async getProductsByCategory(category: string, limit = 20): Promise<Product[]> {
        try {
            // Get paginated data
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
                `)
                .eq('master_category', category)
                .limit(limit);

            if (error) {
                console.error('Error fetching products by category:', error);
                throw new Error(error.message);
            }

            return this.transformProducts(data || []);
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

    // Get featured products
    async getFeaturedProducts(limit = 10): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (url, position)
                `)
                .order('created_at', { ascending: false })
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

    private transformProduct(product: any): Product {
        // Process images properly
        let images: string[] = [];

        // Process images from product_images relationship
        if (Array.isArray(product.product_images) && product.product_images.length > 0) {
            images = product.product_images
                .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                .map((img: any) => {
                    if (!img.url) return '';

                    // Support both full URLs and relative paths
                    return img.url.startsWith('http')
                        ? img.url
                        : api.getUrl(img.url);
                })
                .filter(Boolean);
        }
        // Fallback to direct images array if available
        else if (Array.isArray(product.images) && product.images.length > 0) {
            images = product.images
                .map((path: string) => {
                    if (!path) return '';

                    // Use direct URL if it's already a full URL
                    return path.startsWith('http')
                        ? path
                        : api.getUrl(path);
                })
                .filter(Boolean);
        }

        // Use Supabase image if available and no other images found
        if (images.length === 0 && product.supabase_image_url) {
            images = [product.supabase_image_url];
        }

        // Set a fallback if still no images
        if (images.length === 0) {
            images = ['https://via.placeholder.com/200x200?text=No+Image'];
        }

        // Set image_url to first image for compatibility
        const image_url = images[0];

        // Transform from database model to our frontend Product interface
        return {
            id: product.id,
            title: product.title,
            price: parseFloat(product.price),
            description: product.description,
            images,
            image_url,
            supabase_image_url: product.supabase_image_url || null,
            condition: product.condition,
            brand: product.brand || undefined,
            size: product.size || undefined,
            material: product.material || undefined,
            color: product.color || undefined,
            seller_id: product.seller_id,
            sellerName: product.seller_name || undefined,
            sustainability: product.sustainability || 0,
            sustainability_badges: product.sustainability_badges || [],
            sustainability_info: product.sustainability_info || {},
            created_at: new Date(product.created_at),
            updated_at: new Date(product.updated_at),
            // Other fields
            gender: product.gender || undefined,
            master_category: product.master_category || undefined,
            sub_category: product.sub_category || undefined,
            article_type: product.article_type || undefined,
            base_colour: product.base_colour || undefined,
            season: product.season || undefined,
            year: product.year || undefined,
            usage: product.usage || undefined,
            product_display_name: product.product_display_name || undefined
        };
    }

    private transformProducts(products: any[]): Product[] {
        return products.map(product => this.transformProduct(product));
    }
}

export default new ProductService(); 