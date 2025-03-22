import { supabase } from '../config/supabase';

export interface CartItem {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
    product?: {
        id: string;
        title: string;
        price: number;
        images: string[];
        sellerId: string;
    };
}

export class CartModel {
    /**
     * Add an item to the cart
     */
    static async addItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
        // Check if item already exists in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (existingItem) {
            // Update quantity if it exists
            const { data, error } = await supabase
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + quantity,
                    updated_at: new Date(),
                })
                .eq('id', existingItem.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                userId: data.user_id,
                productId: data.product_id,
                quantity: data.quantity,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        } else {
            // Create new cart item
            const { data, error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: userId,
                    product_id: productId,
                    quantity,
                    created_at: new Date(),
                    updated_at: new Date(),
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                userId: data.user_id,
                productId: data.product_id,
                quantity: data.quantity,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        }
    }

    /**
     * Get all items in a user's cart
     */
    static async getCartByUserId(userId: string): Promise<CartItem[]> {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
        *,
        products (
          id, 
          title, 
          price, 
          images,
          seller_id
        )
      `)
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            productId: item.product_id,
            quantity: item.quantity,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            product: item.products ? {
                id: item.products.id,
                title: item.products.title,
                price: item.products.price,
                images: item.products.images,
                sellerId: item.products.seller_id,
            } : undefined,
        }));
    }

    /**
     * Update cart item quantity
     */
    static async updateQuantity(id: string, quantity: number): Promise<CartItem> {
        const { data, error } = await supabase
            .from('cart_items')
            .update({
                quantity,
                updated_at: new Date(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            id: data.id,
            userId: data.user_id,
            productId: data.product_id,
            quantity: data.quantity,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Remove an item from the cart
     */
    static async removeItem(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return true;
    }

    /**
     * Clear user's cart
     */
    static async clearCart(userId: string): Promise<boolean> {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        return true;
    }
} 