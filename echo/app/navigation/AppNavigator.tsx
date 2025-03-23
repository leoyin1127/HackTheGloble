import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Main App Screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ItemDetailScreen from '../screens/main/ItemDetailScreen';
import CartScreen from '../screens/main/CartScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CommunityScreen from '../screens/main/CommunityScreen';
import ChatScreen from '../screens/main/ChatScreen';
import SavedItemsScreen from '../screens/main/SavedItemsScreen';
import ChatListScreen from '../screens/main/ChatListScreen';
import AIChatScreen from '../screens/main/AIChatScreen';

// Test Components
import ImageTest from '../components/ImageTest';

// Define the types for our navigation parameters
export type AuthStackParamList = {
    Splash: undefined;
    Welcome: undefined;
    SignIn: undefined;
    SignUp: undefined;
    Onboarding: undefined;
};

export type MainStackParamList = {
    Home: undefined;
    SwipeHome: undefined;
    UserProfile: undefined;
    TabHome: {
        screen?: string;
        params?: {
            screen?: string;
            params?: any;
        };
    } | undefined;
    Search: {
        query?: string;
        category?: string;
        featured?: boolean;
        sortBy?: string;
    } | undefined;
    ItemDetail: { itemId: string };
    Cart: undefined;
    Checkout: undefined;
    Profile: undefined;
    Community: undefined;
    Chat: { sellerId: string; itemId?: string };
    Saved: undefined;
    ChatList: undefined;
    ImageTest: undefined;
    AIChat: undefined;
};

export type TabParamList = {
    Home: undefined;
    Discover: undefined;
    Messages: undefined;
    Profile: undefined;
};

// Create the navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom tab bar component for a more modern look
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const { colors, spacing, borderRadius, shadows } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.tabBarContainer,
                {
                    paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.md,
                }
            ]}
        >
            <BlurView
                intensity={80}
                style={[
                    styles.blurContainer,
                    {
                        borderRadius: borderRadius.xxl,
                        overflow: 'hidden',
                        backgroundColor: Platform.OS === 'android'
                            ? 'rgba(50,60,70,0.55)'
                            : 'rgba(50,60,70,0.65)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 20,
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,5)',
                    }
                ]}
            >
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel || options.title || route.name;
                    const isFocused = state.index === index;

                    const iconName = getIconName(route.name, isFocused);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const backgroundColor = isFocused
                        ? colors.primary.main
                        : 'transparent';

                    const iconColor = isFocused
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.7)';

                    // Check if this is the Messages tab
                    const isMessagesTab = route.name === 'Messages';

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            onPress={onPress}
                            style={[
                                styles.tabItem,
                                {
                                    backgroundColor,
                                    borderRadius: borderRadius.round,
                                    ...(isFocused ? {
                                        transform: [{ scale: 1.05 }],
                                        shadowColor: colors.primary.main,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.6,
                                        shadowRadius: 6,
                                        elevation: 5,
                                    } : {}),
                                }
                            ]}
                        >
                            {isMessagesTab ? (
                                <View style={{ position: 'relative', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name={iconName} size={24} color={iconColor} />
                                    <View style={[styles.aiBadge, {
                                        backgroundColor: colors.primary.main,
                                        borderColor: isFocused ? 'white' : 'rgba(255,255,255,0.7)'
                                    }]}>
                                        <Text style={[styles.aiBadgeText, { color: 'white' }]}>AI</Text>
                                    </View>
                                </View>
                            ) : (
                                <Ionicons name={iconName} size={24} color={iconColor} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
};

// Helper function to get icon names
const getIconName = (routeName: string, isFocused: boolean): any => {
    let iconName: string;

    if (routeName === 'Home') {
        iconName = isFocused ? 'home' : 'home-outline';
    } else if (routeName === 'Discover') {
        iconName = isFocused ? 'grid' : 'grid-outline';
    } else if (routeName === 'Messages') {
        iconName = isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
    } else if (routeName === 'Profile') {
        iconName = isFocused ? 'person' : 'person-outline';
    } else {
        iconName = 'square';
    }

    return iconName as any;
};

// Auth Navigator
const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Splash" component={SplashScreen} />
        <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
        <AuthStack.Screen name="SignIn" component={SignInScreen} />
        <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
);

// Home Stack Navigator (inside the Home tab)
const HomeStackNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="SwipeHome" component={HomeScreen} />
            <MainStack.Screen name="Saved" component={SavedItemsScreen} />
            <MainStack.Screen name="ImageTest" component={ImageTest} />
        </MainStack.Navigator>
    );
};

// Discover Stack Navigator
const DiscoverStackNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="Search" component={SearchScreen} />
            <MainStack.Screen name="Community" component={CommunityScreen} />
        </MainStack.Navigator>
    );
};

// Messages Stack Navigator
const MessagesStackNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="ChatList" component={ChatListScreen} />
        </MainStack.Navigator>
    );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="UserProfile" component={ProfileScreen} />
            <MainStack.Screen name="Cart" component={CartScreen} />
        </MainStack.Navigator>
    );
};

// Bottom Tab Navigator with fewer, more focused tabs
const TabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Discover" component={DiscoverStackNavigator} />
            <Tab.Screen name="Messages" component={MessagesStackNavigator} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} />
        </Tab.Navigator>
    );
};

// Main App Navigator
const MainNavigator = () => (
    <MainStack.Navigator>
        <MainStack.Screen
            name="TabHome"
            component={TabNavigator}
            options={{ headerShown: false }}
        />
        <MainStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ headerShown: false }} />
        <MainStack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
        <MainStack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <MainStack.Screen
            name="AIChat"
            component={AIChatScreen}
            options={{
                headerShown: false,
                presentation: 'transparentModal',
                detachPreviousScreen: true,
                cardStyle: {
                    backgroundColor: 'transparent',
                },
                cardOverlayEnabled: true,
                animationEnabled: true,
                gestureEnabled: true,
                gestureResponseDistance: 800,
                cardStyleInterpolator: ({ current: { progress } }) => ({
                    cardStyle: {
                        opacity: progress,
                    },
                    overlayStyle: {
                        opacity: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.8],
                        }),
                    },
                }),
            }}
        />
    </MainStack.Navigator>
);

// Root Navigator that switches between Auth and Main based on authentication status
const AppNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        // You could return a loading screen here
        return null;
    }

    return user ? <MainNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: -8,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 8,
    },
    blurContainer: {
        flexDirection: 'row',
        height: 64,
        paddingHorizontal: 20,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    tabItem: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    aiBadge: {
        position: 'absolute',
        top: 5,
        right: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        minWidth: 18,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        zIndex: 1,
    },
    aiBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 12,
    },
});

export default AppNavigator; 