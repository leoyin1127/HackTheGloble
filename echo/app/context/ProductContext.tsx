import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import ProductService, { Product, ProductFilters } from '../services/ProductService';

// Context type definition
interface ProductContextType {
    // Products data
    products: Product[];
    featuredProducts: Product[];
    loading: boolean;
    error: string | null;

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
    const [filters, setFilters] = useState<ProductFilters>({});

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

    // Clear all filters
    const clearFilters = () => {
        setFilters({});
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