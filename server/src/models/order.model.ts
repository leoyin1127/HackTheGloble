import { supabase } from '../config/supabase';

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    subtotal: number;
    product?: {
        title: string;
        images: string[];
        sellerId: string;
    };
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: string;
    shippingMethod: string;
    paymentMethod: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateOrderInput {
    userId: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    shippingAddress: string;
    shippingMethod: string;
    paymentMethod: string;
    totalAmount: number;
}

// Define an interface for the database order record
interface OrderRecord {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_address: string;
    shipping_method: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
}

export class OrderModel {
    /**
     * Create a new order
     */
    static async create(orderData: CreateOrderInput): Promise<Order> {
        // Begin transaction
        const order = await supabase.rpc('create_order', {
            p_user_id: orderData.userId,
            p_total_amount: orderData.totalAmount,
            p_shipping_address: orderData.shippingAddress,
            p_shipping_method: orderData.shippingMethod,
            p_payment_method: orderData.paymentMethod,
            p_items: orderData.items.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }))
        });

        if (order.error) {
            throw order.error;
        }

        return this.findById(order.data.id);
    }

    /**
     * Find an order by ID
     */
    static async findById(id: string): Promise<Order> {
        // Get order
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError) {
            throw orderError;
        }

        // Get order items
        const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
        *,
        products (
          id, 
          title, 
          images,
          seller_id
        )
      `)
            .eq('order_id', id);

        if (itemsError) {
            throw itemsError;
        }

        const items = itemsData.map((item: any) => ({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            product: item.products ? {
                title: item.products.title,
                images: item.products.images,
                sellerId: item.products.seller_id,
            } : undefined,
        }));

        return {
            id: orderData.id,
            userId: orderData.user_id,
            items,
            totalAmount: orderData.total_amount,
            status: orderData.status,
            shippingAddress: orderData.shipping_address,
            shippingMethod: orderData.shipping_method,
            paymentMethod: orderData.payment_method,
            createdAt: orderData.created_at,
            updatedAt: orderData.updated_at,
        };
    }

    /**
     * Get orders by user ID
     */
    static async findByUserId(userId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const orders = await Promise.all(
            data.map(async (order: OrderRecord) => {
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select(`
            *,
            products (
              id, 
              title, 
              images,
              seller_id
            )
          `)
                    .eq('order_id', order.id);

                if (itemsError) {
                    throw itemsError;
                }

                const items = itemsData.map((item: any) => ({
                    id: item.id,
                    orderId: item.order_id,
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal,
                    product: item.products ? {
                        title: item.products.title,
                        images: item.products.images,
                        sellerId: item.products.seller_id,
                    } : undefined,
                }));

                return {
                    id: order.id,
                    userId: order.user_id,
                    items,
                    totalAmount: order.total_amount,
                    status: order.status,
                    shippingAddress: order.shipping_address,
                    shippingMethod: order.shipping_method,
                    paymentMethod: order.payment_method,
                    createdAt: order.created_at,
                    updatedAt: order.updated_at,
                };
            })
        );

        return orders;
    }

    /**
     * Update order status
     */
    static async updateStatus(id: string, status: Order['status']): Promise<Order> {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date(),
            })
            .eq('id', id)
            .select();

        if (error) {
            throw error;
        }

        return this.findById(id);
    }
} 