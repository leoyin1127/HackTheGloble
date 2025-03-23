import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Animated,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ProductService, { Product } from '../../services/ProductService';
import { useProducts } from '../../context/ProductContext';
import Logo from '../../components/Logo';
import { LinearGradient } from 'expo-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment to implement storage

const { width, height } = Dimensions.get('window');

type SavedItemsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

// Sample saved items for fallback only
const FALLBACK_ITEMS = [
    {
        id: '1',
        title: 'Vintage Denim Jacket',
        price: '$45.00',
        image: { uri: 'https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket' },
        sellerName: 'ameliegong',
    },
    {
        id: '3',
        title: 'Organic Cotton Shirt',
        price: '$32.00',
        image: { uri: 'https://placehold.co/600x800/F9FBE7/2C3E50?text=Shirt' },
        sellerName: 'greenbasics',
    },
    {
        id: '6',
        title: 'Upcycled Glass Vase',
        price: '$24.00',
        image: { uri: 'https://placehold.co/600x800/FFF8E1/2C3E50?text=Vase' },
        sellerName: 'ecofriendly',
    },
];

// Helper function to convert fallback items to Product type
const getFallbackProducts = (): Product[] => {
    return FALLBACK_ITEMS.map(item => ({
        id: item.id,
        title: item.title,
        price: parseFloat(item.price.replace('$', '')),
        description: 'No description available',
        images: [item.image.uri],
        condition: 'good',
        seller_id: 'unknown-seller',
        sellerName: item.sellerName,
        sustainability: 80,
        sustainability_badges: ['Sustainable'],
        sustainability_info: {},
        created_at: new Date(),
        updated_at: new Date(),
    }));
};

const SavedItemsScreen = () => {
    const navigation = useNavigation<SavedItemsScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();
    const [savedItems, setSavedItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const { savedItemIds, unsaveProduct } = useProducts();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    // Fetch saved items from the database with error handling and retry
    useEffect(() => {
        const fetchSavedItems = async () => {
            setLoading(true);
            setError(null);

            console.log("SavedItemsScreen: fetchSavedItems called");
            console.log("SavedItemsScreen: Current savedItemIds:", savedItemIds);

            try {
                if (!savedItemIds || savedItemIds.length === 0) {
                    setSavedItems([]);
                    setLoading(false);
                    return;
                }

                // Fetch items with a delay to avoid overwhelming the server
                const items = await Promise.all(
                    savedItemIds.map((id, index) =>
                        new Promise<Product | null>((resolve, reject) => {
                            // Stagger requests slightly
                            setTimeout(async () => {
                                try {
                                    const product = await ProductService.getProductById(id);
                                    resolve(product);
                                } catch (error) {
                                    console.error(`Error fetching product with ID ${id}:`, error);
                                    resolve(null); // Resolve with null instead of rejecting
                                }
                            }, index * 100); // 100ms delay between each request
                        })
                    )
                );

                // Filter out any null results
                const validItems = items.filter(item => item !== null) as Product[];
                setSavedItems(validItems);
            } catch (err) {
                console.error("Error fetching saved items:", err);
                setError("Failed to load saved items");

                // If we've tried less than 3 times, retry after a delay
                if (retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount(prevCount => prevCount + 1);
                    }, 2000); // 2 second delay before retrying
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSavedItems();
    }, [savedItemIds, retryCount]);

    // Animate items in on mount
    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [loading, fadeAnim, slideAnim]);

    const handleRemoveItem = (itemId: string) => {
        unsaveProduct(itemId);
    };

    const getRandomPlaceholderImage = (item: Product) => {
        const imageUri = item.image_url ||
            (item.images && item.images.length > 0 ? item.images[0] : null) ||
            `https://source.unsplash.com/300x300/?fashion,clothing,${item.title?.replace(/\s+/g, ',')}`;

        return imageUri;
    };

    const renderSavedItem = ({ item, index }: { item: Product, index: number }) => {
        const imageUri = getRandomPlaceholderImage(item);

        // Apply staggered animation to each item
        const itemFadeAnim = new Animated.Value(0);
        const itemSlideAnim = new Animated.Value(20);

        Animated.parallel([
            Animated.timing(itemFadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(itemSlideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            })
        ]).start();

        return (
            <Animated.View
                style={[
                    {
                        opacity: itemFadeAnim,
                        transform: [{ translateY: itemSlideAnim }],
                        marginBottom: spacing.md,
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.savedItem,
                        {
                            backgroundColor: colors.neutral.white,
                            borderRadius: borderRadius.lg,
                            ...shadows.md,
                            overflow: 'hidden'
                        }
                    ]}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                    activeOpacity={0.9}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.5)']}
                            style={styles.imageGradient}
                        />
                        <View style={styles.actionButtonsOverlay}>
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    {
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                    }
                                ]}
                                onPress={() => navigation.navigate('Chat', {
                                    sellerId: item.sellerName || item.seller_id,
                                    itemId: item.id
                                })}
                            >
                                <Ionicons name="chatbubble" size={18} color={colors.primary.main} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    {
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                    }
                                ]}
                                onPress={() => handleRemoveItem(item.id)}
                            >
                                <Ionicons name="heart" size={18} color={colors.semantic.error} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.itemContent, { padding: spacing.md }]}>
                        <View style={styles.itemInfo}>
                            <Text
                                style={[
                                    styles.itemTitle,
                                    {
                                        color: colors.neutral.charcoal,
                                        fontSize: typography.fontSize.md,
                                        fontWeight: 'bold',
                                        marginBottom: spacing.xs,
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>

                            <Text
                                style={[
                                    styles.sellerName,
                                    {
                                        color: colors.neutral.darkGray,
                                        fontSize: typography.fontSize.sm,
                                    }
                                ]}
                            >
                                @{item.sellerName || item.seller_id || 'seller'}
                            </Text>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text
                                style={[
                                    styles.itemPrice,
                                    {
                                        color: colors.primary.dark,
                                        fontSize: typography.fontSize.lg,
                                        fontWeight: 'bold',
                                    }
                                ]}
                            >
                                ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
                <StatusBar style="dark" />
                <View style={[styles.header, {
                    backgroundColor: colors.neutral.white,
                    ...shadows.sm,
                }]}>
                    <Logo size="large" />
                </View>
                <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={{
                        marginTop: spacing.md,
                        color: colors.neutral.darkGray,
                        fontSize: typography.fontSize.md
                    }}>
                        Loading your treasures...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state (only if we completely failed after retries)
    if (error && savedItems.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
                <StatusBar style="dark" />
                <View style={[styles.header, {
                    backgroundColor: colors.neutral.white,
                    ...shadows.sm,
                }]}>
                    <Logo size="large" />
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Home')}>
                            <Ionicons name="home-outline" size={24} color={colors.neutral.charcoal} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.errorContainer, { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
                    <Ionicons name="cloud-offline-outline" size={80} color={colors.semantic.error} />
                    <Text style={[styles.errorTitle, {
                        color: colors.neutral.charcoal,
                        fontSize: typography.fontSize.lg,
                        marginTop: spacing.md,
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }]}>
                        Connection Error
                    </Text>
                    <Text style={[styles.errorMessage, {
                        color: colors.neutral.darkGray,
                        fontSize: typography.fontSize.md,
                        textAlign: 'center',
                        marginTop: spacing.sm,
                        marginBottom: spacing.lg
                    }]}>
                        We couldn't reach our servers. Please check your internet connection and try again.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, {
                            backgroundColor: colors.primary.main,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.lg,
                            borderRadius: borderRadius.md,
                            ...shadows.sm,
                        }]}
                        onPress={() => setRetryCount(0)}
                    >
                        <Text style={{ color: colors.neutral.white, fontWeight: 'bold' }}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar style="dark" />

            {/* Modern Gradient Header */}
            <LinearGradient
                colors={[colors.primary.main, colors.primary.light]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                    styles.header,
                    {
                        ...shadows.md,
                        borderBottomLeftRadius: borderRadius.lg,
                        borderBottomRightRadius: borderRadius.lg,
                    }
                ]}
            >
                <Logo size="large" />
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={[styles.headerIconButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Ionicons name="home-outline" size={22} color={colors.neutral.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="notifications-outline" size={22} color={colors.neutral.white} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <Animated.View
                style={[
                    styles.titleContainer,
                    {
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <Text style={[
                    styles.screenTitle,
                    {
                        color: colors.neutral.charcoal,
                        fontSize: typography.fontSize.xxl,
                        fontWeight: 'bold',
                        letterSpacing: typography.letterSpacing.wide
                    }
                ]}>
                    Your Favorites
                </Text>
                <Text style={[
                    styles.screenSubtitle,
                    {
                        color: colors.neutral.darkGray,
                        fontSize: typography.fontSize.md,
                        marginTop: spacing.xs
                    }
                ]}>
                    {savedItems.length} sustainable treasures saved
                </Text>
            </Animated.View>

            {savedItems.length > 0 ? (
                <FlatList
                    data={savedItems}
                    renderItem={renderSavedItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: spacing.lg,
                        paddingBottom: 90
                    }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                />
            ) : (
                <ScrollView
                    contentContainerStyle={[
                        styles.emptyStateContainer,
                        { paddingTop: spacing.xxxl }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.emptyStateContent,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={[
                            styles.emptyStateIconContainer,
                            {
                                backgroundColor: colors.primary.light + '40',
                                ...shadows.sm
                            }
                        ]}>
                            <Ionicons name="heart" size={60} color={colors.primary.main} />
                        </View>

                        <Text style={[
                            styles.emptyStateTitle,
                            {
                                color: colors.neutral.charcoal,
                                fontSize: typography.fontSize.xl,
                                marginTop: spacing.lg,
                                fontWeight: 'bold',
                            }
                        ]}>
                            No favorites yet
                        </Text>

                        <Text style={[
                            styles.emptyStateSubtitle,
                            {
                                color: colors.neutral.darkGray,
                                fontSize: typography.fontSize.md,
                                marginTop: spacing.sm,
                                textAlign: 'center',
                                lineHeight: typography.lineHeight.md,
                                maxWidth: width * 0.8
                            }
                        ]}>
                            Start saving sustainable treasures by tapping the heart icon on items you love
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.browseButton,
                                {
                                    backgroundColor: colors.primary.main,
                                    marginTop: spacing.xl,
                                    paddingVertical: spacing.md,
                                    paddingHorizontal: spacing.xl,
                                    borderRadius: borderRadius.lg,
                                    ...shadows.md
                                }
                            ]}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={[
                                styles.browseButtonText,
                                {
                                    color: colors.neutral.white,
                                    fontWeight: 'bold',
                                    fontSize: typography.fontSize.md
                                }
                            ]}>
                                Discover Items
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 12,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    headerIconButton: {
        marginLeft: 12,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    titleContainer: {
        marginBottom: 12,
    },
    screenTitle: {
        fontWeight: 'bold',
    },
    screenSubtitle: {
        opacity: 0.8,
    },
    savedItem: {
        overflow: 'hidden',
    },
    imageContainer: {
        height: 180,
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    actionButtonsOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'column',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '600',
    },
    sellerName: {
        opacity: 0.7,
    },
    priceContainer: {
        paddingLeft: 10,
    },
    itemPrice: {
        fontWeight: 'bold',
    },
    emptyStateContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyStateIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        textAlign: 'center',
        marginHorizontal: 20,
    },
    browseButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    browseButtonText: {
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorTitle: {
        fontWeight: 'bold',
    },
    errorMessage: {
        textAlign: 'center',
    },
    retryButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SavedItemsScreen; 