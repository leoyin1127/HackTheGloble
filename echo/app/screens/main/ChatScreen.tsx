import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Animated,
    SectionList,
    SectionListData,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import PlaceholderImage from '../../components/PlaceholderImage';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ProductService, { Product } from '../../services/ProductService';

type ChatScreenRouteProp = RouteProp<MainStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList>;

// Define the Message type with proper status values
type Message = {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    time?: string;
    images?: { uri: string }[];
    isSending?: boolean;
    status: 'read' | 'unread' | 'sending';
}

interface MessageSection {
    date: string;
    data: Message[];
}

const SELLERS = {
    'ameliegong': {
        name: 'Amelie Gong',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        rating: 5,
        status: 'online',
        lastActive: null,
    },
    'ecofriendly': {
        name: 'Eco Friendly',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        rating: 4.8,
        status: 'online',
        lastActive: null,
    },
    'greenbasics': {
        name: 'Green Basics',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        rating: 4.5,
        status: 'offline',
        lastActive: '2 hours ago',
    },
    'sustainashop': {
        name: 'Sustaina Shop',
        avatar: { uri: 'https://placehold.co/100x100/56B870/FFFFFF?text=👤' },
        rating: 4.7,
        status: 'offline',
        lastActive: '5 minutes ago',
    },
};

// Sample initial messages
const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        text: "Hi there! I'm interested in your recycled tote bag. Is it still available?",
        isUser: true,
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        status: 'read',
    },
    {
        id: '2',
        text: "Hello! Yes, the tote bag is still available. It's made from 100% recycled plastic bottles and is really durable.",
        isUser: false,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'read',
    },
    {
        id: '3',
        text: "That sounds great! What colors do you have in stock?",
        isUser: true,
        timestamp: new Date(Date.now() - 3500000),
        status: 'read',
    },
    {
        id: '4',
        text: "We have it in natural beige, forest green, and ocean blue. All colors are made with non-toxic dyes. Here are some photos:",
        isUser: false,
        timestamp: new Date(Date.now() - 3450000),
        images: [
            { uri: 'https://placehold.co/300x300/E0F7FA/2C3E50?text=Image1' },
            { uri: 'https://placehold.co/300x300/E8F5E9/2C3E50?text=Image2' },
        ],
        status: 'read',
    },
    {
        id: '5',
        text: "I love the forest green! What's the price?",
        isUser: true,
        timestamp: new Date(Date.now() - 3400000),
        status: 'read',
    },
];

const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const groupMessagesByDate = (messages: Message[]): MessageSection[] => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach(message => {
        const date = message.timestamp.toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
        date,
        data: msgs,
    }));
};

// Define a type for seller IDs
type SellerId = keyof typeof SELLERS;

const ChatScreen = () => {
    const route = useRoute<ChatScreenRouteProp>();
    const navigation = useNavigation<ChatScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows, animation } = useTheme();

    // Extract params from route
    const { sellerId: routeSellerId, itemId } = route.params;

    // Add state for the product if itemId is provided
    const [product, setProduct] = useState<Product | null>(null);
    const [productLoading, setProductLoading] = useState(!!itemId);

    // Convert seller ID from route params to a valid seller ID for the SELLERS object
    // or use a default seller if not found
    const [sellerId, setSellerId] = useState<keyof typeof SELLERS>('ameliegong');

    // Update sellerId when route param changes
    useEffect(() => {
        if (routeSellerId && Object.keys(SELLERS).includes(routeSellerId)) {
            setSellerId(routeSellerId as keyof typeof SELLERS);
        } else if (routeSellerId) {
            // If sellerId is provided but not in SELLERS, default to first one
            setSellerId('ameliegong');
            console.log(`Seller ${routeSellerId} not found, using default`);
        }
    }, [routeSellerId]);

    const seller = SELLERS[sellerId];

    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const sectionListRef = useRef<SectionList<Message, MessageSection>>(null);
    const inputRef = useRef<TextInput>(null);
    const quickRepliesAnim = useRef(new Animated.Value(0)).current;
    const messagesFadeAnim = useRef(new Animated.Value(0)).current;
    const typingAnim = useRef(new Animated.Value(0)).current;

    // Group messages by date
    const messageGroups = groupMessagesByDate(messages);

    const QUICK_REPLIES = [
        'Is this item still available?',
        'Can you offer a discount?',
        'How soon can you ship?',
        'Do you have more photos?',
    ];

    // Fetch product if itemId is provided
    useEffect(() => {
        const fetchProduct = async () => {
            if (!itemId) return;

            try {
                setProductLoading(true);
                const productData = await ProductService.getProductById(itemId);
                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product for chat:', error);
            } finally {
                setProductLoading(false);
            }
        };

        fetchProduct();
    }, [itemId]);

    useEffect(() => {
        // Animate messages appearing
        Animated.spring(messagesFadeAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Animate quick replies panel
        if (showQuickReplies) {
            Animated.spring(quickRepliesAnim, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(quickRepliesAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                // Scroll to bottom when keyboard appears
                scrollToBottom();
                // Hide quick replies when keyboard appears
                hideQuickReplies();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [showQuickReplies]);

    // Simulate typing animation when a new message is sent
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].isUser) {
            // Simulate the seller typing after user sends a message
            setTimeout(() => {
                setIsTyping(true);

                // Start typing animation
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(typingAnim, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(typingAnim, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();

                // After a short delay, stop typing and send a response
                setTimeout(() => {
                    setIsTyping(false);
                    const newReply = getRandomReply();
                    setMessages(prev => [...prev, newReply]);

                    // Scroll to the newest message
                    setTimeout(scrollToBottom, 100);
                }, 2000);
            }, 1000);
        }
    }, [messages]);

    const toggleQuickReplies = () => {
        if (showQuickReplies) {
            hideQuickReplies();
        } else {
            showQuickRepliesPanel();
        }
    };

    const showQuickRepliesPanel = () => {
        setShowQuickReplies(true);
        Animated.timing(quickRepliesAnim, {
            toValue: 1,
            duration: animation.fast,
            useNativeDriver: true,
        }).start();
    };

    const hideQuickReplies = () => {
        Animated.timing(quickRepliesAnim, {
            toValue: 0,
            duration: animation.fast,
            useNativeDriver: true,
        }).start(() => {
            setShowQuickReplies(false);
        });
    };

    const scrollToBottom = () => {
        if (!sectionListRef.current || messageGroups.length === 0) {
            return;
        }

        try {
            const lastSection = messageGroups[messageGroups.length - 1];
            if (lastSection && lastSection.data.length > 0) {
                sectionListRef.current.scrollToLocation({
                    sectionIndex: messageGroups.length - 1,
                    itemIndex: lastSection.data.length - 1,
                    animated: false,
                    viewOffset: 0,
                });
            }
        } catch (error) {
            console.log('Error scrolling to bottom:', error);
        }
    };

    const handleSellerReply = () => {
        // Simulate seller reply after a delay
        setTimeout(() => {
            const sellerReply: Message = {
                id: `msg-${Date.now()}`,
                text: "Thank you for your interest! This product is made from 100% recycled materials and comes with carbon-neutral shipping.",
                isUser: false,
                timestamp: new Date(),
                status: 'unread' as const,
            };
            setMessages(prev => [...prev, sellerReply]);
            setIsTyping(false);
        }, 2000);
    };

    const handleSellerImageReply = () => {
        setTimeout(() => {
            const sellerImageReply: Message = {
                id: `msg-${Date.now()}`,
                text: "Here's our sustainable tote bag. It's made from organic cotton and natural dyes.",
                isUser: false,
                timestamp: new Date(),
                images: [
                    { uri: 'https://placehold.co/400x300/E0F7FA/2C3E50?text=Sustainable+Product' },
                ],
                status: 'unread' as const,
            };

            setMessages(prev => [...prev, sellerImageReply]);
        }, 3000);

        setTimeout(() => {
            const sellerMultiImageReply: Message = {
                id: `msg-${Date.now()}`,
                text: "And here are some photos of the eco-friendly packaging we use.",
                isUser: false,
                timestamp: new Date(),
                images: [
                    { uri: 'https://placehold.co/400x300/E8F5E9/2C3E50?text=Eco+Friendly+1' },
                    { uri: 'https://placehold.co/400x300/F9FBE7/2C3E50?text=Eco+Friendly+2' },
                ],
                status: 'unread' as const,
            };
            setMessages(prev => [...prev, sellerMultiImageReply]);
        }, 5000);
    };

    const sendMessage = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: `msg-${Date.now()}`,
                text: inputText.trim(),
                isUser: true,
                timestamp: new Date(),
                isSending: true,
                status: 'sending' as const,
            };

            setMessages(prev => [...prev, newMessage]);
            setInputText('');

            // Simulate message sending delay
            setTimeout(() => {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === newMessage.id
                        ? { ...msg, isSending: false, status: 'read' as const }
                        : msg
                    )
                );

                setIsTyping(true);
                handleSellerReply();

                // 50% chance to show image reply
                if (Math.random() > 0.5) {
                    handleSellerImageReply();
                }
            }, 1000);
        }
    };

    const getRandomReply = () => {
        const replies = [
            "Thanks for your message! We'd be happy to help with that.",
            "Great question! Let me check that for you.",
            "That's a good point. Let me provide some more details.",
            "I appreciate your interest in our sustainable products!",
        ];
        const randomIndex = Math.floor(Math.random() * replies.length);
        return {
            id: (Date.now() + 2000).toString(),
            text: replies[randomIndex],
            isUser: false,
            timestamp: new Date(),
            status: 'unread' as const,
        };
    };

    const handleAttachImage = () => {
        // Simulate adding an image message
        const newImageMessage: Message = {
            id: Date.now().toString(),
            text: "Here's an image of our sustainable product",
            isUser: true,
            timestamp: new Date(),
            images: [
                { uri: 'https://placehold.co/400x300/E0F7FA/2C3E50?text=Sustainable+Product' },
            ],
            status: 'unread' as const,
        };

        setMessages([...messages, newImageMessage]);

        // Scroll to bottom after adding new message
        setTimeout(scrollToBottom, 100);

        // Simulate seller's reply with image after a delay
        setTimeout(() => {
            const sellerImageReply: Message = {
                id: (Date.now() + 1000).toString(),
                text: "Here are more photos of our eco-friendly collection",
                isUser: false,
                timestamp: new Date(),
                images: [
                    { uri: 'https://placehold.co/400x300/E8F5E9/2C3E50?text=Eco+Friendly+1' },
                    { uri: 'https://placehold.co/400x300/F9FBE7/2C3E50?text=Eco+Friendly+2' },
                ],
                status: 'unread' as const,
            };
            setMessages(prev => [...prev, sellerImageReply]);
            setTimeout(scrollToBottom, 100);
        }, 2000);
    };

    const handleQuickReply = (reply: string) => {
        setInputText(reply);
        hideQuickReplies();
        inputRef.current?.focus();
    };

    const renderMessageSection = ({ section }: { section: MessageSection }) => {
        const date = new Date(section.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateLabel: string;

        if (date.toDateString() === today.toDateString()) {
            dateLabel = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateLabel = 'Yesterday';
        } else {
            dateLabel = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
            });
        }

        return (
            <View style={[styles.dateSection, { marginVertical: spacing.md }]}>
                <View style={[
                    styles.dateBadge,
                    {
                        backgroundColor: colors.neutral.lightGray,
                        borderRadius: borderRadius.round,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                    }
                ]}>
                    <Text style={[
                        styles.dateText,
                        {
                            color: colors.neutral.darkGray,
                            fontSize: typography.fontSize.xs,
                            fontWeight: '500',
                        }
                    ]}>
                        {dateLabel}
                    </Text>
                </View>
            </View>
        );
    };

    const renderMessage = ({
        item,
        index,
        section
    }: {
        item: Message;
        index: number;
        section: SectionListData<Message, MessageSection>;
    }) => {
        const isUser = item.isUser;
        const isFirstInGroup = index === 0 || section.data[index - 1].isUser !== isUser;
        const isLastInGroup = index === section.data.length - 1 || section.data[index + 1].isUser !== isUser;

        // Determine bubble shape based on position in the group
        let borderRadiusStyle = {};
        if (isUser) {
            borderRadiusStyle = {
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: isFirstInGroup ? borderRadius.xl : borderRadius.lg,
                borderBottomLeftRadius: borderRadius.xl,
                borderBottomRightRadius: isLastInGroup ? borderRadius.xl : borderRadius.lg,
            };
        } else {
            borderRadiusStyle = {
                borderTopLeftRadius: isFirstInGroup ? borderRadius.xl : borderRadius.lg,
                borderTopRightRadius: borderRadius.xl,
                borderBottomLeftRadius: isLastInGroup ? borderRadius.xl : borderRadius.lg,
                borderBottomRightRadius: borderRadius.xl,
            };
        }

        // Enhanced animation based on message position
        const messageAnimationDelay = index * 50;

        const messageAnimation = {
            opacity: messagesFadeAnim,
            transform: [
                {
                    translateY: messagesFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [isUser ? 20 : 10, 0],
                    })
                },
                {
                    scale: messagesFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                    })
                },
                {
                    translateX: messagesFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [isUser ? 10 : -10, 0],
                    })
                }
            ]
        };

        return (
            <Animated.View
                style={[
                    styles.messageRow,
                    isUser ? styles.userMessageRow : styles.sellerMessageRow,
                    { marginBottom: isLastInGroup ? spacing.md : spacing.xs },
                    messageAnimation
                ]}
            >
                {!isUser && isFirstInGroup && (
                    <View style={styles.avatarContainer}>
                        <PlaceholderImage
                            type="avatar"
                            width={36}
                            height={36}
                            borderRadius={18}
                        />
                    </View>
                )}

                <View style={{ flex: 1, marginLeft: !isUser && !isFirstInGroup ? 36 + spacing.sm : 0 }}>
                    <View
                        style={[
                            styles.messageBubble,
                            isUser ? styles.userMessageBubble : styles.sellerMessageBubble,
                            {
                                backgroundColor: isUser ? colors.primary.main : colors.neutral.white,
                                padding: spacing.md,
                                marginBottom: spacing.xxs,
                                ...shadows.sm,
                                ...borderRadiusStyle,
                            },
                            item.isSending && { opacity: 0.7 }
                        ]}
                    >
                        {/* Message text */}
                        <Text
                            style={[
                                styles.messageText,
                                {
                                    color: isUser ? colors.neutral.white : colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
                                    lineHeight: typography.lineHeight.md,
                                }
                            ]}
                        >
                            {item.text}
                        </Text>

                        {/* Image attachments if any */}
                        {item.images && item.images.length > 0 && (
                            <View style={[
                                styles.imageGrid,
                                { marginTop: spacing.sm }
                            ]}>
                                {item.images.map((image, imgIndex) => (
                                    <Pressable
                                        key={imgIndex}
                                        style={[
                                            styles.imageContainer,
                                            {
                                                marginRight: imgIndex < item.images!.length - 1 ? spacing.xs : 0,
                                                borderRadius: borderRadius.xxl,
                                                overflow: 'hidden',
                                                ...shadows.xs
                                            }
                                        ]}
                                    >
                                        <PlaceholderImage
                                            type="product"
                                            width={item.images!.length > 1 ? 120 : 200}
                                            height={item.images!.length > 1 ? 90 : 150}
                                            borderRadius={borderRadius.xxl}
                                        />
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Time and status */}
                    <View
                        style={[
                            styles.messageFooter,
                            isUser ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
                        ]}
                    >
                        <Text
                            style={[
                                styles.timeText,
                                {
                                    color: colors.neutral.mediumGray,
                                    fontSize: typography.fontSize.xs,
                                    marginHorizontal: spacing.xs
                                }
                            ]}
                        >
                            {formatTime(item.timestamp)}
                        </Text>

                        {isUser && (
                            <Ionicons
                                name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                                size={14}
                                color={item.status === 'read' ? colors.primary.main : colors.neutral.mediumGray}
                            />
                        )}
                    </View>
                </View>
            </Animated.View>
        );
    };

    const renderHeader = () => (
        <View style={[
            styles.header,
            {
                backgroundColor: colors.neutral.white,
                borderBottomWidth: 1,
                borderBottomColor: colors.neutral.lightGray,
                paddingVertical: spacing.md,
                paddingHorizontal: 0,
                borderBottomLeftRadius: borderRadius.xxl,
                borderBottomRightRadius: borderRadius.xxl,
                ...shadows.sm,
            }
        ]}>
            <TouchableOpacity
                style={[
                    styles.backButton,
                    {
                        padding: spacing.sm,
                    }
                ]}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                <Ionicons name="arrow-back" size={24} color={colors.neutral.charcoal} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.sellerInfo}
                onPress={() => {
                    // Navigate to seller profile or show seller details
                }}
            >
                <View style={styles.sellerAvatar}>
                    <View style={[
                        styles.avatarContainer,
                        {
                            borderRadius: borderRadius.round,
                            padding: seller.status === 'online' ? 2 : 0,
                            borderWidth: seller.status === 'online' ? 2 : 0,
                            borderColor: seller.status === 'online' ? colors.primary.main : 'transparent',
                            ...shadows.xs
                        }
                    ]}>
                        <PlaceholderImage
                            type="avatar"
                            width={40}
                            height={40}
                            borderRadius={borderRadius.round}
                        />
                    </View>

                    {seller.status === 'online' && (
                        <View
                            style={[
                                styles.statusIndicator,
                                {
                                    backgroundColor: colors.semantic.success,
                                    borderWidth: 2,
                                    borderColor: colors.neutral.white,
                                    width: 14,
                                    height: 14,
                                    borderRadius: borderRadius.round,
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                }
                            ]}
                        />
                    )}
                </View>

                <View style={styles.sellerTextInfo}>
                    <Text style={[
                        styles.sellerName,
                        {
                            color: colors.neutral.charcoal,
                            fontSize: typography.fontSize.md,
                            fontWeight: '600',
                        }
                    ]}>
                        {seller.name}
                    </Text>
                    <Text style={[
                        styles.sellerStatus,
                        {
                            color: seller.status === 'online' ? colors.semantic.success : colors.neutral.darkGray,
                            fontSize: typography.fontSize.xs,
                        }
                    ]}>
                        {seller.status === 'online' ? 'Online' : `Last active ${seller.lastActive}`}
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={[styles.headerButton, { marginRight: spacing.sm }]}
                >
                    <Ionicons name="call-outline" size={22} color={colors.primary.main} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-vertical" size={22} color={colors.neutral.darkGray} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderQuickReplies = () => (
        <Animated.View
            style={[
                styles.quickRepliesContainer,
                {
                    backgroundColor: colors.neutral.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.neutral.lightGray,
                    paddingVertical: spacing.md,
                    paddingHorizontal: 0,
                    borderTopLeftRadius: borderRadius.xxl,
                    borderTopRightRadius: borderRadius.xxl,
                    transform: [
                        {
                            translateY: quickRepliesAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [100, 0],
                            }),
                        },
                    ],
                    opacity: quickRepliesAnim,
                    position: 'absolute',
                    bottom: isKeyboardVisible ? 0 : 0,
                    left: 0,
                    right: 0,
                    ...shadows.md,
                },
            ]}
        >
            <View style={[styles.quickRepliesHeader, { marginBottom: spacing.sm, marginHorizontal: spacing.lg }]}>
                <Text style={[styles.quickRepliesTitle, { color: colors.neutral.charcoal, fontWeight: '600' }]}>
                    Quick Replies
                </Text>
                <TouchableOpacity onPress={hideQuickReplies}>
                    <Ionicons name="close" size={24} color={colors.neutral.darkGray} />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.quickRepliesScroll, { paddingHorizontal: spacing.lg }]}
            >
                {QUICK_REPLIES.map((reply, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.quickReplyButton,
                            {
                                backgroundColor: colors.neutral.offWhite,
                                borderRadius: borderRadius.md,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                marginRight: spacing.sm,
                                borderWidth: 1,
                                borderColor: colors.neutral.lightGray,
                                ...shadows.xs,
                            },
                        ]}
                        onPress={() => handleQuickReply(reply)}
                    >
                        <Text
                            style={[
                                styles.quickReplyText,
                                {
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.sm,
                                },
                            ]}
                        >
                            {reply}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );

    const renderTypingIndicator = () => {
        if (!isTyping) return null;

        return (
            <Animated.View
                style={[
                    styles.typingIndicator,
                    {
                        backgroundColor: colors.neutral.white,
                        borderRadius: borderRadius.xxl,
                        padding: spacing.md,
                        marginBottom: spacing.md,
                        marginLeft: 0,
                        alignSelf: 'flex-start',
                        maxWidth: '70%',
                        ...shadows.sm,
                    }
                ]}
            >
                <View style={styles.typingDots}>
                    {[0, 1, 2].map((i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.typingDot,
                                {
                                    backgroundColor: colors.primary.main,
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    marginRight: i < 2 ? 4 : 0,
                                    opacity: typingAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.3, 0.8],
                                        extrapolate: 'clamp',
                                    }),
                                    transform: [
                                        {
                                            translateY: typingAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0, -4, 0],
                                                extrapolate: 'clamp',
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    ))}
                </View>
            </Animated.View>
        );
    };

    const startTypingIndicator = () => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);

            // Simulate seller reply
            const sellerReply: Message = {
                id: `msg-${Date.now()}`,
                text: "It's $24.99 and we offer free carbon-neutral shipping for orders over $50!",
                isUser: false,
                timestamp: new Date(),
                status: 'unread' as const,
            };

            setMessages(prev => [...prev, sellerReply]);
            scrollToBottom();
        }, 2000);
    };

    // Render the saved item card
    const renderSavedItem = () => {
        if (!product && !productLoading) return null;

        return (
            <View style={[
                styles.savedItemContainer,
                {
                    backgroundColor: colors.neutral.white,
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.md,
                    ...shadows.sm
                }
            ]}>
                {productLoading ? (
                    <View style={[styles.loadingContainer, { padding: spacing.md }]}>
                        <ActivityIndicator size="small" color={colors.primary.main} />
                        <Text style={{ color: colors.neutral.darkGray, marginTop: spacing.xs }}>
                            Loading item...
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.savedItemContent}
                        onPress={() => navigation.navigate('ItemDetail', { itemId: product!.id })}
                        activeOpacity={0.7}
                    >
                        <PlaceholderImage
                            type="product"
                            width={60}
                            height={60}
                            borderRadius={borderRadius.md}
                            text={product?.title}
                        />
                        <View style={[styles.savedItemInfo, { marginLeft: spacing.md }]}>
                            <Text
                                style={{
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: 'bold',
                                    marginBottom: spacing.xs
                                }}
                                numberOfLines={1}
                            >
                                {product?.title}
                            </Text>
                            <Text
                                style={{
                                    color: colors.primary.main,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: 'bold'
                                }}
                            >
                                ${typeof product?.price === 'number' ? product?.price.toFixed(2) : product?.price}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral.darkGray} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

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

            {/* Header */}
            {renderHeader()}

            {/* Messages */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
                <SectionList
                    ref={sectionListRef}
                    sections={messageGroups}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={renderMessage}
                    renderSectionHeader={renderMessageSection}
                    contentContainerStyle={[
                        styles.messagesContainer,
                        {
                            paddingHorizontal: 0,
                            paddingTop: spacing.md,
                            paddingBottom: spacing.xxxl,
                        }
                    ]}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={renderTypingIndicator}
                    ListHeaderComponent={
                        <>
                            {renderSavedItem()}
                            <View style={{ height: spacing.sm }} />
                        </>
                    }
                />

                {/* Input bar */}
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: colors.neutral.white,
                            borderTopWidth: 1,
                            borderTopColor: colors.neutral.lightGray,
                            paddingHorizontal: 0,
                            paddingVertical: spacing.md,
                            borderTopLeftRadius: borderRadius.xxl,
                            borderTopRightRadius: borderRadius.xxl,
                            ...shadows.md
                        },
                    ]}
                >
                    <View style={[
                        styles.inputBar,
                        {
                            backgroundColor: colors.neutral.offWhite,
                            borderRadius: borderRadius.xxl,
                            paddingHorizontal: spacing.md,
                            marginHorizontal: spacing.lg,
                            flexDirection: 'row',
                            alignItems: 'center',
                            ...shadows.xs
                        }
                    ]}>
                        <TouchableOpacity
                            style={[styles.attachButton, { paddingVertical: spacing.sm, marginRight: spacing.sm }]}
                            onPress={handleAttachImage}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="attach" size={24} color={colors.neutral.darkGray} />
                        </TouchableOpacity>

                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.textInput,
                                {
                                    flex: 1,
                                    height: 40,
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
                                    marginTop: 8
                                }
                            ]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.neutral.mediumGray}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />

                        <TouchableOpacity
                            style={[styles.quickReplyButton, { padding: spacing.sm, marginRight: spacing.sm }]}
                            onPress={toggleQuickReplies}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="list" size={24} color={colors.neutral.darkGray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: inputText.trim() ? colors.primary.main : colors.neutral.lightGray,
                                    width: 40,
                                    height: 40,
                                    borderRadius: borderRadius.round,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    ...(inputText.trim() ? shadows.sm : {})
                                }
                            ]}
                            onPress={sendMessage}
                            disabled={!inputText.trim()}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={inputText.trim() ? colors.neutral.white : colors.neutral.mediumGray}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Replies Panel - conditionally rendered */}
                {showQuickReplies && renderQuickReplies()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32
    },
    headerGradient: {},
    backButton: {},
    sellerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    sellerAvatar: {
        position: 'relative',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    statusIndicator: {},
    sellerTextInfo: {},
    sellerName: {},
    sellerStatus: {},
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginLeft: 12,
    },
    messagesContainer: {
        flexGrow: 1,
    },
    dateSection: {
        alignItems: 'center',
    },
    dateBadge: {},
    dateText: {},
    messageRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    userMessageRow: {
        justifyContent: 'flex-end',
    },
    sellerMessageRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
    },
    userMessageBubble: {
        alignSelf: 'flex-end',
    },
    sellerMessageBubble: {
        alignSelf: 'flex-start',
    },
    messageText: {},
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,

    },
    timeText: {
        marginRight: 4,
    },
    imageGrid: {
        flexDirection: 'row',
    },
    imageContainer: {},
    inputContainer: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32
    },
    inputBar: {},
    attachButton: {},
    textInput: {},
    sendButton: {},
    quickRepliesContainer: {},
    quickRepliesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickRepliesTitle: {},
    quickRepliesScroll: {
        paddingVertical: 8,
    },
    quickReplyButton: {},
    quickReplyText: {},
    typingIndicator: {},
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
    },
    typingDot: {},
    savedItemContainer: {
        marginHorizontal: 16,
        overflow: 'hidden'
    },
    savedItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    savedItemInfo: {
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
});

export default ChatScreen; 