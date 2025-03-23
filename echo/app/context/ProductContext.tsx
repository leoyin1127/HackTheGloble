import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import ProductService, { Product, ProductFilters } from '../services/ProductService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context type definition
interface ProductContextType {
    // Products data
    products: Product[];
    featuredProducts: Product[];
    loading: boolean;
    error: string | null;

    // Saved items
    savedItemIds: string[];
    saveProduct: (id: string) => void;
    unsaveProduct: (id: string) => void;

    // Methods
    fetchProducts: (filters?: ProductFilters) => Promise<void>;
    getProductById: (id: string) => Promise<Product | null>;
    getProductsByCategory: (category: string, limit?: number) => Promise<Product[]>;
    getFeaturedProducts: (limit?: number) => Promise<void>;

    // Filters and search
    filters: ProductFilters;
    setFilters: (filters: ProductFilters) => void;
    clearFilters: () => void;
}

// Create context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Provider component
export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ProductFilters>({
        excludeUnlikelySH: true // Default to excluding products unlikely for second-hand marketplace
    });
    const [savedItemIds, setSavedItemIds] = useState<string[]>([]);

    // Load saved items from AsyncStorage on mount
    useEffect(() => {
        const loadSavedItems = async () => {
            try {
                const storedItems = await AsyncStorage.getItem('savedItemIds');
                if (storedItems) {
                    const parsedItems = JSON.parse(storedItems);
                    setSavedItemIds(parsedItems);
                    console.log("Loaded saved items from storage:", parsedItems);
                }
            } catch (error) {
                console.error("Error loading saved items from storage:", error);
            }
        };

        loadSavedItems();
    }, []);

    // Save to AsyncStorage whenever savedItemIds changes
    useEffect(() => {
        const persistSavedItems = async () => {
            try {
                await AsyncStorage.setItem('savedItemIds', JSON.stringify(savedItemIds));
                console.log("Saved items persisted to storage:", savedItemIds);
            } catch (error) {
                console.error("Error persisting saved items:", error);
            }
        };

        if (savedItemIds.length > 0) {
            persistSavedItems();
        }
    }, [savedItemIds]);

    // Fetch products with filters
    const fetchProducts = async (newFilters?: ProductFilters) => {
        try {
            setLoading(true);
            setError(null);

            // Apply new filters if provided, otherwise use existing
            const filtersToUse = newFilters ? { ...filters, ...newFilters } : filters;

            if (newFilters) {
                setFilters(filtersToUse);
            }

            const data = await ProductService.getProducts(filtersToUse);
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single product by ID
    const getProductById = async (id: string): Promise<Product | null> => {
        try {
            setLoading(true);
            setError(null);

            const product = await ProductService.getProductById(id);
            return product;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching product');
            console.error('Error fetching product by ID:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Fetch products by category
    const getProductsByCategory = async (category: string, limit = 20): Promise<Product[]> => {
        try {
            setLoading(true);
            setError(null);

            const data = await ProductService.getProductsByCategory(category, limit);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching products by category');
            console.error('Error fetching products by category:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured products
    const getFeaturedProducts = async (limit = 10): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const data = await ProductService.getFeaturedProducts(limit);
            setFeaturedProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching featured products');
            console.error('Error fetching featured products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Save a product to saved items
    const saveProduct = (id: string) => {
        console.log("saveProduct called with id:", id);
        if (!id) {
            console.warn("Attempted to save item with invalid ID");
            return;
        }

        setSavedItemIds(prev => {
            if (!prev.includes(id)) {
                console.log("Adding item to saved items:", id);
                return [...prev, id];
            }
            return prev;
        });
    };

    // Remove a product from saved items
    const unsaveProduct = (id: string) => {
        console.log("unsaveProduct called with id:", id);
        if (!id) {
            console.warn("Attempted to remove item with invalid ID");
            return;
        }

        setSavedItemIds(prev => {
            const newItems = prev.filter(itemId => itemId !== id);
            console.log("New saved items after removal:", newItems);
            return newItems;
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            excludeUnlikelySH: true // Maintain this filter even when clearing others
        });
    };

    // Load initial featured products
    useEffect(() => {
        getFeaturedProducts();
    }, []);

    // Create context value
    const value: ProductContextType = {
        products,
        featuredProducts,
        loading,
        error,
        savedItemIds,
        saveProduct,
        unsaveProduct,
        fetchProducts,
        getProductById,
        getProductsByCategory,
        getFeaturedProducts,
        filters,
        setFilters,
        clearFilters,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

// Custom hook for using the ProductContext
export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}; 