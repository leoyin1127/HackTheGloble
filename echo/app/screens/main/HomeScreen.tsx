import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    Alert,
    ImageBackground,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ProductService, { Product } from '../../services/ProductService';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

// Sample data for fallback
const FALLBACK_ITEMS = [
    {
        id: '1',
        title: 'Vintage Denim Jacket',
        price: '$45.00',
        description: 'This classic denim jacket has been upcycled with sustainable materials. Perfect for any casual outfit.',
        image: { uri: 'https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket' },
        sellerName: 'ameliegong',
        sellerRating: 5,
        sellerAvatar: { uri: 'https://i.pinimg.com/1200x/77/00/70/7700709ac1285b907c498a70fbccea5e.jpg' },
        sustainability: 95,
        sustainabilityBadges: ['Organic', 'Recycled', 'Local'],
    },
    {
        id: '2',
        title: 'Handcrafted Plant Pot',
        price: '$28.00',
        description: 'Hand-crafted ceramic pot made from reclaimed clay. Each piece is unique and helps reduce waste.',
        image: { uri: 'https://placehold.co/600x800/E8F5E9/2C3E50?text=Plant+Pot' },
        sellerName: 'ecofriendly',
        sellerRating: 4.8,
        sellerAvatar: { uri: 'https://i.pinimg.com/1200x/77/00/70/7700709ac1285b907c498a70fbccea5e.jpg' },
        sustainability: 87,
        sustainabilityBadges: ['Handmade', 'Recycled'],
    },
    {
        id: '3',
        title: 'Organic Cotton Shirt',
        price: '$32.00',
        description: 'Made with 100% organic cotton and natural dyes. Comfortable, breathable, and eco-friendly.',
        image: { uri: 'https://placehold.co/600x800/F9FBE7/2C3E50?text=Shirt' },
        sellerName: 'greenbasics',
        sellerRating: 4.5,
        sellerAvatar: { uri: 'https://i.pinimg.com/1200x/77/00/70/7700709ac1285b907c498a70fbccea5e.jpg' },
        sustainability: 92,
        sustainabilityBadges: ['Organic', 'Fair Trade'],
    },
    {
        id: '4',
        title: 'Bamboo Desk Organizer',
        price: '$18.99',
        description: 'Sustainable bamboo desk organizer to keep your workspace tidy. Naturally antibacterial and renewable.',
        image: { uri: 'https://placehold.co/600x800/E1F5FE/2C3E50?text=Organizer' },
        sellerName: 'sustainashop',
        sellerRating: 4.7,
        sellerAvatar: { uri: 'https://i.pinimg.com/1200x/77/00/70/7700709ac1285b907c498a70fbccea5e.jpg' },
        sustainability: 90,
        sustainabilityBadges: ['Renewable', 'Biodegradable'],
    },
];

// Add a baseUrl for the server API
const API_BASE_URL = 'http://localhost:3000';

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows, animation } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedItems, setSavedItems] = useState<string[]>([]);
    const [showGoodChoice, setShowGoodChoice] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredItems, setFilteredItems] = useState<Product[]>([]);
    const [bucketIndex, setBucketIndex] = useState(0);
    const possibleBuckets = ['products', 'images', 'uploads', 'files'];

    // Animation values
    const position = useRef(new Animated.ValueXY()).current;
    const rotation = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const detailsAnim = useRef(new Animated.Value(0)).current;

    const likeOpacity = position.x.interpolate({
        inputRange: [-width / 4, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const nopeOpacity = position.x.interpolate({
        inputRange: [0, width / 4],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Adding a scale animation for item entrance
    const entryAnim = useRef(new Animated.Value(0.9)).current;

    // Navigation handler for ImageTest screen
    const navigateToImageTest = () => {
        navigation.navigate('ImageTest');
    };

    // Fetch products from the database
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                const fetchedProducts = await ProductService.getProducts({ sortBy: 'sustainability', limit: 10 });

                if (!fetchedProducts || fetchedProducts.length === 0) {
                    console.log('No products returned from API, using fallback data');
                    // Use fallback if no products
                    setFilteredItems(getFallbackProducts());
                } else {
                    console.log(`Loaded ${fetchedProducts.length} products from API`);
                    setProducts(fetchedProducts);
                    setFilteredItems(fetchedProducts);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                // Use fallback data if fetch fails
                setFilteredItems(getFallbackProducts());
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Helper function to get fallback products
    const getFallbackProducts = (): Product[] => {
        return FALLBACK_ITEMS.map(item => {
            const processedItem: Product = {
                id: item.id,
                title: item.title,
                price: parseFloat(item.price.replace('$', '')),
                description: item.description,
                images: [item.image.uri],
                condition: 'good',
                seller_id: 'unknown-seller', // Provide a default string value
                sellerName: item.sellerName,
                sustainability: item.sustainability,
                sustainability_badges: item.sustainabilityBadges,
                sustainability_info: {},
                created_at: new Date(),
                updated_at: new Date(),
            };
            return processedItem;
        });
    };

    // Update filtered items when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredItems(products);
            setCurrentIndex(0);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = products.filter(product =>
                product.title.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                (product.brand && product.brand.toLowerCase().includes(query))
            );
            setFilteredItems(filtered);
            setCurrentIndex(0);
        }
    }, [searchQuery, products]);

    useEffect(() => {
        // Animate card entry
        Animated.spring(entryAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [currentIndex]);

    // Pan responder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !showDetails,
            onPanResponderMove: (_, gestureState) => {
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    swipeLeft(); // Swipe right (card moves right) -> Nope
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    swipeRight(); // Swipe left (card moves left) -> Like
                } else {
                    resetPosition();
                }
            },
        })
    ).current;

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const swipeRight = () => {
        // Ensure filteredItems[currentIndex] exists before accessing id
        if (filteredItems.length > currentIndex && filteredItems[currentIndex]) {
            // Save item and continue
            setSavedItems(prev => [...prev, filteredItems[currentIndex].id]);
        }

        Animated.timing(position, {
            toValue: { x: -width - 100, y: 0 },
            duration: animation.normal,
            useNativeDriver: true,
        }).start(() => {
            setShowGoodChoice(true);
            setTimeout(() => {
                setShowGoodChoice(false);
                setCurrentIndex(prevIndex => prevIndex + 1);
                position.setValue({ x: 0, y: 0 });
                entryAnim.setValue(0.9);
            }, 1200);
        });
    };

    const swipeLeft = () => {
        // Skip this item
        Animated.timing(position, {
            toValue: { x: width + 100, y: 0 },
            duration: animation.normal,
            useNativeDriver: true,
        }).start(() => {
            setCurrentIndex(prevIndex => prevIndex + 1);
            position.setValue({ x: 0, y: 0 });
            entryAnim.setValue(0.9);
        });
    };

    const toggleDetails = () => {
        if (showDetails) {
            // Hide details
            Animated.timing(detailsAnim, {
                toValue: 0,
                duration: animation.fast,
                useNativeDriver: true,
            }).start(() => setShowDetails(false));
        } else {
            // Show details
            setShowDetails(true);
            Animated.timing(detailsAnim, {
                toValue: 1,
                duration: animation.fast,
                useNativeDriver: true,
            }).start();
        }
    };

    const handleChatPress = () => {
        const item = filteredItems[currentIndex];
        if (item) {
            navigation.navigate('Chat', { sellerId: item.sellerName || 'unknown' });
        }
    };

    const handleSearchPress = () => {
        // Navigate to the Discover tab which contains the Search screen
        navigation.navigate('TabHome', {
            screen: 'Discover',
            params: {
                screen: 'Search',
                params: { query: searchQuery }
            }
        });
    };

    // Simplify the fixSupabaseImageUrl function to just use placeholder images
    const fixSupabaseImageUrl = (url?: string): string => {
        if (!url) {
            return 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';
        }

        // Return URL as is if it's already fully formed
        if (url.startsWith('http')) {
            return url;
        }

        // Handle relative URLs
        if (url.startsWith('/')) {
            return `${API_BASE_URL}${url}`;
        }

        // If we get here, it's not a valid URL, so use a placeholder
        return 'https://placehold.co/600x800/E0F7FA/2C3E50?text=Invalid+URL';
    };

    // Update the handleImageError function to use placeholder images directly rather than trying different buckets
    const handleImageError = () => {
        console.log('Image failed to load, using placeholder image');
        // Force re-render with placeholder image
        setFilteredItems(prevItems => {
            // Create a new copy of the items array with updated image
            return prevItems.map((p, idx) => {
                if (idx === currentIndex) {
                    return {
                        ...p,
                        // Replace the images array with a working placeholder
                        images: ['https://placehold.co/600x800/E0F7FA/2C3E50?text=Product']
                    };
                }
                return p;
            });
        });
    };

    const renderCard = () => {
        if (isLoading) {
            return (
                <View style={styles.cardContainer}>
                    <View style={[styles.card, { backgroundColor: colors.neutral.white }]}>
                        <View style={styles.emptyStateContainer}>
                            <ActivityIndicator size="large" color={colors.primary.main} />
                            <Text style={[styles.emptyStateTitle, { color: colors.neutral.darkGray, marginTop: spacing.md }]}>
                                Loading products...
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }

        if (currentIndex >= filteredItems.length || !filteredItems[currentIndex]) {
            // No more items to show or current item is undefined
            return (
                <View style={styles.cardContainer}>
                    <View style={[styles.card, { backgroundColor: colors.neutral.white }]}>
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="checkmark-circle-outline" size={80} color={colors.primary.main} />
                            <Text style={styles.emptyStateTitle}>You've seen all items!</Text>
                            <Text style={styles.emptyStateSubtitle}>Check back later for more sustainable products</Text>
                            <TouchableOpacity
                                style={[styles.resetButton, { backgroundColor: colors.primary.main, marginTop: 24 }]}
                                onPress={() => setCurrentIndex(0)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Start Over</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        const item = filteredItems[currentIndex];

        // Ensure item exists
        if (!item) {
            console.error('Item is undefined at index', currentIndex);
            return (
                <View style={styles.cardContainer}>
                    <View style={[styles.card, { backgroundColor: colors.neutral.white }]}>
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="alert-circle-outline" size={80} color={colors.semantic.error} />
                            <Text style={styles.emptyStateTitle}>Item Error</Text>
                            <Text style={styles.emptyStateSubtitle}>There was a problem loading this item</Text>
                            <TouchableOpacity
                                style={[styles.resetButton, { backgroundColor: colors.primary.main, marginTop: 24 }]}
                                onPress={() => setCurrentIndex(currentIndex + 1)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Skip This Item</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        // Log image data to debug
        console.log('Item images data:', JSON.stringify(item.images));

        // Get image URL with better fallback handling
        let imageUrl = 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';

        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            // If the image is already a full URL, use it directly
            if (typeof item.images[0] === 'string') {
                imageUrl = fixSupabaseImageUrl(item.images[0]);
            }
            // If we have an object with url property (from Supabase join query)
            else if (typeof item.images[0] === 'object' && item.images[0] !== null) {
                const imageObject = item.images[0] as any;
                if (imageObject && imageObject.url) {
                    imageUrl = fixSupabaseImageUrl(imageObject.url);
                }
            }
            console.log('Using image URL:', imageUrl);
        } else {
            console.log('No valid images found, using placeholder');
        }

        // Variables for current and next card
        const nextItem = currentIndex < filteredItems.length - 1 ? filteredItems[currentIndex + 1] : null;

        // Transform for the card sliding and rotation
        const cardAnimatedStyle = {
            transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: rotation },
                { scale: entryAnim }
            ]
        };

        // Details overlay animations
        const detailsOverlayStyle = {
            opacity: detailsAnim,
            transform: [
                {
                    translateY: detailsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                    })
                }
            ]
        };

        const mainInfoStyle = {
            opacity: showDetails ? 0 : 1,
        };

        return (
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.card,
                    {
                        transform: [
                            { translateX: position.x },
                            { translateY: position.y },
                            { rotate: rotation },
                            { scale: entryAnim },
                        ],
                        backgroundColor: colors.neutral.white,
                        borderRadius: borderRadius.lg,
                    },
                ]}
            >
                {/* Header with Logo and Icons */}
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: 'https://placehold.co/100x40/00C78C/FFFFFF?text=GreenSwap' }}
                        style={styles.logo}
                    />
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={24} color={colors.neutral.charcoal} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="cog-outline" size={24} color={colors.neutral.charcoal} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.cardContent}>
                    {/* Item Image */}
                    <View style={[styles.imageContainer, { borderRadius: borderRadius.xl, overflow: 'hidden' }]}>
                        <ImageBackground
                            source={{ uri: imageUrl }}
                            style={styles.itemImage}
                            onError={handleImageError}
                        >
                            {/* Seller info (positioned at top of image) */}
                            <BlurView
                                intensity={80}
                                style={[
                                    styles.sellerContainer,
                                    { borderRadius: borderRadius.lg }
                                ]}
                            >
                                <View style={styles.sellerInfo}>
                                    <Image
                                        source={{ uri: 'https://i.pinimg.com/1200x/77/00/70/7700709ac1285b907c498a70fbccea5e.jpg' }}
                                        style={styles.sellerAvatar}
                                    />
                                    <Text style={[styles.sellerName, { color: colors.neutral.charcoal }]}>
                                        {item.sellerName || 'Unknown'}
                                    </Text>
                                </View>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={18} color={colors.accent.beige} />
                                    <Text style={[styles.ratingText, { color: colors.neutral.charcoal }]}>
                                        4.5
                                    </Text>
                                </View>
                            </BlurView>

                            {/* Sustainability score badge */}
                            <BlurView
                                intensity={90}
                                style={[
                                    styles.sustainabilityBadge,
                                    { borderRadius: borderRadius.round }
                                ]}
                            >
                                <View style={[
                                    styles.circleProgress,
                                    {
                                        borderColor: getSustainabilityColor(item.sustainability),
                                        backgroundColor: `${getSustainabilityColor(item.sustainability)}20`
                                    }
                                ]}>
                                    <Text style={[
                                        styles.sustainabilityScore,
                                        { color: getSustainabilityColor(item.sustainability) }
                                    ]}>
                                        {item.sustainability}
                                    </Text>
                                </View>
                            </BlurView>

                            {/* Image Gradient Overlay for better text contrast */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.5)']}
                                style={styles.imageGradient}
                            />

                            {/* Item name and price - visible on the image */}
                            <Animated.View style={[styles.itemMainInfo, mainInfoStyle]}>
                                <Text style={[styles.itemTitle, { color: colors.neutral.white, fontSize: typography.fontSize.xxl }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.itemPrice, { color: colors.neutral.white, fontSize: typography.fontSize.lg }]}>
                                    ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                </Text>
                            </Animated.View>

                            {/* Expandable details overlay */}
                            <Animated.View
                                style={[
                                    styles.detailsOverlay,
                                    detailsOverlayStyle
                                ]}
                                pointerEvents={showDetails ? 'auto' : 'none'}
                            >
                                <BlurView intensity={85} style={styles.detailsBlur}>
                                    <View style={[styles.detailsHeader, { borderBottomColor: colors.neutral.lightGray }]}>
                                        <Text style={[styles.detailsTitle, { color: colors.neutral.charcoal, fontSize: typography.fontSize.lg }]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.detailsPrice, { color: colors.primary.main, fontSize: typography.fontSize.lg }]}>
                                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                        </Text>
                                    </View>

                                    <Text style={[styles.description, { color: colors.neutral.darkGray, fontSize: typography.fontSize.md }]}>
                                        {item.description}
                                    </Text>

                                    <View style={styles.sustainabilityBadges}>
                                        {item.sustainability_badges && item.sustainability_badges.map((badge, index) => (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.badge,
                                                    {
                                                        backgroundColor: `${colors.primary.main}20`,
                                                        borderRadius: borderRadius.round
                                                    }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.badgeText,
                                                    { color: colors.primary.main, fontSize: typography.fontSize.sm }
                                                ]}>
                                                    {badge}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.chatButton]}
                                        onPress={handleChatPress}
                                    >
                                        <LinearGradient
                                            colors={[colors.gradients.primary[0], colors.gradients.primary[1]]}
                                            style={[styles.chatButtonGradient, { borderRadius: borderRadius.lg }]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={[styles.chatButtonText, { color: colors.neutral.white }]}>
                                                Chat with Seller
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.closeDetailsButton}
                                        onPress={toggleDetails}
                                    >
                                        <Ionicons name="chevron-down" size={24} color={colors.neutral.white} />
                                    </TouchableOpacity>
                                </BlurView>
                            </Animated.View>

                            {/* Like and Nope overlays */}
                            <Animated.View style={[styles.likeOverlay, { opacity: nopeOpacity }]}>
                                <BlurView intensity={80} style={[styles.overlayBadge, { borderColor: colors.semantic.error }]}>
                                    <Text style={[styles.overlayText, { color: colors.semantic.error }]}>NOPE</Text>
                                </BlurView>
                            </Animated.View>

                            <Animated.View style={[styles.nopeOverlay, { opacity: likeOpacity }]}>
                                <BlurView intensity={80} style={[styles.overlayBadge, { borderColor: colors.primary.main }]}>
                                    <Text style={[styles.overlayText, { color: colors.primary.main }]}>LIKE</Text>
                                </BlurView>
                            </Animated.View>

                            {/* Info button - toggles detailed view */}
                            <TouchableOpacity
                                style={[
                                    styles.infoButton,
                                    {
                                        borderRadius: borderRadius.round,
                                        opacity: showDetails ? 0 : 1,
                                        pointerEvents: showDetails ? 'none' : 'auto'
                                    }
                                ]}
                                onPress={toggleDetails}
                            >
                                <Ionicons name="chevron-up" size={24} color={colors.neutral.white} />
                            </TouchableOpacity>
                        </ImageBackground>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.semantic.error }]} onPress={swipeLeft}>
                        <Ionicons name="close" size={26} color={colors.neutral.white} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary.main }]} onPress={handleSearchPress}>
                        <Ionicons name="grid-outline" size={26} color={colors.neutral.white} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.semantic.error }]} onPress={handleChatPress}>
                        <Ionicons name="chatbubble-outline" size={26} color={colors.neutral.white} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.neutral.lightGray }]} onPress={() => navigation.navigate('Saved')}>
                        <Ionicons name="bookmark-outline" size={26} color={colors.neutral.darkGray} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary.main }]} onPress={swipeRight}>
                        <Ionicons name="heart-outline" size={26} color={colors.neutral.white} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderGoodChoiceScreen = () => {
        return (
            <View style={[styles.goodChoiceContainer, { backgroundColor: colors.neutral.white, ...shadows.xl }]}>
                <LinearGradient
                    colors={['rgba(0,199,140,0.1)', 'rgba(0,199,140,0.05)']}
                    style={styles.goodChoiceGradient}
                />

                <View style={styles.confettiContainer}>
                    {/* Add animated confetti here if desired */}
                </View>

                <Text style={[styles.goodChoiceText, { color: colors.primary.main, fontSize: typography.fontSize.display2 }]}>
                    Good Choice!
                </Text>

                <Text style={[styles.goodChoiceSubtext, { color: colors.neutral.darkGray, fontSize: typography.fontSize.md }]}>
                    You've made a sustainable decision
                </Text>

                <View style={styles.goodChoiceButtonsRow}>
                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            {
                                borderColor: colors.semantic.error,
                                backgroundColor: `${colors.semantic.error}10`
                            }
                        ]}
                        onPress={swipeLeft}
                    >
                        <Ionicons name="close" size={30} color={colors.semantic.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            {
                                borderColor: colors.semantic.error,
                                backgroundColor: `${colors.semantic.error}10`
                            }
                        ]}
                        onPress={handleChatPress}
                    >
                        <Ionicons name="chatbubble-outline" size={30} color={colors.semantic.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            {
                                borderColor: colors.primary.main,
                                backgroundColor: `${colors.primary.main}10`
                            }
                        ]}
                        onPress={() => navigation.navigate('Saved')}
                    >
                        <Ionicons name="cart-outline" size={30} color={colors.primary.main} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Helper function to get color based on sustainability score
    const getSustainabilityColor = (score: number) => {
        if (score >= 90) return colors.primary.main;
        if (score >= 75) return colors.primary.light;
        if (score >= 60) return colors.accent.beige;
        return colors.semantic.error;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar style="dark" />

            {/* Test Images Button */}
            <TouchableOpacity
                style={[styles.testImagesButton, { backgroundColor: colors.primary.main }]}
                onPress={navigateToImageTest}
            >
                <Text style={styles.testImagesButtonText}>Test Images</Text>
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.neutral.offWhite }]}>
                <View style={[styles.searchInputContainer, {
                    backgroundColor: colors.neutral.white,
                    borderRadius: 25,
                    ...shadows.sm
                }]}>
                    <Ionicons name="search" size={22} color={colors.neutral.darkGray} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.neutral.charcoal, fontSize: typography.fontSize.md }]}
                        placeholder="Search sustainable products..."
                        placeholderTextColor={colors.neutral.mediumGray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.neutral.darkGray} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.container}>
                {filteredItems.length > 0 ? (
                    <>
                        {showGoodChoice ? renderGoodChoiceScreen() : renderCard()}
                    </>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="search-outline" size={80} color={colors.neutral.lightGray} />
                        <Text style={[styles.emptyStateTitle, { color: colors.neutral.darkGray }]}>No results found</Text>
                        <Text style={[styles.emptyStateDescription, { color: colors.neutral.mediumGray }]}>
                            Try adjusting your search or explore our recommendations
                        </Text>
                        <TouchableOpacity
                            style={[styles.resetButton, { backgroundColor: colors.primary.main, marginTop: 20 }]}
                            onPress={() => setSearchQuery('')}
                        >
                            <Text style={[styles.resetButtonText, { color: colors.neutral.white }]}>View All Products</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    card: {
        width: width * 0.9,
        height: height * 0.75,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#FFF',
    },
    cardHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    logo: {
        width: 120,
        height: 30,
        resizeMode: 'contain',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 16,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
        paddingHorizontal: 0,
    },
    imageContainer: {
        flex: 1,
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
        height: 140,
    },
    sellerContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    sellerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerName: {
        fontWeight: 'bold',
        marginLeft: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    ratingText: {
        fontWeight: '700',
    },
    itemMainInfo: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
    },
    itemTitle: {
        fontWeight: '700',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    itemPrice: {
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    infoButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    detailsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    detailsBlur: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
    },
    detailsTitle: {
        fontWeight: '700',
        flex: 1,
    },
    detailsPrice: {
        fontWeight: '700',
    },
    description: {
        lineHeight: 22,
        marginBottom: 20,
    },
    sustainabilityBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    badgeText: {
        fontWeight: '600',
    },
    chatButton: {
        marginTop: 'auto',
    },
    chatButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    chatButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    closeDetailsButton: {
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonBlur: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    likeOverlay: {
        position: 'absolute',
        top: 100,
        left: 30,
        zIndex: 999,
    },
    nopeOverlay: {
        position: 'absolute',
        top: 100,
        right: 30,
        zIndex: 999,
    },
    overlayBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 4,
        backgroundColor: 'rgba(255,255,255,0.8)',
        transform: [{ rotate: '15deg' }],
    },
    overlayText: {
        fontSize: 28,
        fontWeight: '800',
    },
    actionButtonsRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    actionButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goodChoiceContainer: {
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        overflow: 'hidden',
    },
    goodChoiceGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    goodChoiceText: {
        fontWeight: '800',
        marginBottom: 16,
    },
    goodChoiceSubtext: {
        marginBottom: 40,
        textAlign: 'center',
        opacity: 0.8,
    },
    goodChoiceButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
    },
    circleButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCard: {
        width: width * 0.9,
        height: height * 0.6,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    endCardIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    endCardTitle: {
        fontWeight: '800',
        marginBottom: 16,
        textAlign: 'center',
    },
    endCardSubtitle: {
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
        opacity: 0.7,
    },
    resetButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 0,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyStateDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 40,
    },
    emptyStateSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 40,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sustainabilityBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    circleProgress: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sustainabilityScore: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    testButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        zIndex: 10,
    },
    testButtonText: {
        fontWeight: 'bold',
    },
    testImagesButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        zIndex: 1000,
    },
    testImagesButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default HomeScreen; 