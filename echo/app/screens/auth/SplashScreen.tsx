import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import ManualLogo from '../../components/ManualLogo';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Using Splash as the key now that it's in AuthStackParamList
type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

const SplashScreen = () => {
    const navigation = useNavigation<SplashScreenNavigationProp>();
    const { colors } = useTheme();

    // Animation values
    const fadeIn = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        // Start animation
        Animated.parallel([
            Animated.timing(fadeIn, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        // Navigate to Welcome screen after a delay
        const timer = setTimeout(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.accent.dark, colors.primary.main]}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeIn,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <ManualLogo size={240} />
            </Animated.View>

            <View style={{ position: 'absolute', opacity: 0 }}>
                <Ionicons name="heart" size={1} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SplashScreen; 