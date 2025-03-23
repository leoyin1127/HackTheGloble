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

    // Add a function to check if a product is an undergarment that should be excluded
    const isUndergarment = (product: Product): boolean => {
        // List of terms that might indicate undergarments
        const undergarmentTerms = [
            'underwear', 'undergarment', 'bra', 'panty', 'panties', 'boxer', 'brief', 'lingerie',
            'thong', 'g-string', 'bralette', 'underpants', 'slip', 'intimates'
        ];

        // Check various fields for undergarment indicators
        const titleMatch = product.title ? undergarmentTerms.some(term =>
            product.title.toLowerCase().includes(term)) : false;

        const categoryMatch = product.sub_category ? undergarmentTerms.some(term =>
            product.sub_category!.toLowerCase().includes(term)) : false;

        const articleMatch = product.article_type ? undergarmentTerms.some(term =>
            product.article_type!.toLowerCase().includes(term)) : false;

        // If any field matches undergarment terms, filter it out
        return titleMatch || categoryMatch || articleMatch;
    };

    // Modify the fetchFilteredProducts function to better handle pagination
    const fetchFilteredProducts = async (loadMore = false) => {
        try {
            console.log(`SearchScreen: fetchFilteredProducts called with loadMore=${loadMore}, query="${searchQuery}", page=${page}, results.length=${results.length}`);

            if (loadMore) {
                setIsLoadingMore(true);
            } else {
                setIsSearching(true);
                // Reset page and loaded items for new searches
                setPage(1);
                setLoadedItemIds(new Set());
            }

            // Calculate proper offset for pagination
            const offset = loadMore ? results.length : 0;
            const limit = 15; // Keep consistent limit

            console.log(`SearchScreen: Using offset=${offset}, limit=${limit}, current results.length=${results.length}`);

            // Prepare filters for API call
            const filters: ProductFilters = {
                searchQuery: searchQuery,
                limit: limit,
                offset: offset
            };

            // Add category filters
            const selectedCategories = categoryFilters
                .filter(category => category.isSelected)
                .map(category => category.label);

            if (selectedCategories.length > 0) {
                filters.category = selectedCategories[0];
                console.log(`SearchScreen: Adding category filter: ${selectedCategories[0]}`);
            }

            // Add sort options
            const selectedFilter = filterOptions.find(option => option.isSelected);
            if (selectedFilter) {
                let sortOption: "newest" | "price_asc" | "price_desc" | "sustainability" | undefined;
                switch (selectedFilter.id) {
                    case 'lowPrice':
                        sortOption = 'price_asc';
                        break;
                    case 'highPrice':
                        sortOption = 'price_desc';
                        break;
                    case 'newest':
                        sortOption = 'newest';
                        break;
                    case 'highSustainability':
                        sortOption = 'sustainability';
                        break;
                    default:
                        sortOption = undefined; // Default
                }
                if (sortOption) {
                    filters.sortBy = sortOption;
                    console.log(`SearchScreen: Adding sort option: ${sortOption}`);
                }
            }

            console.log(`SearchScreen: Full filters for API call:`, JSON.stringify(filters));

            // Make API call with error handling
            let fetchedProducts: Product[] = [];
            try {
                const data = await ProductService.getProducts(filters);

                console.log(`SearchScreen: API returned ${data?.length || 0} items`);

                if (data && data.length > 0) {
                    // First filter out any undergarments from the results
                    const filteredData = data.filter(product => !isUndergarment(product));
                    console.log(`SearchScreen: Filtered out ${data.length - filteredData.length} undergarment items`);

                    // Create a set of existing IDs to filter out duplicates
                    const existingIds = loadMore ? new Set(results.map(item => item.id)) : new Set();
                    console.log(`SearchScreen: Current existingIds count=${existingIds.size}`);

                    // Log first few IDs from the fetched data for debugging
                    console.log(`SearchScreen: Sample IDs from fetched data: ${filteredData.slice(0, 3).map(item => item.id).join(', ')}`);

                    // Filter out any duplicates
                    const newItems = filteredData.filter(item => !existingIds.has(item.id));
                    console.log(`SearchScreen: After filtering existing IDs, found ${newItems.length} new items`);

                    fetchedProducts = newItems;

                    // Update loadedItemIds with new items
                    const newIds = new Set(loadedItemIds);
                    newItems.forEach(item => newIds.add(item.id));
                    setLoadedItemIds(newIds);

                    console.log(`SearchScreen: Updated loadedItemIds, new size=${newIds.size}`);
                } else {
                    console.log(`SearchScreen: API returned no items or null data`);
                }
            } catch (error) {
                console.error(`SearchScreen: API error:`, error);
                // Use fallback data only if this is an initial load, not for pagination
                if (!loadMore) {
                    const fallbackData = getFallbackData();
                    // Filter out undergarments from fallback data too
                    fetchedProducts = fallbackData.filter(product => !isUndergarment(product));
                    console.log(`SearchScreen: Using ${fetchedProducts.length} fallback items for initial load after filtering undergarments`);
                }
            }

            // Handle the case when no new products are found
            if (fetchedProducts.length === 0) {
                console.log(`SearchScreen: No new products found, setting hasMoreData=false`);
                setHasMoreData(false);
                setIsLoadingMore(false);
                setIsSearching(false);
                // Don't return early if this is an initial load with no results,
                // we still need to set the empty results
                if (loadMore) return;
            }

            // Update page counter
            if (loadMore) {
                setPage(prevPage => prevPage + 1);
            }

            // Update the results with either a fresh set or appended items
            if (loadMore) {
                if (fetchedProducts.length > 0) {
                    setResults(prevResults => {
                        const combinedResults = [...prevResults, ...fetchedProducts];
                        console.log(`SearchScreen: Updated results by appending ${fetchedProducts.length} items, new total=${combinedResults.length}`);
                        return combinedResults;
                    });
                }
            } else {
                setResults(fetchedProducts);
                console.log(`SearchScreen: Set fresh results with ${fetchedProducts.length} items`);
            }

            // Determine if there might be more data to load
            // Only mark as having more data if we got a reasonable number of results
            setHasMoreData(fetchedProducts.length >= limit * 0.5);
            console.log(`SearchScreen: Set hasMoreData=${fetchedProducts.length >= limit * 0.5}`);

        } catch (error) {
            console.error(`SearchScreen: Unexpected error in fetchFilteredProducts:`, error);
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
        // Only update the entire results list when not loading more and this is a fresh search
        // Never update results from context during pagination
        if (!isLoadingMore && page === 1) {
            setResults(products);
        }
    }, [products, isLoadingMore, page]);

    // Modify the handleLoadMore function to better manage pagination
    const handleLoadMore = () => {
        console.log(`SearchScreen: handleLoadMore called, hasMoreData=${hasMoreData}, isLoadingMore=${isLoadingMore}`);

        if (!hasMoreData) {
            console.log(`SearchScreen: Ignoring load more request - no more data available`);
            return;
        }

        if (isLoadingMore) {
            console.log(`SearchScreen: Ignoring load more request - already loading`);
            return;
        }

        console.log(`SearchScreen: Loading more items from page ${page + 1}, current count: ${results.length}`);
        fetchFilteredProducts(true);
    };

    // Update the renderLoadMoreButton to be more visible and provide better feedback
    const renderLoadMoreButton = () => {
        console.log(`SearchScreen: renderLoadMoreButton, hasMoreData=${hasMoreData}, isLoadingMore=${isLoadingMore}, results.length=${results.length}`);

        if (results.length === 0) {
            return null; // Don't show button when no results exist
        }

        if (!hasMoreData) {
            return (
                <View style={[styles.loadMoreContainer, { marginVertical: spacing.lg, alignItems: 'center' }]}>
                    <Text style={{ color: colors.neutral.darkGray, fontStyle: 'italic' }}>
                        No more results available
                    </Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                onPress={handleLoadMore}
                disabled={isLoadingMore}
                style={[styles.loadMoreContainer, {
                    marginVertical: spacing.lg,
                    paddingVertical: spacing.md,
                    alignItems: 'center',
                    backgroundColor: colors.neutral.lightGray,
                    borderRadius: borderRadius.md,
                }]}
            >
                {isLoadingMore ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary.main} />
                        <Text style={{ marginLeft: spacing.sm, color: colors.neutral.darkGray, fontWeight: '500' }}>
                            Loading more results...
                        </Text>
                    </View>
                ) : (
                    <Text style={{ color: colors.primary.main, fontWeight: '600' }}>
                        Load More Results ({results.length} loaded so far)
                    </Text>
                )}
            </TouchableOpacity>
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
                        keyExtractor={(item, index) => {
                            // Create a guaranteed unique key using both the item ID and index
                            // This prevents issues when the same item might appear multiple times
                            return `item-${item.id}-${index}`;
                        }}
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
                        onEndReached={() => {
                            // This will trigger loading more items when the user scrolls near the end
                            if (hasMoreData && !isLoadingMore) {
                                console.log('SearchScreen: onEndReached triggered, calling handleLoadMore');
                                handleLoadMore();
                            }
                        }}
                        onEndReachedThreshold={0.2} // Trigger when within 20% of the end
                    />
                ) : (
                    // Only show empty state when not loading more items
                    !isLoadingMore && renderEmptyState()
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