import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import ProductService from '../services/ProductService';
import supabase from '../utils/supabase';
import api from '../utils/api';

// Define types
interface SimpleProduct {
    id: string;
    title: string;
    images: string[] | null;
    supabase_image_url?: string;
    imageUrls?: string[]; // Added for processed URLs
}

const ImageTest = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<SimpleProduct[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [apiUrl, setApiUrl] = useState(api.baseUrl);
    const [useSupabase, setUseSupabase] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [useSupabase]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            if (useSupabase) {
                // Fetch products with Supabase images
                const { data, error } = await supabase
                    .from('products')
                    .select('id, title, images')
                    .limit(10);

                if (error) {
                    throw error;
                }

                if (data && data.length > 0) {
                    const productsWithUrls = data.map((product: SimpleProduct) => {
                        // Prioritize supabase_image_url field
                        let imageUrls: string[] = [];

                        if (product.supabase_image_url) {
                            imageUrls = [product.supabase_image_url];
                        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                            imageUrls = product.images
                                .filter(img => !!img && typeof img === 'string')
                                .map(img => img.startsWith('http') ? img : api.getUrl(img));
                        } else {
                            imageUrls = ['https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image'];
                        }

                        return {
                            ...product,
                            imageUrls
                        };
                    });

                    setProducts(productsWithUrls);
                    console.log('Fetched Supabase images:', productsWithUrls);
                } else {
                    setError('No Supabase images found. Try running the upload script first.');
                }
            } else {
                // Fallback to local server images
                const fetchedProducts = await ProductService.getProducts({ limit: 5 });

                if (fetchedProducts && fetchedProducts.length > 0) {
                    const productsWithUrls = fetchedProducts.map(product => {
                        return {
                            id: product.id,
                            title: product.title,
                            images: product.images,
                            supabase_image_url: product.supabase_image_url,
                            imageUrls: product.images
                        };
                    });

                    setProducts(productsWithUrls);
                } else {
                    setError('No products found with the local server approach.');
                }
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(`Failed to load products: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTestUrlChange = (increment: number) => {
        // Try different ports to find the correct one
        const currentUrl = new URL(apiUrl);
        const currentPort = parseInt(currentUrl.port) || 3000;
        const newPort = currentPort + increment;
        const newUrl = `${currentUrl.protocol}//${currentUrl.hostname}:${newPort}`;

        api.setApiBaseUrl(newUrl);
        setApiUrl(newUrl);

        // Refresh products with new URL
        fetchProducts();
    };

    const toggleImageSource = () => {
        setUseSupabase(!useSupabase);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.text}>Loading products...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.apiControls}>
                    <Text style={styles.subheader}>Current API URL: {apiUrl}</Text>
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleImageSource}
                    >
                        <Text style={styles.buttonText}>
                            Switch to {useSupabase ? 'Local Server' : 'Supabase'} Images
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleTestUrlChange(-1)}
                        >
                            <Text style={styles.buttonText}>Try Port {parseInt(new URL(apiUrl).port || "3000") - 1}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleTestUrlChange(1)}
                        >
                            <Text style={styles.buttonText}>Try Port {parseInt(new URL(apiUrl).port || "3000") + 1}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Image Loading Test</Text>
            <Text style={styles.subheader}>
                Using: {useSupabase ? 'Supabase Images' : 'Local Server Images'}
            </Text>
            <Text style={styles.subheader}>API URL: {apiUrl}</Text>

            <View style={styles.apiControls}>
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={toggleImageSource}
                >
                    <Text style={styles.buttonText}>
                        Switch to {useSupabase ? 'Local Server' : 'Supabase'} Images
                    </Text>
                </TouchableOpacity>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleTestUrlChange(-1)}
                    >
                        <Text style={styles.buttonText}>Try Port {parseInt(new URL(apiUrl).port || "3000") - 1}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleTestUrlChange(1)}
                    >
                        <Text style={styles.buttonText}>Try Port {parseInt(new URL(apiUrl).port || "3000") + 1}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {products.length === 0 ? (
                <View style={styles.noProductsContainer}>
                    <Text style={styles.noProductsText}>No products found</Text>
                </View>
            ) : (
                products.map((product) => (
                    <View key={product.id} style={styles.productCard}>
                        <Text style={styles.productTitle}>{product.title || 'Untitled Product'}</Text>

                        {product.imageUrls && product.imageUrls.length > 0 ? (
                            <>
                                <Text style={styles.imageUrl}>
                                    {useSupabase && product.supabase_image_url ? "Using Supabase Storage" : "Using API Server"}
                                </Text>
                                <Text style={styles.imageUrl}>URL: {product.imageUrls[0]}</Text>
                                <Image
                                    source={{ uri: product.imageUrls[0] }}
                                    style={styles.image}
                                    resizeMode="contain"
                                    onError={(e) => console.error(`Failed to load image: ${product.imageUrls?.[0]}`, e.nativeEvent.error)}
                                />
                            </>
                        ) : (
                            <Text style={styles.noImageText}>No image available</Text>
                        )}
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subheader: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    imageUrl: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#eee',
    },
    noImageText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 16,
    },
    apiControls: {
        marginBottom: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    toggleButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noProductsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    noProductsText: {
        fontSize: 16,
        color: '#666',
    },
});

export default ImageTest; 