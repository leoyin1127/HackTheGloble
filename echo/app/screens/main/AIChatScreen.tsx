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
    ActivityIndicator,
    Image,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { MainStackParamList } from '../../navigation/AppNavigator';

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
            text: "Hello! I'm your AI Fashion Stylist. How can I help you find sustainable fashion today?",
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

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

    // Navigate to regular chat list
    const navigateToChatList = () => {
        navigation.navigate('ChatList');
    };

    // Render individual message item
    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                {
                    backgroundColor: item.isUser ? colors.primary.main : colors.neutral.lightGray,
                    alignSelf: item.isUser ? 'flex-end' : 'flex-start',
                    borderBottomLeftRadius: item.isUser ? borderRadius.lg : 4,
                    borderBottomRightRadius: item.isUser ? 4 : borderRadius.lg,
                    ...shadows.sm,
                },
            ]}
        >
            <Text
                style={[
                    styles.messageText,
                    {
                        color: item.isUser ? colors.neutral.white : colors.neutral.charcoal,
                    },
                ]}
            >
                {item.text}
            </Text>
            <Text
                style={[
                    styles.timestamp,
                    {
                        color: item.isUser ? 'rgba(255,255,255,0.7)' : colors.neutral.mediumGray,
                    },
                ]}
            >
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.neutral.lightGray }]}>
                <View style={styles.headerLeft}>
                    <View style={styles.aiAvatarContainer}>
                        <LinearGradient
                            colors={[colors.primary.main, colors.primary.light]}
                            style={styles.aiAvatar}
                        >
                            <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                        </LinearGradient>
                        <View
                            style={[
                                styles.statusIndicator,
                                { backgroundColor: colors.semantic.success },
                            ]}
                        />
                    </View>
                    <View>
                        <View style={styles.aiNameContainer}>
                            <Text style={[styles.aiName, { color: colors.neutral.charcoal }]}>
                                AI Fashion Stylist
                            </Text>
                            <View style={[styles.aiBadge, { backgroundColor: colors.primary.main }]}>
                                <Text style={styles.aiBadgeText}>AI</Text>
                            </View>
                        </View>
                        <Text style={[styles.aiStatus, { color: colors.neutral.mediumGray }]}>
                            {isTyping ? 'Typing...' : 'Online'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.chatListButton,
                        { backgroundColor: colors.primary.light, ...shadows.sm },
                    ]}
                    onPress={navigateToChatList}
                >
                    <Ionicons name="people" size={18} color={colors.primary.main} />
                    <Text style={[styles.chatListButtonText, { color: colors.primary.main }]}>
                        Chat List
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.messagesContainer,
                    { paddingHorizontal: spacing.lg },
                ]}
                showsVerticalScrollIndicator={false}
            />

            {/* Typing Indicator */}
            {isTyping && (
                <View
                    style={[
                        styles.typingIndicator,
                        {
                            backgroundColor: colors.neutral.lightGray,
                            marginHorizontal: spacing.lg,
                            marginBottom: spacing.sm,
                            ...shadows.sm,
                        },
                    ]}
                >
                    <ActivityIndicator size="small" color={colors.primary.main} />
                    <Text style={[styles.typingText, { color: colors.neutral.darkGray }]}>
                        AI Stylist is typing...
                    </Text>
                </View>
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.neutral.white,
                        borderTopColor: colors.neutral.lightGray,
                        paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.md,
                    },
                ]}
            >
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.neutral.offWhite,
                            color: colors.neutral.charcoal,
                            borderColor: colors.neutral.lightGray,
                        },
                    ]}
                    placeholder="Ask for fashion advice..."
                    placeholderTextColor={colors.neutral.mediumGray}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: colors.primary.main,
                            opacity: inputText.trim() === '' ? 0.6 : 1,
                        },
                    ]}
                    onPress={handleSend}
                    disabled={inputText.trim() === ''}
                >
                    <Ionicons name="send" size={20} color={colors.neutral.white} />
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    aiAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: 'white',
    },
    aiNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiName: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 6,
    },
    aiBadge: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 2,
    },
    aiBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    aiStatus: {
        fontSize: 12,
    },
    chatListButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chatListButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    messagesContainer: {
        flexGrow: 1,
        paddingTop: 16,
        paddingBottom: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        marginBottom: 10,
    },
    typingText: {
        fontSize: 14,
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        borderWidth: 1,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AIChatScreen; 