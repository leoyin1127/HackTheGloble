import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import ManualLogo from '../../components/ManualLogo';
import { AuthStackParamList } from '../../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius } = useTheme();

    // Animation values
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);
    const logoAnim = new Animated.Value(0.8);

    useEffect(() => {
        // Sequential animations for a smooth reveal
        Animated.sequence([
            Animated.timing(logoAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Gradient */}
            <LinearGradient
                colors={[colors.accent.dark, colors.primary.dark, colors.primary.main]}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Translucent overlay patterns */}
            <View style={styles.patternOverlay} />

            {/* Logo and Branding */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        transform: [
                            { scale: logoAnim }
                        ]
                    }
                ]}
            >
                <ManualLogo size={300} />
                <Text style={[styles.appName, { color: colors.neutral.white, fontSize: typography.fontSize.hero }]}>
                    Echo
                </Text>
            </Animated.View>

            {/* Content Area */}
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <Text style={[styles.tagline, { color: colors.neutral.white, fontSize: typography.fontSize.xl }]}>
                    Sustainable Shopping.
                </Text>
                <Text style={[styles.subTagline, { color: colors.neutral.offWhite, fontSize: typography.fontSize.md }]}>
                    Buy, sell, and trade pre-loved items.
                    Save the planet, one item at a time.
                </Text>

                {/* Action Buttons */}
                <View style={[styles.buttonsContainer, { marginTop: spacing.xxl }]}>
                    <Button
                        title="Sign In"
                        variant="primary"
                        size="large"
                        style={{
                            backgroundColor: colors.neutral.white,
                            marginBottom: spacing.md,
                        }}
                        textStyle={{ color: colors.primary.dark }}
                        fullWidth
                        onPress={() => navigation.navigate('SignIn')}
                    />

                    <Button
                        title="Create Account"
                        variant="outline"
                        size="large"
                        style={{
                            borderColor: colors.neutral.white,
                            borderWidth: 1,
                        }}
                        textStyle={{ color: colors.neutral.white }}
                        fullWidth
                        onPress={() => navigation.navigate('SignUp')}
                    />

                    <TouchableOpacity
                        style={[styles.skipButton, { marginTop: spacing.xl }]}
                        onPress={() => navigation.navigate('Onboarding')}
                    >
                        <Text style={[styles.skipText, { color: colors.neutral.white, fontSize: typography.fontSize.sm }]}>
                            Skip for now
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    patternOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundColor: 'transparent',
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: height * 0.15,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    appName: {
        fontWeight: 'bold',
    },
    contentContainer: {
        width: width * 0.85,
        alignItems: 'center',
        paddingBottom: height * 0.1,
    },
    tagline: {
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
    },
    subTagline: {
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 22,
    },
    buttonsContainer: {
        width: '100%',
    },
    skipButton: {
        alignSelf: 'center',
        padding: 8,
    },
    skipText: {
        textDecorationLine: 'underline',
        opacity: 0.7,
    },
});

export default WelcomeScreen; 