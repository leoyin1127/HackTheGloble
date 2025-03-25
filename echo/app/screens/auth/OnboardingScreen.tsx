import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

// Available interest categories for users to select
const CATEGORIES = [
    'Casual Wear', 'Formal Wear', 'Outdoor Gear', 'Accessories',
    'Home Decor', 'Electronics', 'Books', 'Sport Equipment',
    'Crafts', 'Children Items', 'Vintage', 'Luxury'
];

const OnboardingScreen = () => {
    const navigation = useNavigation<OnboardingScreenNavigationProp>();
    const { updateProfile, user } = useAuth();

    const [location, setLocation] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleContinue = async () => {
        if (!location) {
            Alert.alert('Error', 'Please enter your location');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                location,
                shippingAddress,
                preferences: selectedCategories,
                hasCompletedOnboarding: true
            });
            // After successful profile update, the AppNavigator will redirect to the main app
        } catch (error) {
            Alert.alert('Error', 'Failed to save your preferences. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Let's Personalize Your Experience</Text>
                    <Text style={styles.subtitle}>
                        Help us customize your experience with a few details
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="City, Country"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your shipping address"
                        value={shippingAddress}
                        onChangeText={setShippingAddress}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What are you interested in?</Text>
                    <Text style={styles.sectionSubtitle}>Select all that apply</Text>

                    <View style={styles.categoriesContainer}>
                        {CATEGORIES.map(category => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryItem,
                                    selectedCategories.includes(category) && styles.selectedCategory
                                ]}
                                onPress={() => toggleCategory(category)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategories.includes(category) && styles.selectedCategoryText
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Saving...' : 'Continue to Browse'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipButton}>
                        <Text style={styles.skipButtonText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        lineHeight: 22,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2C3E50',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
        minHeight: 50,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    categoryItem: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 5,
    },
    selectedCategory: {
        backgroundColor: '#45B69C',
        borderColor: '#45B69C',
    },
    categoryText: {
        color: '#2C3E50',
        fontSize: 14,
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },
    footer: {
        marginTop: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#45B69C',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonDisabled: {
        backgroundColor: '#A0CEC3',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#7F8C8D',
        fontSize: 14,
    },
});

export default OnboardingScreen; 