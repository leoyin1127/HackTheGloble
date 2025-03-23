import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
    Image,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import PlaceholderImage from '../../components/PlaceholderImage';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from '../../context/ProductContext';
import { Product, ProductFilters } from '../../services/ProductService';
import ProductService from '../../services/ProductService';

type SearchScreenRouteProp = RouteProp<MainStackParamList, 'Search'>;
type SearchScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Search'>;

interface FilterOption {
    id: string;
    label: string;
    isSelected: boolean;
}

const { width } = Dimensions.get('window');

const SearchScreen = () => {
    const route = useRoute<SearchScreenRouteProp>();
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows, animation } = useTheme();
    const { products, loading, error, fetchProducts } = useProducts();

    const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
        { id: 'featured', label: 'Featured', isSelected: route.params?.featured || false },
        { id: 'highRating', label: 'High Rating', isSelected: false },
        { id: 'lowPrice', label: 'Low Price', isSelected: false },
        { id: 'highPrice', label: 'High Price', isSelected: false },
        { id: 'newest', label: 'Newest', isSelected: route.params?.sortBy === 'newest' || false },
        { id: 'highSustainability', label: 'Most Sustainable', isSelected: false },
    ]);

    const [categoryFilters, setCategoryFilters] = useState<FilterOption[]>([
        { id: 'clothing', label: 'Clothing', isSelected: route.params?.category === 'Clothing' || false },
        { id: 'home', label: 'Home', isSelected: route.params?.category === 'Home' || false },
        { id: 'electronics', label: 'Electronics', isSelected: route.params?.category === 'Electronics' || false },
        { id: 'books', label: 'Books', isSelected: route.params?.category === 'Books' || false },
        { id: 'toys', label: 'Toys', isSelected: route.params?.category === 'Toys' || false },
        { id: 'sports', label: 'Sports', isSelected: route.params?.category === 'Sports' || false },
        { id: 'art', label: 'Art', isSelected: route.params?.category === 'Art' || false },
        { id: 'jewelry', label: 'Jewelry', isSelected: route.params?.category === 'Jewelry' || false },
    ]);

    const [results, setResults] = useState<Product[]>([]);
    const [listLayout, setListLayout] = useState<'grid' | 'list'>('grid');
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [page, setPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadedItemIds, setLoadedItemIds] = useState<Set<string>>(new Set());

    // Fetch products based on search query and filters with debounce
    useEffect(() => {
        // Clear any existing timeout to implement debouncing
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout for the search
        const timeout = setTimeout(() => {
            fetchFilteredProducts();
        }, 500); // 500ms debounce delay

        setSearchTimeout(timeout);

        // Cleanup function to clear timeout when component unmounts
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [searchQuery, filterOptions, categoryFilters]);

    // Update results when products change
    useEffect(() => {
        setResults(products);
    }, [products]);

    const toggleFilterOption = (id: string) => {
        setFilterOptions(options =>
            options.map(option => ({
                ...option,
                isSelected: option.id === id ? !option.isSelected : false,
            }))
        );
    };

    const toggleCategoryFilter = (id: string) => {
        setCategoryFilters(categories =>
            categories.map(category => ({
                ...category,
                isSelected: category.id === id ? !category.isSelected : category.isSelected,
            }))
        );
    };

    const clearFilters = () => {
        setFilterOptions(options =>
            options.map(option => ({
                ...option,
                isSelected: false,
            }))
        );

        setCategoryFilters(categories =>
            categories.map(category => ({
                ...category,
                isSelected: false,
            }))
        );
    };

    // Animation for filter panel
    const filterAnimatedValue = useState(new Animated.Value(0))[0];
    const searchInputAnim = useState(new Animated.Value(0))[0];
    const gridItemsAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Animate search input on mount
        Animated.spring(searchInputAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Animate grid items with staggered effect
        Animated.timing(gridItemsAnim, {
            toValue: 1,
            duration: animation.normal,
            useNativeDriver: true,
        }).start();
    }, []);

    // Toggle filter panel with animation
    const toggleFilterPanel = () => {
        // Set state first to avoid race conditions
        setIsFilterVisible(prevState => {
            const newState = !prevState;

            // Then start animation
            Animated.timing(filterAnimatedValue, {
                toValue: newState ? 1 : 0,
                duration: animation.normal,
                useNativeDriver: false,
            }).start();

            return newState;
        });
    };

    // Close filter panel specifically
    const closeFilterPanel = () => {
        if (isFilterVisible) {
            setIsFilterVisible(false);

            Animated.timing(filterAnimatedValue, {
                toValue: 0,
                duration: animation.normal,
                useNativeDriver: false,
            }).start();
        }
    };

    // Calculate filter panel height for animation
    const filterHeight = filterAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300],
    });

    const filterOpacity = filterAnimatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 1],
    });

    const searchInputTranslate = searchInputAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
    });

    const searchInputOpacity = searchInputAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    // Enhanced card item rendering with sustainability score and seller info
    const renderGridItem = ({ item, index }: { item: Product, index: number }) => {
        const itemOpacity = gridItemsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const itemTranslate = gridItemsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
        });

        // Get the first image or use a placeholder
        const imageUri = item.images && item.images.length > 0
            ? item.images[0]
            : item.supabase_image_url || 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';

        return (
            <Animated.View
                style={{
                    opacity: itemOpacity,
                    transform: [{ translateY: itemTranslate }],
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.gridCard,
                        {
                            width: width * 0.44,
                            backgroundColor: colors.neutral.white,
                            borderRadius: borderRadius.lg,
                            ...shadows.md,
                            marginBottom: spacing.md,
                        }
                    ]}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                >
                    <View style={[styles.imageContainer, { position: 'relative' }]}>
                        <Image
                            source={{ uri: imageUri }}
                            style={[
                                styles.itemImage,
                                {
                                    borderTopLeftRadius: borderRadius.lg,
                                    borderTopRightRadius: borderRadius.lg,
                                }
                            ]}
                        />
                        <View
                            style={[
                                styles.sustainabilityBadge,
                                {
                                    backgroundColor: getSustainabilityColor(item.sustainability),
                                    borderRadius: borderRadius.round,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.sustainabilityScore,
                                {
                                    color: colors.neutral.white,
                                    fontSize: typography.fontSize.sm,
                                }
                            ]}>
                                {item.sustainability}
                            </Text>
                        </View>

                        {/* Like button positioned on image */}
                        <TouchableOpacity
                            style={[styles.saveButtonOverlay, {
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            }]}
                        >
                            <Ionicons name="heart-outline" size={20} color={colors.primary.main} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.cardContent, { padding: spacing.sm }]}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.itemTitle,
                                {
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: '600',
                                }
                            ]}
                        >
                            {item.title}
                        </Text>

                        <View style={styles.sellerRow}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.sellerName,
                                    {
                                        color: colors.neutral.darkGray,
                                        fontSize: typography.fontSize.xs,
                                    }
                                ]}
                            >
                                {item.sellerName || 'seller'}
                            </Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color={colors.accent.beige} />
                                <Text style={[
                                    styles.ratingText,
                                    {
                                        color: colors.neutral.darkGray,
                                        fontSize: typography.fontSize.xs,
                                    }
                                ]}>
                                    4.5
                                </Text>
                            </View>
                        </View>

                        <View style={styles.priceRow}>
                            <Text style={[
                                styles.price,
                                {
                                    color: colors.primary.main,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: '700',
                                }
                            ]}>
                                ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // List view rendering
    const renderListItem = ({ item, index }: { item: Product, index: number }) => {
        const itemOpacity = gridItemsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const itemTranslate = gridItemsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
        });

        // Get the first image or use a placeholder
        const imageUri = item.images && item.images.length > 0
            ? item.images[0]
            : item.supabase_image_url || 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';

        return (
            <Animated.View
                style={{
                    opacity: itemOpacity,
                    transform: [{ translateY: itemTranslate }],
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.listCard,
                        {
                            width: '100%',
                            backgroundColor: colors.neutral.white,
                            borderRadius: borderRadius.lg,
                            ...shadows.md,
                            marginBottom: spacing.sm,
                            flexDirection: 'row',
                        }
                    ]}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                >
                    <View style={styles.listImageContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={[
                                styles.listItemImage,
                                {
                                    borderTopLeftRadius: borderRadius.lg,
                                    borderBottomLeftRadius: borderRadius.lg,
                                }
                            ]}
                        />
                        <View
                            style={[
                                styles.listSustainabilityBadge,
                                {
                                    backgroundColor: getSustainabilityColor(item.sustainability),
                                    borderRadius: borderRadius.round,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.sustainabilityScore,
                                {
                                    color: colors.neutral.white,
                                    fontSize: typography.fontSize.xs,
                                }
                            ]}>
                                {item.sustainability}
                            </Text>
                        </View>

                        {/* Like button positioned on image */}
                        <TouchableOpacity
                            style={[styles.saveButtonOverlay, {
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            }]}
                        >
                            <Ionicons name="heart-outline" size={20} color={colors.primary.main} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.listCardContent, { padding: spacing.md, flex: 1 }]}>
                        {/* Header with title and price */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.itemTitle,
                                    {
                                        color: colors.neutral.charcoal,
                                        fontSize: typography.fontSize.md,
                                        fontWeight: '600',
                                        flex: 1,
                                        marginRight: spacing.sm,
                                    }
                                ]}
                            >
                                {item.title}
                            </Text>

                            <Text style={[
                                styles.price,
                                {
                                    color: colors.primary.main,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: '700',
                                }
                            ]}>
                                ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                            </Text>
                        </View>

                        {/* Description */}
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.itemDescription,
                                {
                                    color: colors.neutral.darkGray,
                                    fontSize: typography.fontSize.sm,
                                    marginBottom: spacing.sm,
                                }
                            ]}
                        >
                            {item.description}
                        </Text>

                        {/* Footer with seller info */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.ratingContainer}>
                                <Text
                                    style={[
                                        styles.sellerName,
                                        {
                                            color: colors.neutral.darkGray,
                                            fontSize: typography.fontSize.xs,
                                            marginRight: spacing.sm,
                                        }
                                    ]}
                                >
                                    {item.sellerName || 'seller'}
                                </Text>
                                <Ionicons name="star" size={14} color={colors.accent.beige} />
                                <Text style={[
                                    styles.ratingText,
                                    {
                                        color: colors.neutral.darkGray,
                                        fontSize: typography.fontSize.xs,
                                    }
                                ]}>
                                    4.5
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Helper function to get color based on sustainability score
    const getSustainabilityColor = (score: number) => {
        if (score >= 90) return colors.primary.main;
        if (score >= 75) return colors.primary.light;
        if (score >= 60) return colors.accent.beige;
        return colors.semantic.error;
    }

    const renderFilterChips = () => {
        const activeFilters = [
            ...filterOptions.filter(option => option.isSelected),
            ...categoryFilters.filter(category => category.isSelected)
        ];

        if (activeFilters.length === 0) {
            return null;
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.filterChipsContainer, { paddingHorizontal: spacing.lg }]}
            >
                {activeFilters.map(filter => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: colors.primary.main,
                                borderRadius: borderRadius.round,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.xxs,
                                marginRight: spacing.sm,
                            }
                        ]}
                        onPress={() => {
                            if (filterOptions.some(o => o.id === filter.id)) {
                                toggleFilterOption(filter.id);
                            } else {
                                toggleCategoryFilter(filter.id);
                            }
                        }}
                    >
                        <Text style={[styles.filterChipText, { color: colors.neutral.white, fontSize: typography.fontSize.sm }]}>
                            {filter.label}
                        </Text>
                        <View style={styles.filterChipIconContainer}>
                            <Ionicons name="close-circle" size={16} color={colors.neutral.white} />
                        </View>
                    </TouchableOpacity>
                ))}

                {activeFilters.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.clearFiltersButton,
                            {
                                borderRadius: borderRadius.round,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.xxs,
                                borderColor: colors.neutral.mediumGray,
                            }
                        ]}
                        onPress={clearFilters}
                    >
                        <Text style={[styles.clearFiltersText, { color: colors.neutral.darkGray, fontSize: typography.fontSize.sm }]}>
                            Clear All
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        );
    };

    const renderEmptyState = () => (
        <View style={[styles.emptyContainer, { paddingTop: spacing.xxxl }]}>
            <LinearGradient
                colors={[colors.neutral.lightGray, colors.neutral.offWhite]}
                style={[styles.emptyImageContainer, { borderRadius: borderRadius.round }]}
            >
                <Ionicons name="search" size={80} color={colors.neutral.white} />
            </LinearGradient>

            <Text style={[styles.emptyTitle, {
                color: colors.neutral.charcoal,
                fontSize: typography.fontSize.xl,
                marginBottom: spacing.md,
                textAlign: 'center'
            }]}>
                No Results Found
            </Text>
            <Text style={[styles.emptyText, {
                color: colors.neutral.darkGray,
                fontSize: typography.fontSize.md,
                textAlign: 'center',
                marginBottom: spacing.xl,
                maxWidth: 280
            }]}>
                Try adjusting your search or filters to find what you're looking for
            </Text>
            <Button
                title="Clear Filters"
                variant="secondary"
                onPress={clearFilters}
                style={{ width: 180 }}
            />
        </View>
    );

    // Loading indicator when searching
    const renderLoading = () => (
        <View style={[styles.loadingContainer, { marginTop: spacing.xxxl }]}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: spacing.md, color: colors.neutral.darkGray }}>
                Searching...
            </Text>
        </View>
    );

    // Update the fetchFilteredProducts function with better edge case handling
    const fetchFilteredProducts = async (loadMore = false) => {
        try {
            console.log('Starting fetchFilteredProducts. LoadMore:', loadMore, 'Query:', searchQuery,
                'Current results:', results.length, 'Total unique IDs loaded:', loadedItemIds.size);

            if (loadMore) {
                setIsLoadingMore(true);
            } else {
                setIsSearching(true);
                // Reset to page 1 and clear loaded items when starting a new search
                setPage(1);
                setLoadedItemIds(new Set());
            }

            // Check if we're loading the same filter conditions repeatedly
            if (loadMore && results.length > 100) {
                console.log('Reached reasonable limit of items to load');
                setHasMoreData(false);
                setIsLoadingMore(false);
                setIsSearching(false);
                return;
            }

            const filters: ProductFilters = {
                searchQuery: searchQuery,
                limit: loadMore ? 30 : 15, // Request more when loading more to account for duplicates
                offset: loadMore ? results.length : 0, // Use actual results length as offset
            };

            // Add category filters
            const selectedCategories = categoryFilters
                .filter(category => category.isSelected)
                .map(category => category.label);

            if (selectedCategories.length > 0) {
                filters.category = selectedCategories[0]; // Use the first selected category
            }

            // Add sort options
            const selectedFilter = filterOptions.find(option => option.isSelected);
            if (selectedFilter) {
                switch (selectedFilter.id) {
                    case 'lowPrice':
                        filters.sortBy = 'price_asc';
                        break;
                    case 'highPrice':
                        filters.sortBy = 'price_desc';
                        break;
                    case 'newest':
                        filters.sortBy = 'newest';
                        break;
                    case 'highSustainability':
                        filters.sortBy = 'sustainability';
                        break;
                    // Featured is the default
                }
            }

            console.log('Search filters:', JSON.stringify(filters));

            // Call the API to get new products
            let fetchedProducts: Product[] = [];
            try {
                console.log(`Calling ProductService.getProducts with offset: ${filters.offset}, limit: ${filters.limit}`);

                // Call the API method directly from ProductService
                const data = await ProductService.getProducts(filters);

                if (data && data.length > 0) {
                    console.log('API returned data:', data.length);

                    // Filter out already loaded items
                    fetchedProducts = data.filter(item => !loadedItemIds.has(item.id));
                    console.log('After filtering duplicates:', fetchedProducts.length);

                    // Update the set of loaded item IDs
                    const newLoadedItemIds = new Set(loadedItemIds);
                    fetchedProducts.forEach(item => newLoadedItemIds.add(item.id));
                    setLoadedItemIds(newLoadedItemIds);

                    console.log('Total unique items now:', newLoadedItemIds.size);
                } else {
                    console.log('API returned no data or empty array');
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                // Use fallback data if needed and if we haven't loaded them already
                const fallbackData = getFallbackData();
                // Filter out already loaded fallback items
                fetchedProducts = fallbackData.filter(item => !loadedItemIds.has(item.id));

                if (fetchedProducts.length > 0) {
                    console.log('Using fallback data, found', fetchedProducts.length, 'new items');
                    // Update loaded IDs with fallback data
                    const newLoadedItemIds = new Set(loadedItemIds);
                    fetchedProducts.forEach(item => newLoadedItemIds.add(item.id));
                    setLoadedItemIds(newLoadedItemIds);
                } else {
                    console.log('No new fallback items available');
                }
            }

            // If there are no new products or the response is empty, set hasMoreData to false
            if (fetchedProducts.length === 0) {
                console.log('No unique results found, setting hasMoreData to false');
                setHasMoreData(false);
                setIsLoadingMore(false);
                setIsSearching(false);
                return;
            }

            // Increment page number if loading more
            if (loadMore) {
                setPage(prevPage => prevPage + 1);
            }

            // Update the results directly rather than waiting for the useEffect
            if (loadMore) {
                setResults(prevResults => [...prevResults, ...fetchedProducts]);
                console.log(`Updated results: ${results.length} + ${fetchedProducts.length} new items`);
            } else {
                setResults(fetchedProducts);
                console.log(`Set new results with ${fetchedProducts.length} items`);
            }

            // Set hasMoreData based on whether we got as many items as requested
            const requestedLimit = filters.limit || 15;
            const gotFullPage = fetchedProducts.length >= requestedLimit / 2; // Consider half-full pages as potentially having more
            setHasMoreData(gotFullPage);
            console.log(`Setting hasMoreData to ${gotFullPage} based on received ${fetchedProducts.length} vs limit ${requestedLimit}`);

        } catch (error) {
            console.error('Error fetching search results:', error);
            setHasMoreData(false);
        } finally {
            setIsLoadingMore(false);
            setIsSearching(false);
        }
    };

    // Add a fallback data function
    const getFallbackData = (): Product[] => {
        return [
            {
                id: '1',
                title: 'Vintage Denim Jacket',
                price: 45.0,
                description: 'This classic denim jacket has been upcycled with sustainable materials. Perfect for any casual outfit.',
                images: ['https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket'],
                condition: 'good',
                seller_id: 'user123',
                sellerName: 'ameliegong',
                sustainability: 95,
                sustainability_badges: ['Organic', 'Recycled', 'Local'],
                sustainability_info: {},
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: '2',
                title: 'Handcrafted Plant Pot',
                price: 28.0,
                description: 'Hand-crafted ceramic pot made from reclaimed clay. Each piece is unique and helps reduce waste.',
                images: ['https://placehold.co/600x800/E8F5E9/2C3E50?text=Plant+Pot'],
                condition: 'excellent',
                seller_id: 'user456',
                sellerName: 'ecofriendly',
                sustainability: 87,
                sustainability_badges: ['Handmade', 'Recycled'],
                sustainability_info: {},
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: '3',
                title: 'Organic Cotton Shirt',
                price: 32.0,
                description: 'Made with 100% organic cotton and natural dyes. Comfortable, breathable, and eco-friendly.',
                images: ['https://placehold.co/600x800/F9FBE7/2C3E50?text=Shirt'],
                condition: 'good',
                seller_id: 'user789',
                sellerName: 'greenbasics',
                sustainability: 92,
                sustainability_badges: ['Organic', 'Fair Trade'],
                sustainability_info: {},
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];
    };

    // Override the useEffect that watches products to properly handle pagination
    useEffect(() => {
        // Only update the entire results list when not loading more
        if (!isLoadingMore) {
            setResults(products);
        }
    }, [products, isLoadingMore]);

    // Modify the handleLoadMore function to better manage pagination
    const handleLoadMore = () => {
        if (hasMoreData && !isLoadingMore) {
            console.log(`Loading more items from page ${page + 1}, current count: ${results.length}`);
            fetchFilteredProducts(true);
        }
    };

    // Update the renderLoadMoreButton to provide better user feedback
    const renderLoadMoreButton = () => {
        if (!hasMoreData) return null;

        return (
            <View style={[styles.loadMoreContainer, { marginVertical: spacing.lg, alignItems: 'center' }]}>
                {isLoadingMore ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary.main} />
                        <Text style={{ marginLeft: spacing.sm, color: colors.neutral.darkGray }}>
                            Loading more...
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.loadMoreButton,
                            {
                                backgroundColor: colors.primary.main,
                                borderRadius: borderRadius.lg,
                                paddingVertical: spacing.sm,
                                paddingHorizontal: spacing.lg,
                                ...shadows.sm
                            }
                        ]}
                        onPress={handleLoadMore}
                    >
                        <Text style={{ color: colors.neutral.white, fontWeight: '600' }}>
                            Load More Results
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: spacing.md, paddingHorizontal: spacing.lg }]}>
                <TouchableOpacity
                    style={[styles.backButton, { marginRight: spacing.sm }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.neutral.charcoal} />
                </TouchableOpacity>

                <Animated.View style={[
                    styles.searchInputContainer,
                    {
                        backgroundColor: colors.neutral.white,
                        borderRadius: borderRadius.lg,
                        flex: 1,
                        ...shadows.sm,
                        transform: [{ translateY: searchInputTranslate }],
                        opacity: searchInputOpacity
                    }
                ]}>
                    <Ionicons name="search" size={20} color={colors.neutral.mediumGray} style={{ marginLeft: spacing.md }} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search sustainable items..."
                        placeholderTextColor={colors.neutral.mediumGray}
                        style={[
                            styles.searchInput,
                            {
                                color: colors.neutral.charcoal,
                                fontSize: typography.fontSize.md,
                                flex: 1,
                                marginLeft: spacing.xs,
                            }
                        ]}
                        returnKeyType="search"
                        autoFocus={!route.params?.query}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            style={{ padding: spacing.sm }}
                            onPress={() => setSearchQuery('')}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.neutral.mediumGray} />
                        </TouchableOpacity>
                    )}
                </Animated.View>

                <TouchableOpacity
                    style={[
                        styles.iconButton,
                        {
                            marginLeft: spacing.sm,
                            backgroundColor: colors.neutral.white,
                            borderRadius: borderRadius.md,
                            ...shadows.sm,
                        }
                    ]}
                    onPress={() => setListLayout(listLayout === 'grid' ? 'list' : 'grid')}
                >
                    <Ionicons
                        name={listLayout === 'grid' ? "list" : "grid"}
                        size={22}
                        color={colors.neutral.charcoal}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.iconButton,
                        {
                            marginLeft: spacing.sm,
                            backgroundColor: isFilterVisible ? colors.primary.main : colors.neutral.white,
                            borderRadius: borderRadius.md,
                            ...shadows.sm,
                        }
                    ]}
                    onPress={toggleFilterPanel}
                >
                    <Ionicons
                        name="options-outline"
                        size={22}
                        color={isFilterVisible ? colors.neutral.white : colors.neutral.charcoal}
                    />
                </TouchableOpacity>
            </View>

            {/* Filter chips */}
            {renderFilterChips()}

            {/* Backdrop for closing filter panel when tapping outside */}
            {isFilterVisible && (
                <TouchableOpacity
                    activeOpacity={0.3}
                    style={[styles.filterBackdrop]}
                    onPress={closeFilterPanel}
                />
            )}

            {/* Filter Panel - Animated */}
            <Animated.View
                style={[
                    styles.filterPanel,
                    {
                        backgroundColor: colors.neutral.white,
                        borderRadius: borderRadius.lg,
                        ...shadows.md,
                        height: filterHeight,
                        opacity: filterOpacity,
                        overflow: 'hidden',
                        marginHorizontal: spacing.lg,
                        marginTop: 10,
                        zIndex: 15,
                        elevation: isFilterVisible ? 6 : 0,
                    }
                ]}
                pointerEvents={isFilterVisible ? 'auto' : 'none'}
            >
                {/* Handle/indicator at top of panel */}
                <View style={styles.filterPanelHandle}>
                    <View style={[styles.filterPanelHandleBar, { backgroundColor: colors.neutral.mediumGray }]} />
                </View>

                <View style={[styles.filterSection, { marginTop: spacing.xs }]}>
                    <Text style={[styles.filterTitle, { color: colors.neutral.charcoal, fontSize: typography.fontSize.md, fontWeight: '600' }]}>
                        Sort By
                    </Text>
                    <View style={styles.filterOptionsContainer}>
                        {filterOptions.map(option => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.filterOption,
                                    {
                                        backgroundColor: option.isSelected ? colors.primary.light : colors.neutral.lightGray,
                                        borderRadius: borderRadius.md,
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.sm,
                                        marginRight: spacing.sm,
                                        marginBottom: spacing.sm,
                                        borderWidth: option.isSelected ? 1 : 0,
                                        borderColor: colors.primary.main,
                                    }
                                ]}
                                onPress={() => toggleFilterOption(option.id)}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        {
                                            color: option.isSelected ? colors.primary.dark : colors.neutral.darkGray,
                                            fontSize: typography.fontSize.sm,
                                            fontWeight: option.isSelected ? '600' : '400',
                                        }
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.filterSection}>
                    <Text style={[styles.filterTitle, { color: colors.neutral.charcoal, fontSize: typography.fontSize.md, fontWeight: '600' }]}>
                        Categories
                    </Text>
                    <View style={styles.filterOptionsContainer}>
                        {categoryFilters.map(category => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.filterOption,
                                    {
                                        backgroundColor: category.isSelected ? colors.primary.light : colors.neutral.lightGray,
                                        borderRadius: borderRadius.md,
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.sm,
                                        marginRight: spacing.sm,
                                        marginBottom: spacing.sm,
                                        borderWidth: category.isSelected ? 1 : 0,
                                        borderColor: colors.primary.main,
                                    }
                                ]}
                                onPress={() => toggleCategoryFilter(category.id)}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        {
                                            color: category.isSelected ? colors.primary.dark : colors.neutral.darkGray,
                                            fontSize: typography.fontSize.sm,
                                            fontWeight: category.isSelected ? '600' : '400',
                                        }
                                    ]}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={[styles.filterActions, { padding: spacing.md }]}>
                    <Button
                        title="Apply Filters"
                        onPress={closeFilterPanel}
                        style={{ flex: 1, marginRight: spacing.sm }}
                    />
                    <Button
                        title="Close"
                        variant="outline"
                        onPress={closeFilterPanel}
                        style={{ flex: 1 }}
                    />
                </View>
            </Animated.View>

            {/* Results Title */}
            <View style={[
                styles.resultsHeader,
                {
                    paddingHorizontal: spacing.lg,
                    marginTop: isFilterVisible ? 310 : spacing.md,
                    zIndex: 5
                }
            ]}>
                <Text style={[styles.resultsTitle, { color: colors.neutral.charcoal, fontSize: typography.fontSize.lg, fontWeight: '600' }]}>
                    {results.length > 0 ? `${results.length} Results` : 'No Results'}
                </Text>
                <View style={styles.viewOptions}>
                    <Text style={{ color: colors.neutral.darkGray, marginRight: spacing.sm }}>View:</Text>
                    <TouchableOpacity
                        style={[
                            styles.viewOptionButton,
                            {
                                backgroundColor: listLayout === 'grid' ? colors.primary.main : colors.neutral.lightGray,
                                marginRight: spacing.xs
                            }
                        ]}
                        onPress={() => setListLayout('grid')}
                    >
                        <Ionicons name="grid-outline" size={16} color={listLayout === 'grid' ? colors.neutral.white : colors.neutral.darkGray} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.viewOptionButton,
                            {
                                backgroundColor: listLayout === 'list' ? colors.primary.main : colors.neutral.lightGray
                            }
                        ]}
                        onPress={() => setListLayout('list')}
                    >
                        <Ionicons name="list-outline" size={16} color={listLayout === 'list' ? colors.neutral.white : colors.neutral.darkGray} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results Grid */}
            {isSearching ? (
                renderLoading()
            ) : (
                results.length > 0 ? (
                    <FlatList
                        data={results}
                        renderItem={listLayout === 'grid' ? renderGridItem : renderListItem}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        numColumns={listLayout === 'grid' ? 2 : 1}
                        key={listLayout} // This forces FlatList to re-render when layout changes
                        contentContainerStyle={[
                            styles.resultsList,
                            {
                                paddingHorizontal: listLayout === 'grid' ? spacing.md : spacing.lg,
                                paddingBottom: spacing.xxxl
                            }
                        ]}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={listLayout === 'grid' ? { justifyContent: 'space-between' } : undefined}
                        ListFooterComponent={renderLoadMoreButton}
                    />
                ) : (
                    renderEmptyState()
                )
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
        alignItems: 'center',
        paddingVertical: 12,
        zIndex: 20,
    },
    backButton: {
        padding: 4,
    },
    iconButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        zIndex: 20,
    },
    searchInput: {
        height: 44,
        paddingHorizontal: 12,
    },
    filterPanel: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        zIndex: 15,
    },
    filterSection: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterTitle: {
        marginBottom: 8,
    },
    filterOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterOption: {
        marginBottom: 8,
    },
    filterOptionText: {},
    filterActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    filterChipsContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    filterChipText: {
        marginRight: 4,
    },
    filterChipIconContainer: {
        marginLeft: 2,
    },
    clearFiltersButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 8,
    },
    clearFiltersText: {},
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resultsTitle: {},
    resultsList: {
        paddingTop: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyTitle: {
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
    },
    emptyImageContainer: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    viewOptions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewOptionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCard: {
        overflow: 'hidden',
        margin: 4,
    },
    listCard: {
        overflow: 'hidden',
        margin: 8,
        flexDirection: 'row',
    },
    imageContainer: {
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    sustainabilityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sustainabilityScore: {
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 12,
    },
    itemTitle: {
        marginBottom: 6,
    },
    sellerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sellerName: {
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {},
    saveButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 199, 140, 0.1)',
    },
    filterBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10,
    },
    filterPanelHandle: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterPanelHandleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    listImageContainer: {
        position: 'relative',
        width: 120,
    },
    listItemImage: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
    },
    listSustainabilityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listCardContent: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    itemDescription: {
        marginTop: 4,
        marginBottom: 4,
    },
    listFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saveButtonOverlay: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadMoreContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreButton: {
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreText: {
        fontSize: 16,
    },
});

export default SearchScreen; 