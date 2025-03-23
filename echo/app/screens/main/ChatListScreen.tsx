import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Animated,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import PlaceholderImage from '../../components/PlaceholderImage';
import Logo from '../../components/Logo';
import { MainStackParamList } from '../../navigation/AppNavigator';

type ChatListScreenNavigationProp = StackNavigationProp<MainStackParamList>;

// Sample chats data - updated with better names and IDs that match SELLERS
const CHATS = [
    {
        id: '1',
        sellerId: 'ameliegong',
        sellerName: 'Amelie Gong',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        lastMessage: "Hi! I'm interested in your eco-friendly products.",
        timestamp: '12:30 PM',
        unread: 2,
    },
    {
        id: '2',
        sellerId: 'ecofriendly',
        sellerName: 'Eco Friendly',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        lastMessage: "Thanks for your interest! Our items are all made from sustainable materials.",
        timestamp: 'Yesterday',
        unread: 0,
    },
    {
        id: '3',
        sellerId: 'greenbasics',
        sellerName: 'Green Basics',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        lastMessage: "Would you like to see more colors of the recycled cotton tote?",
        timestamp: 'Monday',
        unread: 0,
    },
    {
        id: '4',
        sellerId: 'sustainashop',
        sellerName: 'Sustaina Shop',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        lastMessage: "Your order has been shipped! Track with code: ECO29384.",
        timestamp: 'Jul 21',
        unread: 1,
    },
];

const ChatListScreen = () => {
    const navigation = useNavigation<ChatListScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0.95))[0];
    const slideAnim = useState(new Animated.Value(20))[0];

    // Add pulsing animation for AI avatar
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Setup pulsing animation
    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, []);

    // Animation effect when screen loads - update to handle all items with staggered timing
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Create an animation effect for each item with a stagger
    const getItemAnimationStyle = (index: number) => {
        const delay = index * 80;

        return {
            opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
            }),
            transform: [
                {
                    scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                    }),
                },
                {
                    translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    }),
                },
            ],
        };
    };

    const filteredChats = CHATS.filter(chat =>
        !searchQuery ||
        chat.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create a proper method to navigate to AI Chat as a modal
    const navigateToAIChat = () => {
        // First navigate back to the root tab if needed
        navigation.navigate('TabHome');
        // Then navigate to AIChat as a modal
        navigation.navigate('AIChat');
    };

    const renderAIChatEntry = () => {
        // Create a shimmer animation
        const shimmerAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();
        }, []);

        const shimmerTranslate = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 200],
        });

        return (
            <Animated.View
                style={[
                    {
                        paddingHorizontal: 0,
                        marginBottom: spacing.lg,
                        marginTop: spacing.md,
                    },
                    getItemAnimationStyle(0),
                ]}
            >
                <LinearGradient
                    colors={[colors.primary.dark, colors.primary.main]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.aiChatItem,
                        {
                            padding: 0,
                            borderRadius: borderRadius.xxl,
                            marginHorizontal: 0,
                            overflow: 'hidden',
                            ...shadows.lg
                        }
                    ]}
                >
                    {/* Shimmer effect */}
                    <Animated.View
                        style={[
                            styles.shimmerEffect,
                            {
                                transform: [{ translateX: shimmerTranslate }],
                            }
                        ]}
                    />

                    <TouchableOpacity
                        style={styles.aiChatButton}
                        activeOpacity={0.8}
                        onPress={navigateToAIChat}
                    >
                        {/* Decorative circles */}
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />

                        <View style={styles.aiContentWrapper}>
                            <View style={styles.aiHeaderRow}>
                                <View style={styles.aiAvatarOuterContainer}>
                                    <Animated.View style={{
                                        transform: [{ scale: pulseAnim }],
                                    }}>
                                        <LinearGradient
                                            colors={['#ffffff', '#f0f0f0']}
                                            style={styles.aiAvatarGradient}
                                        >
                                            <LinearGradient
                                                colors={[colors.primary.light, colors.primary.main]}
                                                style={styles.aiAvatarInner}
                                            >
                                                <Ionicons name="star" size={26} color="white" />
                                            </LinearGradient>
                                        </LinearGradient>
                                    </Animated.View>
                                </View>

                                <View style={styles.aiTitleContainer}>
                                    <Text style={styles.aiTitle}>
                                        Echo
                                    </Text>
                                    <View style={styles.aiSubtitleRow}>
                                        <Text style={styles.aiSubtitle}>Your Personal Stylist</Text>
                                        <View style={styles.aiBadge}>
                                            <Text style={styles.aiBadgeText}>AI</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.aiBodyContent}>
                                <Text style={styles.aiDescription}>
                                    Get personalized sustainable fashion recommendations and discover your unique eco-style
                                </Text>

                                <View style={styles.aiFeatures}>
                                    {[
                                        'Style Advice', 'Eco Tips', 'Outfit Ideas'
                                    ].map((feature, idx) => (
                                        <View key={idx} style={styles.aiFeatureTag}>
                                            <Text style={styles.aiFeatureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.aiFooter}>
                                <View style={styles.newBadge}>
                                    <Text style={styles.newBadgeText}>NEW</Text>
                                </View>

                                <View style={styles.chatNowButton}>
                                    <Text style={styles.chatNowText}>Chat Now</Text>
                                    <Ionicons name="arrow-forward" size={16} color="white" />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        );
    };

    const renderChatItem = ({ item, index }: { item: typeof CHATS[0], index: number }) => {
        return (
            <Animated.View
                style={[
                    {
                        paddingHorizontal: 0,
                        marginBottom: spacing.sm,
                    },
                    getItemAnimationStyle(index),
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.chatItem,
                        {
                            backgroundColor: colors.neutral.white,
                            padding: spacing.md,
                            borderRadius: borderRadius.xxl,
                            marginHorizontal: 0,
                            ...shadows.sm
                        }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Chat', { sellerId: item.sellerId })}
                >
                    <View style={styles.avatarContainer}>
                        <View
                            style={[
                                styles.avatarGradient,
                                {
                                    borderWidth: item.unread > 0 ? 2 : 0,
                                    borderColor: item.unread > 0 ? colors.primary.main : 'transparent',
                                    borderRadius: borderRadius.round,
                                    padding: item.unread > 0 ? 2 : 0
                                }
                            ]}
                        >
                            <PlaceholderImage
                                type="avatar"
                                width={50}
                                height={50}
                                borderRadius={borderRadius.round}
                            />
                        </View>

                        {item.unread > 0 && (
                            <View style={[
                                styles.unreadBadge,
                                {
                                    backgroundColor: colors.semantic.error,
                                    borderWidth: 2,
                                    borderColor: colors.neutral.white,
                                    borderRadius: borderRadius.round
                                }
                            ]}>
                                <Text style={[
                                    styles.unreadText,
                                    { color: colors.neutral.white, fontSize: typography.fontSize.xs }
                                ]}>
                                    {item.unread}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.chatInfo}>
                        <View style={styles.chatHeader}>
                            <Text style={[
                                styles.sellerName,
                                {
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: item.unread > 0 ? '700' : '600'
                                }
                            ]}>
                                {item.sellerName}
                            </Text>

                            <View style={styles.timestampContainer}>
                                {item.unread > 0 && (
                                    <View style={[
                                        styles.unreadDot,
                                        { backgroundColor: colors.primary.main, marginRight: spacing.xs }
                                    ]} />
                                )}
                                <Text style={[
                                    styles.timestamp,
                                    {
                                        color: item.unread > 0
                                            ? colors.primary.main
                                            : colors.neutral.mediumGray,
                                        fontSize: typography.fontSize.xs,
                                        fontWeight: item.unread > 0 ? '600' : '400'
                                    }
                                ]}>
                                    {item.timestamp}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={[
                                styles.lastMessage,
                                {
                                    color: item.unread > 0
                                        ? colors.neutral.charcoal
                                        : colors.neutral.darkGray,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: item.unread > 0 ? '500' : '400',
                                    marginTop: spacing.xs
                                }
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.lastMessage}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderEmptyState = () => (
        <Animated.View
            style={[
                styles.emptyContainer,
                { paddingTop: spacing.xxxl },
                { opacity: fadeAnim }
            ]}
        >
            <PlaceholderImage
                type="category"
                width={120}
                height={120}
                text="💬"
                containerStyle={{ marginBottom: spacing.xl }}
            />
            <Text style={[styles.emptyTitle, {
                color: colors.neutral.charcoal,
                fontSize: typography.fontSize.xl,
                marginBottom: spacing.md,
                textAlign: 'center'
            }]}>
                No Messages Yet
            </Text>
            <Text style={[styles.emptyText, {
                color: colors.neutral.darkGray,
                fontSize: typography.fontSize.md,
                textAlign: 'center',
                marginBottom: spacing.xl,
                maxWidth: 280
            }]}>
                Connect with sellers to discuss sustainable products and make eco-friendly purchases
            </Text>
            <TouchableOpacity
                style={[
                    styles.startButton,
                    {
                        backgroundColor: colors.primary.main,
                        borderRadius: borderRadius.xxl,
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.xl,
                        ...shadows.sm
                    }
                ]}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={[styles.startButtonText, {
                    color: colors.neutral.white,
                    fontSize: typography.fontSize.md,
                    fontWeight: '600'
                }]}>
                    Browse Products
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: colors.neutral.offWhite,
                    paddingBottom: spacing.md,
                    paddingHorizontal: spacing.lg
                }
            ]}
            edges={['top']}
        >
            <StatusBar style="dark" />

            {/* Header with search */}
            <View style={[
                styles.headerContainer,
                {
                    backgroundColor: colors.neutral.white,
                    paddingBottom: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderBottomLeftRadius: borderRadius.xxl,
                    borderBottomRightRadius: borderRadius.xxl,
                    borderTopLeftRadius: borderRadius.xxl,
                    borderTopRightRadius: borderRadius.xxl,
                    marginTop: spacing.md,
                    ...shadows.sm
                }
            ]}>
                <View style={[
                    styles.header,
                    {
                        // paddingHorizontal: spacing.lg,
                        // paddingVertical: spacing.md,
                    }
                ]}>
                    <Logo size="large" />

                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={[styles.iconButton, { marginRight: spacing.md }]}
                            onPress={() => setSearchActive(!searchActive)}
                        >
                            <Ionicons
                                name="search"
                                size={24}
                                color={searchActive ? colors.primary.main : colors.neutral.darkGray}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.composeButton,
                                {
                                    backgroundColor: colors.primary.main,
                                    borderRadius: borderRadius.xxl,
                                    paddingHorizontal: spacing.sm,
                                    paddingVertical: spacing.xs,
                                    ...shadows.sm
                                }
                            ]}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="create-outline" size={20} color={colors.neutral.white} />
                            <Text style={[styles.composeText, {
                                color: colors.neutral.white,
                                marginLeft: spacing.xs,
                                fontSize: typography.fontSize.sm,
                                fontWeight: '600'
                            }]}>New</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                {searchActive && (
                    <Animated.View
                        style={[
                            styles.searchContainer,
                            {
                                backgroundColor: colors.neutral.offWhite,
                                marginHorizontal: 0,
                                borderRadius: borderRadius.xxl,
                                ...shadows.xs
                            }
                        ]}
                    >
                        <Ionicons name="search" size={20} color={colors.neutral.mediumGray} style={{ marginLeft: spacing.md }} />
                        <TextInput
                            style={[styles.searchInput, {
                                color: colors.neutral.charcoal,
                                flex: 1,
                                fontSize: typography.fontSize.md,
                                height: 44,
                                paddingHorizontal: spacing.sm
                            }]}
                            placeholder="Search messages..."
                            placeholderTextColor={colors.neutral.mediumGray}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={{ padding: spacing.xs }}
                                onPress={() => setSearchQuery('')}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.neutral.mediumGray} />
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}

                <View style={[styles.titleContainer, { marginHorizontal: 0, paddingBottom: 10 }]}>
                    <Text style={[
                        styles.screenTitle,
                        {
                            color: colors.neutral.charcoal,
                            fontSize: typography.fontSize.xl,
                            fontWeight: '700'
                        }
                    ]}>
                        Messages
                    </Text>
                    {filteredChats.length > 0 && (
                        <View style={[
                            styles.countBadge,
                            {
                                backgroundColor: colors.primary.light,
                                borderRadius: borderRadius.round,
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.xxs
                            }
                        ]}>
                            <Text style={[
                                styles.countText,
                                {
                                    color: colors.primary.dark,
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: '600'
                                }
                            ]}>
                                {filteredChats.length}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{
                    paddingTop: spacing.md,
                    paddingBottom: spacing.xxxl,
                    paddingHorizontal: 0
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                ListHeaderComponent={
                    <>
                        {renderAIChatEntry()}
                        <View style={{ height: spacing.sm }} />
                    </>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 0,
    },
    headerContainer: {
        // Remove the hardcoded border radius values which will now be applied via the inline style
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
    },
    composeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    composeText: {},
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    screenTitle: {},
    countBadge: {
        marginLeft: 8,
    },
    countText: {},
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchInput: {
        paddingHorizontal: 8,
    },
    chatItem: {
        flexDirection: 'row',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatarGradient: {},
    unreadBadge: {
        position: 'absolute',
        width: 20,
        height: 20,
        top: -5,
        right: -5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadText: {},
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sellerName: {},
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    timestamp: {},
    lastMessage: {},
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyTitle: {},
    emptyText: {},
    startButton: {},
    startButtonText: {},
    aiChatItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiAvatarGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    aiAvatarInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiContentWrapper: {
        width: '100%',
        padding: 20,
    },
    aiHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    aiTitleContainer: {
        flexDirection: 'column',
    },
    aiTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
        marginBottom: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    aiSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)',
        marginRight: 6,
    },
    aiBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    aiBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'white',
    },
    aiBodyContent: {
        marginVertical: 12,
    },
    aiDescription: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.95)',
        marginBottom: 12,
    },
    aiFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    aiFeatureTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
        elevation: 1,
    },
    aiFeatureText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    aiFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
    },
    newBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    newBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: 'white',
    },
    chatNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
        elevation: 1,
    },
    chatNowText: {
        fontSize: 13,
        fontWeight: '700',
        color: 'white',
        marginRight: 6,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -40,
        right: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    aiAvatarOuterContainer: {
        position: 'relative',
        marginRight: 12,
    },
    aiRibbon: {
        position: 'absolute',
        top: -10,
        right: -10,
        padding: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 10,
    },
    aiRibbonText: {
        fontSize: 10,
        fontWeight: '800',
        color: 'white',
    },
    aiChatArrow: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    aiContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiChatButton: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    shimmerEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 80,
        height: '200%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: [{ rotate: '25deg' }],
    },
});

export default ChatListScreen; 