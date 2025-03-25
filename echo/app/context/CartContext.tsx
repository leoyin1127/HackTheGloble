import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/ProductService';

// Context type definition
interface CartContextType {
    cartItems: Product[];
    cartItemIds: string[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    getCartItemCount: () => number;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [cartItemIds, setCartItemIds] = useState<string[]>([]);

    // Load cart items from AsyncStorage on mount
    useEffect(() => {
        const loadCartItems = async () => {
            try {
                const storedItems = await AsyncStorage.getItem('cartItemIds');
                if (storedItems) {
                    const parsedItems = JSON.parse(storedItems);
                    setCartItemIds(parsedItems);
                    console.log("Loaded cart items from storage:", parsedItems);
                }
            } catch (error) {
                console.error("Error loading cart items from storage:", error);
            }
        };

        loadCartItems();
    }, []);

    // Save to AsyncStorage whenever cartItemIds changes
    useEffect(() => {
        const persistCartItems = async () => {
            try {
                await AsyncStorage.setItem('cartItemIds', JSON.stringify(cartItemIds));
                console.log("Cart items persisted to storage:", cartItemIds);
            } catch (error) {
                console.error("Error persisting cart items:", error);
            }
        };

        persistCartItems();
    }, [cartItemIds]);

    // Add a product to cart
    const addToCart = (product: Product) => {
        console.log("addToCart called with product:", product);
        if (!product || !product.id) {
            console.warn("Attempted to add item with invalid ID");
            return;
        }

        setCartItemIds(prev => {
            if (!prev.includes(product.id)) {
                console.log("Adding item to cart:", product.id);
                return [...prev, product.id];
            }
            return prev;
        });

        setCartItems(prev => {
            if (!prev.some(item => item.id === product.id)) {
                return [...prev, product];
            }
            return prev;
        });
    };

    // Remove a product from cart
    const removeFromCart = (id: string) => {
        console.log("removeFromCart called with id:", id);
        if (!id) {
            console.warn("Attempted to remove item with invalid ID");
            return;
        }

        setCartItemIds(prev => {
            const newItems = prev.filter(itemId => itemId !== id);
            console.log("New cart items after removal:", newItems);
            return newItems;
        });

        setCartItems(prev => {
            return prev.filter(item => item.id !== id);
        });
    };

    // Clear cart
    const clearCart = () => {
        setCartItemIds([]);
        setCartItems([]);
    };

    // Get cart item count
    const getCartItemCount = () => {
        return cartItemIds.length;
    };

    // Create context value
    const value: CartContextType = {
        cartItems,
        cartItemIds,
        addToCart,
        removeFromCart,
        clearCart,
        getCartItemCount,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook for using the CartContext
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 