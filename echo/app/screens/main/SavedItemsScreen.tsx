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
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment to implement storage

type SavedItemsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const { width } = Dimensions.get('window');

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

    // Example saved IDs - in a real app, this would come from user preferences or state
    // For a production app, you would store and retrieve this from AsyncStorage
    const savedItemIds = ['1', '2', '3']; // Limit to small number for performance

    // Fetch saved items from the database with error handling and retry
    useEffect(() => {
        const fetchSavedItems = async () => {
            try {
                setLoading(true);

                // For production, this would use AsyncStorage to get the saved IDs
                // const savedIds = await AsyncStorage.getItem('savedItemIds');
                // const parsedIds = savedIds ? JSON.parse(savedIds) : [];

                if (savedItemIds.length === 0) {
                    setSavedItems([]);
                    setLoading(false);
                    return;
                }

                // Limit the number of items to fetch
                const itemsToFetch = savedItemIds.slice(0, 10); // Never fetch more than 10

                const items = await ProductService.getSavedProducts(itemsToFetch);

                if (items && items.length > 0) {
                    setSavedItems(items);
                    setError(null);
                } else {
                    // No items found, use fallback
                    console.log('No saved items found, using fallback');
                    setSavedItems(getFallbackProducts());
                }
            } catch (err) {
                console.error('Error fetching saved items:', err);
                setError('Failed to load saved items');

                // Only use fallback after retry attempts
                if (retryCount >= 2) {
                    setSavedItems(getFallbackProducts());
                } else {
                    // Implement exponential backoff for retries
                    const retryDelay = Math.pow(2, retryCount) * 1000;
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, retryDelay);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSavedItems();
    }, [retryCount]);

    // Handle item removal (for production app)
    const handleRemoveItem = async (itemId: string) => {
        // Optimistic UI update
        setSavedItems(current => current.filter(item => item.id !== itemId));

        // For production, this would persist the change to AsyncStorage
        // const newSavedIds = savedItemIds.filter(id => id !== itemId);
        // await AsyncStorage.setItem('savedItemIds', JSON.stringify(newSavedIds));

        // Show success message or handle errors
    };

    const renderSavedItem = ({ item }: { item: Product }) => {
        // Get the first image or use a placeholder
        const imageUri = item.images && item.images.length > 0
            ? item.images[0]
            : item.supabase_image_url || 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';

        return (
            <View
                style={[
                    styles.savedItem,
                    {
                        borderBottomColor: colors.neutral.lightGray,
                        borderBottomWidth: 1,
                        padding: spacing.md,
                        backgroundColor: colors.neutral.white,
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={[
                            styles.itemImage,
                            {
                                borderRadius: borderRadius.md,
                            }
                        ]}
                    />

                    <View style={[styles.itemInfo, { marginLeft: spacing.md }]}>
                        <Text
                            style={[
                                styles.itemTitle,
                                {
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
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
                                    marginBottom: spacing.xs,
                                }
                            ]}
                        >
                            @{item.sellerName || 'seller'}
                        </Text>

                        <Text
                            style={[
                                styles.itemPrice,
                                {
                                    color: colors.primary.dark,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: 'bold',
                                }
                            ]}
                        >
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: colors.semantic.error + '20', // 20% opacity
                                marginBottom: spacing.sm,
                            }
                        ]}
                        onPress={() => navigation.navigate('Chat', { sellerId: item.sellerName || item.seller_id })}
                    >
                        <Ionicons name="chatbubble" size={20} color={colors.semantic.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: colors.primary.main + '20', // 20% opacity
                            }
                        ]}
                        onPress={() => handleRemoveItem(item.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.primary.main} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
                <StatusBar style="dark" />
                <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={{ marginTop: spacing.md, color: colors.neutral.darkGray }}>Loading saved items...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state (only if we completely failed after retries)
    if (error && savedItems.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
                <StatusBar style="dark" />
                <View style={[styles.errorContainer, { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
                    <Ionicons name="alert-circle-outline" size={60} color={colors.semantic.error} />
                    <Text style={[styles.errorTitle, {
                        color: colors.neutral.charcoal,
                        fontSize: typography.fontSize.lg,
                        marginTop: spacing.md,
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }]}>
                        Could not load saved items
                    </Text>
                    <Text style={[styles.errorMessage, {
                        color: colors.neutral.darkGray,
                        fontSize: typography.fontSize.md,
                        textAlign: 'center',
                        marginTop: spacing.sm,
                        marginBottom: spacing.lg
                    }]}>
                        There was a problem connecting to the server. Please try again later.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, {
                            backgroundColor: colors.primary.main,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.lg,
                            borderRadius: borderRadius.md
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

            {/* Header */}
            <View style={[
                styles.header,
                {
                    backgroundColor: colors.neutral.white,
                    ...shadows.sm,
                    borderBottomLeftRadius: borderRadius.lg,
                    borderBottomRightRadius: borderRadius.lg,
                }
            ]}>
                <Text style={[styles.logo, { color: colors.neutral.charcoal }]}>LOGO</Text>

                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIconButton}>
                        <Ionicons name="notifications" size={24} color={colors.neutral.charcoal} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconButton}>
                        <Ionicons name="settings" size={24} color={colors.neutral.charcoal} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.titleContainer, { padding: spacing.md }]}>
                <Text style={[
                    styles.screenTitle,
                    { color: colors.neutral.charcoal, fontSize: typography.fontSize.xl }
                ]}>
                    Saved Items
                </Text>
            </View>

            {savedItems.length > 0 ? (
                <FlatList
                    data={savedItems}
                    renderItem={renderSavedItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    initialNumToRender={5} // Only render what's visible initially
                    maxToRenderPerBatch={5} // Reduce batch size for better performance
                    windowSize={5} // Reduce window size for better performance
                />
            ) : (
                <View style={[styles.emptyState, { paddingTop: spacing.xxxl }]}>
                    <Ionicons name="heart" size={80} color={colors.neutral.lightGray} />
                    <Text style={[
                        styles.emptyStateTitle,
                        {
                            color: colors.neutral.darkGray,
                            fontSize: typography.fontSize.lg,
                            marginTop: spacing.lg,
                        }
                    ]}>
                        No saved items yet
                    </Text>
                    <Text style={[
                        styles.emptyStateSubtitle,
                        {
                            color: colors.neutral.mediumGray,
                            fontSize: typography.fontSize.md,
                            marginTop: spacing.sm,
                            textAlign: 'center',
                        }
                    ]}>
                        Items you like will appear here. Start browsing to find sustainable treasures!
                    </Text>
                    <TouchableOpacity
                        style={[styles.browseButton, {
                            backgroundColor: colors.primary.main,
                            marginTop: spacing.xl,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.lg,
                            borderRadius: borderRadius.md
                        }]}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={{ color: colors.neutral.white, fontWeight: 'bold' }}>
                            Browse Items
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    headerIconButton: {
        marginLeft: 16,
    },
    titleContainer: {
        marginBottom: 8,
    },
    screenTitle: {
        fontWeight: 'bold',
    },
    savedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '600',
    },
    sellerName: {
        fontWeight: '400',
    },
    itemPrice: {
        marginTop: 'auto',
    },
    actionButtons: {
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontWeight: 'bold',
    },
    emptyStateSubtitle: {
        lineHeight: 22,
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
    browseButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SavedItemsScreen; 