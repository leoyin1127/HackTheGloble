import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Share,
    Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MainStackParamList } from '../../navigation/AppNavigator';

type ItemDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ItemDetail'>;
type ItemDetailScreenRouteProp = RouteProp<MainStackParamList, 'ItemDetail'>;

const { width } = Dimensions.get('window');

// Mock data for a single item
const ITEM = {
    id: '1',
    title: 'Vintage Denim Jacket',
    price: '$45.00',
    discountedPrice: '$39.99',
    images: [
        'https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket+1',
        'https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket+2',
        'https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket+3',
    ],
    description: 'Authentic vintage denim jacket from the 90s in excellent condition. Features classic styling with button front closure and front flap pockets. Perfect for layering in any season.',
    condition: 'Excellent',
    brand: 'Levi\'s',
    size: 'Medium',
    material: '100% Cotton Denim',
    color: 'Medium Wash Blue',
    sustainabilityInfo: {
        impact: 'Buying this pre-owned item reduces water usage by approximately 1,680 gallons compared to a new jacket.',
        certifications: ['Second-Hand Certified', 'Quality Verified'],
        condition: '9/10 - Minimal wear, no visible flaws',
    },
    seller: {
        id: 'seller123',
        name: 'EcoFashion',
        rating: 4.8,
        totalRatings: 156,
        location: 'Toronto, Canada',
    },
    shipping: {
        options: [
            { method: 'Standard', price: '$4.99', time: '5-7 days' },
            { method: 'Express', price: '$9.99', time: '2-3 days' },
        ],
        returns: '30-day returns accepted',
    }
};

const ItemDetailScreen = () => {
    const navigation = useNavigation<ItemDetailScreenNavigationProp>();
    const route = useRoute<ItemDetailScreenRouteProp>();
    const { itemId } = route.params;

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedShippingIndex, setSelectedShippingIndex] = useState(0);

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        Alert.alert(
            'Added to Cart',
            `${ITEM.title} (Qty: ${quantity}) has been added to your cart.`,
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
        try {
            await Share.share({
                message: `Check out this sustainable find: ${ITEM.title} for ${ITEM.price}!`,
                url: 'https://sustainablemarketplace.app/item/' + ITEM.id,
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share this item');
        }
    };

    const renderImageCarousel = () => {
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
                    {ITEM.images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.carouselImage}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>

                <View style={styles.paginationContainer}>
                    {ITEM.images.map((_, index) => (
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
                        <Text style={styles.title}>{ITEM.title}</Text>

                        <View style={styles.priceContainer}>
                            <Text style={styles.discountedPrice}>{ITEM.discountedPrice}</Text>
                            <Text style={styles.originalPrice}>{ITEM.price}</Text>
                        </View>
                    </View>

                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{ITEM.condition}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{ITEM.size}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{ITEM.brand}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{ITEM.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Item Details</Text>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Brand:</Text>
                            <Text style={styles.detailValue}>{ITEM.brand}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Size:</Text>
                            <Text style={styles.detailValue}>{ITEM.size}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Material:</Text>
                            <Text style={styles.detailValue}>{ITEM.material}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Color:</Text>
                            <Text style={styles.detailValue}>{ITEM.color}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Condition:</Text>
                            <Text style={styles.detailValue}>{ITEM.condition}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sustainability Impact</Text>
                        <View style={styles.sustainabilityBox}>
                            <Text style={styles.sustainabilityText}>{ITEM.sustainabilityInfo.impact}</Text>
                        </View>
                        <View style={styles.certificationsContainer}>
                            {ITEM.sustainabilityInfo.certifications.map((cert, index) => (
                                <View key={index} style={styles.certificationTag}>
                                    <Text style={styles.certificationText}>{cert}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Seller Information</Text>
                        <View style={styles.sellerContainer}>
                            <View style={styles.sellerInfo}>
                                <Text style={styles.sellerName}>{ITEM.seller.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Text style={styles.ratingText}>
                                        ★ {ITEM.seller.rating} ({ITEM.seller.totalRatings} reviews)
                                    </Text>
                                </View>
                                <Text style={styles.sellerLocation}>{ITEM.seller.location}</Text>
                            </View>
                            <TouchableOpacity style={styles.contactButton}>
                                <Text style={styles.contactButtonText}>Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shipping</Text>
                        <View style={styles.shippingOptions}>
                            {ITEM.shipping.options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.shippingOption,
                                        selectedShippingIndex === index && styles.selectedShippingOption
                                    ]}
                                    onPress={() => setSelectedShippingIndex(index)}
                                >
                                    <View style={styles.radioButton}>
                                        {selectedShippingIndex === index && <View style={styles.radioButtonInner} />}
                                    </View>
                                    <View style={styles.shippingOptionDetails}>
                                        <Text style={styles.shippingMethod}>{option.method}</Text>
                                        <Text style={styles.shippingTime}>{option.time}</Text>
                                    </View>
                                    <Text style={styles.shippingPrice}>{option.price}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.returnsText}>{ITEM.shipping.returns}</Text>
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
    priceContainer: {
        alignItems: 'flex-end',
    },
    discountedPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#45B69C',
    },
    originalPrice: {
        fontSize: 16,
        color: '#95A5A6',
        textDecorationLine: 'line-through',
        marginTop: 3,
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
        borderRadius: 10,
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
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#45B69C',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#45B69C',
    },
    shippingOptionDetails: {
        flex: 1,
    },
    shippingMethod: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2C3E50',
    },
    shippingTime: {
        fontSize: 13,
        color: '#7F8C8D',
        marginTop: 2,
    },
    shippingPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    returnsText: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 10,
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
});

export default ItemDetailScreen; 