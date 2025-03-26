import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

// Google Logo component with proper multi-color G logo
const GoogleLogo = () => (
    <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png' }}
        style={{
            width: 24,
            height: 24,
            marginRight: 16,
        }}
        resizeMode="contain"
    />
);

const SignUpScreen = () => {
    const navigation = useNavigation<SignUpScreenNavigationProp>();
    const { signUp } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await signUp(email, password, username);
            // The AppNavigator will handle navigation based on auth state
        } catch (error) {
            Alert.alert('Sign Up Failed', 'Please try again with different credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our sustainable community</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Choose a username"
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                            <View style={styles.socialButtonContent}>
                                <GoogleLogo />
                                <Text style={styles.socialButtonText}>Sign up with Google</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                            <View style={styles.socialButtonContent}>
                                <Ionicons name="logo-facebook" size={24} color="#FFFFFF" style={styles.socialIcon} />
                                <Text style={[styles.socialButtonText, styles.facebookButtonText]}>Sign up with Facebook</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                By signing up, you agree to our{' '}
                                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#2C3E50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    button: {
        backgroundColor: '#45B69C',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A0CEC3',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#7F8C8D',
        fontWeight: 'bold',
    },
    socialButton: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 30,
        padding: 14,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#d3d3d3',
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
    },
    socialButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    socialButtonText: {
        color: '#2C3E50',
        fontSize: 16,
        fontWeight: '500',
    },
    facebookButtonText: {
        color: '#FFFFFF',
    },
    termsContainer: {
        marginTop: 20,
    },
    termsText: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 20,
    },
    termsLink: {
        color: '#45B69C',
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        color: '#7F8C8D',
        marginRight: 5,
    },
    footerLink: {
        color: '#45B69C',
        fontWeight: 'bold',
    },
});

export default SignUpScreen; 