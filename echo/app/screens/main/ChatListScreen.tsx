import React, { useState, useEffect } from 'react';
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
                    ...shadows.sm
                }
            ]}>
                <View style={[
                    styles.header,
                    {
                        // paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
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
                    <View style={{ height: spacing.sm }} />
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
});

export default ChatListScreen; 