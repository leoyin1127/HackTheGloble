import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Share,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ProductService, { Product } from '../../services/ProductService';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

type ItemDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ItemDetail'>;
type ItemDetailScreenRouteProp = RouteProp<MainStackParamList, 'ItemDetail'>;

const { width } = Dimensions.get('window');

const ItemDetailScreen = () => {
    const navigation = useNavigation<ItemDetailScreenNavigationProp>();
    const route = useRoute<ItemDetailScreenRouteProp>();
    const { itemId } = route.params;
    const { colors, typography, borderRadius, shadows } = useTheme();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedShippingIndex, setSelectedShippingIndex] = useState(0);

    // Fetch product data from database
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);

                // Get product details
                const productData = await ProductService.getProductById(itemId);

                if (!productData) {
                    setError('Product not found');
                    setLoading(false);
                    return;
                }

                setProduct(productData);

                // Also fetch related products
                if (productData.master_category) {
                    const relatedData = await ProductService.getRelatedProducts(
                        itemId,
                        productData.master_category
                    );
                    setRelatedProducts(relatedData);
                }

            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [itemId]);

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        Alert.alert(
            'Added to Cart',
            `${product.title} (Qty: ${quantity}) has been added to your cart.`,
            [
                {
                    text: 'Continue Shopping',
                    style: 'cancel',
                },
                {
                    text: 'Go to Cart',
                    onPress: () => navigation.navigate('Cart'),
                },
            ]
        );
    };

    const handleBuyNow = () => {
        navigation.navigate('Checkout');
    };

    const handleShare = async () => {
        if (!product) return;

        try {
            await Share.share({
                message: `Check out this sustainable find: ${product.title} for $${product.price}!`,
                url: 'https://sustainablemarketplace.app/item/' + product.id,
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share this item');
        }
    };

    const handleChat = () => {
        if (!product) return;

        navigation.navigate('Chat', {
            sellerId: product.seller_id,
            itemId: product.id
        });
    };

    const getProductImages = (): string[] => {
        if (!product) return [];

        // Handle different image formats
        if (product.images && product.images.length > 0) {
            return product.images.map(img => {
                // If already a full URL, return as is
                if (typeof img === 'string' && img.startsWith('http')) {
                    return img;
                }
                // Otherwise prefix with API URL if it's a relative path
                else if (typeof img === 'string' && img.startsWith('/')) {
                    return api.getUrl(img);
                }
                // Fallback
                return 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';
            });
        }

        // Fallback
        return ['https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image'];
    };

    const renderImageCarousel = () => {
        const images = getProductImages();

        return (
            <View style={styles.carouselContainer}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                        setActiveImageIndex(newIndex);
                    }}
                >
                    {images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.carouselImage}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>

                <View style={styles.paginationContainer}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === activeImageIndex && styles.activePaginationDot
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={styles.loadingText}>Loading product details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={[styles.container, styles.errorContainer]}>
                <StatusBar style="dark" />
                <Ionicons name="alert-circle-outline" size={60} color={colors.semantic.error} />
                <Text style={styles.errorText}>{error || 'Product not found'}</Text>
                <TouchableOpacity
                    style={styles.backToHomeButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.backToHomeText}>Back to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                >
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {renderImageCarousel()}

                <View style={styles.contentContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{product.title}</Text>

                        <View style={styles.productHeader}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                            </View>
                            <View style={styles.ratingsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                        key={star}
                                        name="star"
                                        size={18}
                                        color={star <= 4 ? colors.accent.beige : colors.neutral.lightGray}
                                    />
                                ))}
                                <Text style={styles.reviewCount}>(20 reviews)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{product.condition}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{product.size}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{product.brand}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Item Details</Text>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Brand:</Text>
                            <Text style={styles.detailValue}>{product.brand}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Size:</Text>
                            <Text style={styles.detailValue}>{product.size}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Material:</Text>
                            <Text style={styles.detailValue}>{product.material}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Color:</Text>
                            <Text style={styles.detailValue}>{product.color}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Condition:</Text>
                            <Text style={styles.detailValue}>{product.condition}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sustainability Impact</Text>
                        <View style={styles.sustainabilityBox}>
                            {product.sustainability_info && product.sustainability_info.impact ? (
                                <Text style={styles.sustainabilityText}>{product.sustainability_info.impact}</Text>
                            ) : (
                                <Text style={styles.sustainabilityText}>
                                    This item has a sustainability score of {product.sustainability}. Higher is better.
                                </Text>
                            )}
                        </View>
                        <View style={styles.certificationsContainer}>
                            {product.sustainability_info && product.sustainability_info.certifications ?
                                product.sustainability_info.certifications.map((cert: string, index: number) => (
                                    <View key={index} style={styles.certificationTag}>
                                        <Text style={styles.certificationText}>{cert}</Text>
                                    </View>
                                ))
                                : product.sustainability_badges && product.sustainability_badges.map((badge: string, index: number) => (
                                    <View key={index} style={styles.certificationTag}>
                                        <Text style={styles.certificationText}>{badge}</Text>
                                    </View>
                                ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Seller Information</Text>
                        <View style={styles.sellerContainer}>
                            <View style={styles.sellerInfo}>
                                <Text style={styles.sellerName}>
                                    {product.sellerName || 'Unknown Seller'}
                                </Text>
                                <View style={styles.ratingContainer}>
                                    <Text style={styles.ratingText}>
                                        ★ 4.5 (10 reviews)
                                    </Text>
                                </View>
                                <Text style={styles.sellerLocation}>
                                    Local
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.contactButton}>
                                <Text style={styles.contactButtonText}>Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shipping</Text>
                        <View style={styles.shippingOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.shippingOption,
                                    selectedShippingIndex === 0 && styles.selectedShippingOption
                                ]}
                                onPress={() => setSelectedShippingIndex(0)}
                            >
                                <View style={styles.shippingOptionInfo}>
                                    <Text style={styles.shippingOptionTitle}>Standard Shipping</Text>
                                    <Text style={styles.shippingOptionDelivery}>3-5 business days</Text>
                                </View>
                                <Text style={styles.shippingOptionPrice}>$4.99</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.shippingOption,
                                    selectedShippingIndex === 1 && styles.selectedShippingOption
                                ]}
                                onPress={() => setSelectedShippingIndex(1)}
                            >
                                <View style={styles.shippingOptionInfo}>
                                    <Text style={styles.shippingOptionTitle}>Express Shipping</Text>
                                    <Text style={styles.shippingOptionDelivery}>1-2 business days</Text>
                                </View>
                                <Text style={styles.shippingOptionPrice}>$9.99</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Quantity:</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={decrementQuantity}
                                disabled={quantity <= 1}
                            >
                                <Text style={quantity <= 1 ? styles.quantityButtonDisabled : styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={incrementQuantity}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.addToCartButton]}
                    onPress={handleAddToCart}
                >
                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buyNowButton]}
                    onPress={handleBuyNow}
                >
                    <Text style={styles.buyNowButtonText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#45B69C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    shareButton: {
        padding: 8,
    },
    shareButtonText: {
        color: '#45B69C',
        fontSize: 16,
    },
    carouselContainer: {
        height: width,
        width: '100%',
    },
    carouselImage: {
        width,
        height: width,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activePaginationDot: {
        backgroundColor: '#FFFFFF',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2C3E50',
        flex: 1,
        marginRight: 10,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#45B69C',
    },
    ratingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewCount: {
        fontSize: 14,
        color: '#7F8C8D',
        marginLeft: 5,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginRight: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#2C3E50',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#34495E',
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 15,
        color: '#7F8C8D',
        width: 80,
    },
    detailValue: {
        fontSize: 15,
        color: '#2C3E50',
        flex: 1,
    },
    sustainabilityBox: {
        backgroundColor: '#E8F5E9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },
    sustainabilityText: {
        fontSize: 14,
        color: '#2C3E50',
        flex: 1,
        lineHeight: 20,
    },
    certificationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    certificationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    certificationText: {
        fontSize: 12,
        color: '#2C3E50',
    },
    sellerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 24,
        padding: 15,
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    ratingText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    sellerLocation: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    contactButton: {
        backgroundColor: '#F0F0F0',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    contactButtonText: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
    },
    shippingOptions: {
        marginBottom: 10,
    },
    shippingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    selectedShippingOption: {
        backgroundColor: '#F9F9F9',
    },
    shippingOptionInfo: {
        flex: 1,
    },
    shippingOptionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2C3E50',
    },
    shippingOptionDelivery: {
        fontSize: 13,
        color: '#7F8C8D',
        marginTop: 2,
    },
    shippingOptionPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    quantityLabel: {
        fontSize: 16,
        color: '#2C3E50',
        marginRight: 15,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    quantityButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    quantityButtonText: {
        fontSize: 20,
        color: '#2C3E50',
    },
    quantityButtonDisabled: {
        fontSize: 20,
        color: '#CCCCCC',
    },
    quantityText: {
        width: 40,
        textAlign: 'center',
        fontSize: 16,
        color: '#2C3E50',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartButton: {
        backgroundColor: '#F5F5F5',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#45B69C',
    },
    addToCartButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#45B69C',
    },
    buyNowButton: {
        backgroundColor: '#45B69C',
    },
    buyNowButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#2C3E50',
        marginTop: 20,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#2C3E50',
        marginTop: 20,
    },
    backToHomeButton: {
        backgroundColor: '#45B69C',
        padding: 15,
        borderRadius: 5,
    },
    backToHomeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default ItemDetailScreen; 