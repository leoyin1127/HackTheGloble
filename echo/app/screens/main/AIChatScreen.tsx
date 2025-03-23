import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    Keyboard,
    Animated,
    Dimensions,
    StatusBar as RNStatusBar,
    ScrollView,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ProductService, { Product } from '../../services/ProductService';

const { width, height } = Dimensions.get('window');

type AIChatScreenNavigationProp = StackNavigationProp<MainStackParamList, 'AIChat'>;

// Define message types
interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

// Sample AI responses for demo purposes
const aiResponses = [
    "I'd recommend trying a sustainable denim jacket with a white t-shirt and eco-friendly sneakers. It's a timeless look that works for many occasions!",
    "Based on the items you've viewed, you might enjoy a minimalist style with earth tones. Have you considered adding more organic cotton pieces to your wardrobe?",
    "Your style profile suggests you value both comfort and sustainability. I've found some recycled polyester athletic wear that might interest you.",
    "For your upcoming event, consider a secondhand formal outfit paired with vintage accessories for a unique, eco-conscious look.",
    "The bamboo fabric items you've been looking at are excellent choices! They're breathable, sustainable, and perfect for sensitive skin.",
];

const AIChatScreen = () => {
    const navigation = useNavigation<AIChatScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm Echo, your personal stylist. How can I help you discover sustainable fashion that matches your unique style?",
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [isSavedItemsModalVisible, setIsSavedItemsModalVisible] = useState(false);
    const [savedItems, setSavedItems] = useState<Product[]>([]);
    const [isLoadingSavedItems, setIsLoadingSavedItems] = useState(false);

    // Custom colors based on the screenshot
    const TEAL_DARK = '#22606e';
    const TEAL_MEDIUM = '#5a9e94';
    const TEAL_LIGHT = '#c4e1dd';
    const WHITE = '#ffffff';
    const GRAY_LIGHT = '#f7f7f7';

    // State to control bottom padding
    const [bottomPadding, setBottomPadding] = useState(0);

    // More aggressive approach to hide bottom tab navigation
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            // Ensure proper padding when the tab bar is hidden
            setBottomPadding(Platform.OS === 'ios' ? 30 : 16);

            // Use multiple approaches to ensure the tab bar is hidden
            // Method 1: Set display none via tabBarStyle
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' },
                tabBarVisible: false,
            });

            // Method 2: Update via navigation state params (for some React Navigation versions)
            navigation.getParent()?.setParams({
                hideTabBar: true
            });

            // Set status bar to light mode for better visibility
            if (Platform.OS === 'android') {
                RNStatusBar.setBackgroundColor(TEAL_DARK);
                RNStatusBar.setBarStyle('light-content');
            }
        }

        return () => {
            // Reset padding
            setBottomPadding(0);

            // Restore bottom tabs when leaving this screen
            navigation.getParent()?.setOptions({
                tabBarStyle: undefined,
                tabBarVisible: undefined,
            });

            // Also reset navigation params
            navigation.getParent()?.setParams({
                hideTabBar: false
            });

            // Restore status bar
            if (Platform.OS === 'android') {
                RNStatusBar.setBarStyle('dark-content');
            }
        };
    }, [isFocused, navigation]);

    // Animation for the avatar
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Set up pulsing animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Handle sending a new message
    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI response delay
        setTimeout(() => {
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            const newAIMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: randomResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prevMessages => [...prevMessages, newAIMessage]);
            setIsTyping(false);
        }, 1500);
    };

    // Auto-scroll to the latest message
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Navigate back
    const navigateBack = () => {
        navigation.goBack();
    };

    // Animated dots for typing indicator
    const [dotOpacities] = useState([
        new Animated.Value(0.4),
        new Animated.Value(0.4),
        new Animated.Value(0.4)
    ]);

    // Animate typing dots
    useEffect(() => {
        if (isTyping) {
            const animations = dotOpacities.map((opacity, i) => {
                return Animated.sequence([
                    Animated.delay(i * 200),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.4,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]);
            });

            Animated.loop(
                Animated.stagger(100, animations)
            ).start();
        } else {
            dotOpacities.forEach(opacity => {
                opacity.setValue(0.4);
            });
        }

        return () => {
            dotOpacities.forEach(opacity => {
                opacity.stopAnimation();
            });
        };
    }, [isTyping]);

    // Fetch saved items 
    const fetchSavedItems = async () => {
        try {
            setIsLoadingSavedItems(true);
            // Example saved IDs - in a real app, this would come from user preferences or state
            const savedItemIds = ['1', '2', '3'];

            const items = await ProductService.getSavedProducts(savedItemIds);
            setSavedItems(items);
        } catch (error) {
            console.error('Error fetching saved items:', error);
            // Fallback data
            setSavedItems([
                {
                    id: '1',
                    title: 'Vintage Denim Jacket',
                    price: 45.00,
                    description: 'Classic vintage denim jacket, perfect for all seasons',
                    images: ['https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket'],
                    condition: 'good',
                    seller_id: 'user1',
                    sellerName: 'ameliegong',
                    sustainability: 85,
                    sustainability_badges: ['Vintage', 'Secondhand'],
                    sustainability_info: {},
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: '2',
                    title: 'Organic Cotton Shirt',
                    price: 32.00,
                    description: 'Soft organic cotton shirt, ethically made',
                    images: ['https://placehold.co/600x800/F9FBE7/2C3E50?text=Shirt'],
                    condition: 'new',
                    seller_id: 'user2',
                    sellerName: 'greenbasics',
                    sustainability: 90,
                    sustainability_badges: ['Organic', 'Fair Trade'],
                    sustainability_info: {},
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: '3',
                    title: 'Upcycled Glass Vase',
                    price: 24.00,
                    description: 'Beautiful vase made from upcycled glass',
                    images: ['https://placehold.co/600x800/FFF8E1/2C3E50?text=Vase'],
                    condition: 'good',
                    seller_id: 'user3',
                    sellerName: 'ecofriendly',
                    sustainability: 95,
                    sustainability_badges: ['Upcycled', 'Zero Waste'],
                    sustainability_info: {},
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ]);
        } finally {
            setIsLoadingSavedItems(false);
        }
    };

    // Handle showing saved items modal
    const openSavedItemsModal = () => {
        fetchSavedItems();
        setIsSavedItemsModalVisible(true);
    };

    // Handle sending a saved item in chat
    const handleSendSavedItem = (item: Product) => {
        const itemText = `Can you tell me more about this ${item.title}? It costs $${item.price.toFixed(2)} and has sustainability score of ${item.sustainability}/100.`;

        setInputText(itemText);
        setIsSavedItemsModalVisible(false);

        // Optional: Automatically send the message
        setTimeout(() => {
            handleSend();
        }, 100);
    };

    // Render individual message item
    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.isUser ? styles.userBubble : styles.aiBubble,
            ]}
        >
            {!item.isUser && (
                <View style={styles.messageHeader}>
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={styles.botIcon}
                        defaultSource={require('../../../assets/icon.png')}
                    />
                    <Text style={styles.botName}>Echo</Text>
                    <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                </View>
            )}
            <Text
                style={[
                    styles.messageText,
                    { color: item.isUser ? WHITE : '#333' },
                ]}
            >
                {item.text}
            </Text>
            <Text
                style={[
                    styles.timestamp,
                    { color: item.isUser ? 'rgba(255,255,255,0.7)' : '#999' },
                ]}
            >
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    // Render saved item in modal
    const renderSavedItem = ({ item }: { item: Product }) => {
        const imageUri = item.images && item.images.length > 0
            ? item.images[0]
            : 'https://placehold.co/600x800/E0F7FA/2C3E50?text=No+Image';

        return (
            <TouchableOpacity
                style={styles.savedItemContainer}
                onPress={() => handleSendSavedItem(item)}
            >
                <Image source={{ uri: imageUri }} style={styles.savedItemImage} />
                <View style={styles.savedItemInfo}>
                    <Text style={styles.savedItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.savedItemPrice}>${item.price.toFixed(2)}</Text>
                    <View style={styles.savedItemBadgeContainer}>
                        <View style={styles.sustainabilityBadge}>
                            <Ionicons name="leaf" size={12} color={TEAL_DARK} />
                            <Text style={styles.sustainabilityText}>{item.sustainability}%</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.sendItemIconContainer}>
                    <Ionicons name="send" size={16} color={TEAL_DARK} />
                </View>
            </TouchableOpacity>
        );
    };

    // Another effective approach to hide the bottom navigation in some implementations
    // is to use a screen wrapper with full height
    const FullScreenWrapper = ({ children }: { children: React.ReactNode }) => (
        <View style={{ flex: 1, width: '100%', height: '100%' }}>
            {children}
        </View>
    );

    return (
        <View style={{
            position: 'absolute',
            width: width,
            height: height,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: TEAL_DARK,
        }}>
            <FullScreenWrapper>
                <SafeAreaView style={[styles.safeArea]} edges={['top']}>
                    <StatusBar style="light" />
                    <View style={styles.container}>
                        {/* Background Gradient */}
                        <LinearGradient
                            colors={[TEAL_DARK, TEAL_MEDIUM, TEAL_LIGHT]}
                            style={styles.backgroundGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 0.8 }}
                        />

                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={navigateBack}
                            >
                                <Ionicons name="chevron-back" size={30} color={WHITE} />
                            </TouchableOpacity>

                            <View style={styles.headerCenter}>
                                <Animated.View style={[
                                    styles.avatarContainer,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}>
                                    <View style={styles.avatarInner}>
                                        <Ionicons name="star" size={22} color={WHITE} />
                                    </View>
                                </Animated.View>

                                <View>
                                    <Text style={styles.headerTitle}>Echo</Text>
                                    <Text style={styles.headerSubtitle}>Your Personal Stylist</Text>
                                </View>
                            </View>

                            <View style={styles.onlineBadge}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.onlineText}>Online</Text>
                            </View>
                        </View>

                        {/* Chat Area */}
                        <View style={styles.chatContainer}>
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderItem}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.messagesList}
                                showsVerticalScrollIndicator={false}
                            />

                            {/* Typing Indicator */}
                            {isTyping && (
                                <View style={styles.typingContainer}>
                                    <View style={styles.typingBubble}>
                                        <View style={styles.typingAvatarContainer}>
                                            <Image
                                                source={require('../../../assets/icon.png')}
                                                style={styles.typingAvatar}
                                            />
                                        </View>
                                        <Animated.View style={[styles.typingDot, { opacity: dotOpacities[0] }]} />
                                        <Animated.View style={[styles.typingDot, { opacity: dotOpacities[1] }]} />
                                        <Animated.View style={[styles.typingDot, { opacity: dotOpacities[2] }]} />
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Quick Suggestions - Moved above input area */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.suggestionsContainer}
                            style={styles.suggestionsScrollView}
                        >
                            {[
                                'Sustainable fabrics',
                                'Outfit ideas',
                                'Eco-friendly brands',
                                'Capsule wardrobe',
                                'Ethical fashion',
                                'Thrift tips',
                            ].map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionPill}
                                    onPress={() => setInputText(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Input Area - Redesigned */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                            style={[
                                styles.inputArea,
                                { paddingBottom: bottomPadding }
                            ]}
                        >
                            {/* Chat Tools */}
                            <View style={styles.chatToolsContainer}>
                                <TouchableOpacity
                                    style={styles.chatToolButton}
                                    onPress={openSavedItemsModal}
                                >
                                    <LinearGradient
                                        colors={['#a2d2c5', TEAL_MEDIUM]}
                                        style={styles.chatToolButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="heart" size={18} color={WHITE} />
                                    </LinearGradient>
                                    <Text style={styles.chatToolText}>Items</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.chatToolButton}>
                                    <LinearGradient
                                        colors={['#9bc7d4', '#3c8797']}
                                        style={styles.chatToolButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="camera" size={18} color={WHITE} />
                                    </LinearGradient>
                                    <Text style={styles.chatToolText}>Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.chatToolButton}>
                                    <LinearGradient
                                        colors={['#93c2bc', '#42827a']}
                                        style={styles.chatToolButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <MaterialCommunityIcons name="palette-swatch" size={18} color={WHITE} />
                                    </LinearGradient>
                                    <Text style={styles.chatToolText}>Style</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.chatToolButton}>
                                    <LinearGradient
                                        colors={['#8ab5c7', '#317996']}
                                        style={styles.chatToolButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="leaf" size={18} color={WHITE} />
                                    </LinearGradient>
                                    <Text style={styles.chatToolText}>Eco</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Ask Echo for fashion advice..."
                                    placeholderTextColor="rgba(0,0,0,0.4)"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                    maxLength={500}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        { opacity: inputText.trim() === '' ? 0.6 : 1 }
                                    ]}
                                    onPress={handleSend}
                                    disabled={inputText.trim() === ''}
                                >
                                    <LinearGradient
                                        colors={[TEAL_MEDIUM, TEAL_DARK]}
                                        style={styles.sendButtonGradient}
                                    >
                                        <Ionicons name="send" size={20} color={WHITE} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>

                        {/* Saved Items Modal */}
                        <Modal
                            visible={isSavedItemsModalVisible}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setIsSavedItemsModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Saved Items</Text>
                                        <TouchableOpacity
                                            style={styles.modalCloseButton}
                                            onPress={() => setIsSavedItemsModalVisible(false)}
                                        >
                                            <Ionicons name="close" size={24} color="#333" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.modalSubtitle}>Select an item to share with Echo</Text>

                                    {isLoadingSavedItems ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="large" color={TEAL_MEDIUM} />
                                            <Text style={styles.loadingText}>Loading your saved items...</Text>
                                        </View>
                                    ) : savedItems.length > 0 ? (
                                        <FlatList
                                            data={savedItems}
                                            renderItem={renderSavedItem}
                                            keyExtractor={item => item.id}
                                            contentContainerStyle={styles.savedItemsList}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    ) : (
                                        <View style={styles.noItemsContainer}>
                                            <Ionicons name="heart-outline" size={60} color="#ccc" />
                                            <Text style={styles.noItemsText}>No saved items yet</Text>
                                            <Text style={styles.noItemsSubtext}>
                                                Items you save will appear here for you to share with Echo
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Modal>
                    </View>
                </SafeAreaView>
            </FullScreenWrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInner: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#5a9e94',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    onlineText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    chatContainer: {
        flex: 1,
        position: 'relative',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#5a9e94',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 22,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    botIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 6,
    },
    botName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#555',
    },
    aiBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
    aiBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#555',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    typingContainer: {
        marginLeft: 16,
        marginBottom: 12,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    typingAvatarContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    typingAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#777',
        marginHorizontal: 2,
    },
    inputArea: {
        paddingTop: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    chatToolsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    chatToolButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatToolButtonGradient: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    chatToolText: {
        fontSize: 12,
        color: '#444',
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 16,
    },
    textInput: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        paddingRight: 50,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        textAlignVertical: 'center',
        justifyContent: 'center',
        lineHeight: 24,
    },
    sendButton: {
        position: 'absolute',
        right: 6,
        bottom: 6,
    },
    sendButtonGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestionsScrollView: {
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        zIndex: 5,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    suggestionPill: {
        marginHorizontal: 4,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    suggestionText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 30,
        maxHeight: Dimensions.get('window').height * 0.7,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    savedItemsList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    savedItemContainer: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginVertical: 6,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    savedItemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    savedItemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    savedItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    savedItemPrice: {
        fontSize: 15,
        fontWeight: '500',
        color: '#22606e',
        marginBottom: 6,
    },
    savedItemBadgeContainer: {
        flexDirection: 'row',
    },
    sustainabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(90, 158, 148, 0.15)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    sustainabilityText: {
        fontSize: 12,
        color: '#22606e',
        fontWeight: '500',
        marginLeft: 4,
    },
    sendItemIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(90, 158, 148, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginLeft: 8,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    noItemsContainer: {
        padding: 40,
        alignItems: 'center',
    },
    noItemsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    noItemsSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default AIChatScreen; 