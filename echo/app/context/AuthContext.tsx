import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    username: string;
    email: string;
    location?: string;
    shippingAddress?: string;
    preferences?: string[];
    hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored authentication
        const loadStoredAuth = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('@user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load authentication', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // This would be replaced with actual Firebase authentication
            // For demo purposes, we're just simulating a successful login
            const mockUser: User = {
                id: '123456',
                username: 'demo_user',
                email: email,
                location: 'Toronto, Canada',
                hasCompletedOnboarding: false,
            };

            await AsyncStorage.setItem('@user', JSON.stringify(mockUser));
            setUser(mockUser);
        } catch (error) {
            console.error('Sign in failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string, username: string) => {
        setIsLoading(true);
        try {
            // This would be replaced with actual Firebase authentication registration
            const mockUser: User = {
                id: '123456',
                username: username,
                email: email,
                hasCompletedOnboarding: false,
            };

            await AsyncStorage.setItem('@user', JSON.stringify(mockUser));
            setUser(mockUser);
        } catch (error) {
            console.error('Sign up failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('@user');
            setUser(null);
        } catch (error) {
            console.error('Sign out failed', error);
            throw error;
        }
    };

    const updateProfile = async (userData: Partial<User>) => {
        try {
            if (!user) throw new Error('No user logged in');

            const updatedUser = { ...user, ...userData };
            await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Profile update failed', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}; 