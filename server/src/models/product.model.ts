import { supabase } from '../config/supabase';
import { getPagination } from '../utils/helpers';

export interface SustainabilityInfo {
    impact?: string;
    certifications?: string[];
    condition?: string;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    description: string;
    images: string[];
    condition: string;
    brand?: string;
    size?: string;
    material?: string;
    color?: string;
    sellerId: string;
    categoryIds?: string[];
    sustainabilityInfo?: SustainabilityInfo;
    sustainability?: number;
    sustainabilityBadges?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductInput {
    title: string;
    price: number;
    description: string;
    images?: string[];
    condition: string;
    brand?: string;
    size?: string;
    material?: string;
    color?: string;
    sellerId: string;
    categoryIds?: string[];
    sustainabilityInfo?: SustainabilityInfo;
    sustainability?: number;
    sustainabilityBadges?: string[];
}

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    brand?: string;
    size?: string;
    sellerId?: string;
    material?: string;
    color?: string;
    minSustainability?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'sustainability';
    searchQuery?: string;
    page?: number;
    limit?: number;
}

export class ProductModel {
    /**
     * Create a new product
     */
    static async create(productData: ProductInput): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .insert({
                title: productData.title,
                price: productData.price,
                description: productData.description,
                images: productData.images || [],
                condition: productData.condition,
                brand: productData.brand || null,
                size: productData.size || null,
                material: productData.material || null,
                color: productData.color || null,
                seller_id: productData.sellerId,
                category_ids: productData.categoryIds || [],
                sustainability_info: productData.sustainabilityInfo || {},
                sustainability: productData.sustainability || 0,
                sustainability_badges: productData.sustainabilityBadges || [],
                created_at: new Date(),
                updated_at: new Date(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapProductData(data);
    }

    /**
     * Find products with filters and pagination
     */
    static async findAll(filters: ProductFilters = {}): Promise<{ products: Product[]; totalCount: number }> {
        const {
            category,
            minPrice,
            maxPrice,
            condition,
            brand,
            size,
            sellerId,
            material,
            color,
            minSustainability,
            sortBy,
            searchQuery,
            page = 1,
            limit = 10,
        } = filters;

        const { from, to } = getPagination(page, limit);

        let query = supabase
            .from('products')
            .select('*, categories(name)', { count: 'exact' });

        // Apply filters
        if (category) {
            query = query.contains('category_ids', [category]);
        }

        if (minPrice !== undefined) {
            query = query.gte('price', minPrice);
        }

        if (maxPrice !== undefined) {
            query = query.lte('price', maxPrice);
        }

        if (condition) {
            query = query.eq('condition', condition);
        }

        if (brand) {
            query = query.eq('brand', brand);
        }

        if (size) {
            query = query.eq('size', size);
        }

        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }

        if (material) {
            query = query.eq('material', material);
        }

        if (color) {
            query = query.eq('color', color);
        }

        if (minSustainability !== undefined) {
            query = query.gte('sustainability', minSustainability);
        }

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply sorting
        if (sortBy) {
            switch (sortBy) {
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
                default:
                    query = query.order('created_at', { ascending: false });
            }
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            products: data.map(this.mapProductData),
            totalCount: count || 0,
        };
    }

    /**
     * Find a product by ID
     */
    static async findById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        categories (
          id,
          name
        ),
        users (
          id,
          username,
          email
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw error;
        }

        return this.mapProductData(data);
    }

    /**
     * Update a product
     */
    static async update(id: string, productData: Partial<ProductInput>): Promise<Product> {
        const updateData: any = {
            updated_at: new Date(),
        };

        if (productData.title !== undefined) updateData.title = productData.title;
        if (productData.price !== undefined) updateData.price = productData.price;
        if (productData.description !== undefined) updateData.description = productData.description;
        if (productData.images !== undefined) updateData.images = productData.images;
        if (productData.condition !== undefined) updateData.condition = productData.condition;
        if (productData.brand !== undefined) updateData.brand = productData.brand;
        if (productData.size !== undefined) updateData.size = productData.size;
        if (productData.material !== undefined) updateData.material = productData.material;
        if (productData.color !== undefined) updateData.color = productData.color;
        if (productData.categoryIds !== undefined) updateData.category_ids = productData.categoryIds;
        if (productData.sustainabilityInfo !== undefined) updateData.sustainability_info = productData.sustainabilityInfo;
        if (productData.sustainability !== undefined) updateData.sustainability = productData.sustainability;
        if (productData.sustainabilityBadges !== undefined) updateData.sustainability_badges = productData.sustainabilityBadges;

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapProductData(data);
    }

    /**
     * Delete a product
     */
    static async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return true;
    }

    /**
     * Map product data from database to model
     */
    private static mapProductData(data: any): Product {
        return {
            id: data.id,
            title: data.title,
            price: data.price,
            description: data.description,
            images: data.images || [],
            condition: data.condition,
            brand: data.brand,
            size: data.size,
            material: data.material,
            color: data.color,
            sellerId: data.seller_id,
            categoryIds: data.category_ids || [],
            sustainabilityInfo: data.sustainability_info,
            sustainability: data.sustainability,
            sustainabilityBadges: data.sustainability_badges || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
} 