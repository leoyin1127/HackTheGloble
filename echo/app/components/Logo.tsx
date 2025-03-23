import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Try to import SVG if available
let LogoSvg: React.ComponentType<any> | null = null;
try {
    // Dynamic import to prevent errors if SVG support is not configured
    LogoSvg = require('../../assets/logo.svg').default;
} catch (error) {
    console.log('SVG import failed, using PNG fallback');
}

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
}

const Logo = ({ size = 'medium', showText = true }: LogoProps) => {
    const { colors, typography } = useTheme();

    const getSize = () => {
        switch (size) {
            case 'small':
                return 32;
            case 'medium':
                return 48;
            case 'large':
                return 80;
            default:
                return 48;
        }
    };

    const logoSize = getSize();

    return (
        <View style={styles.container}>
            {LogoSvg ? (
                // Use SVG if available
                <LogoSvg
                    width={logoSize}
                    height={logoSize}
                    style={{
                        borderRadius: logoSize
                    }}
                />
            ) : (
                // Fallback to PNG
                <Image
                    source={require('../../assets/logo.png')}
                    style={{
                        width: logoSize,
                        height: logoSize,
                        borderRadius: logoSize / 2
                    }}
                    resizeMode="contain"
                />
            )}

            {/* {showText && (
                <Text style={[
                    styles.logoText,
                    {
                        color: colors.primary.dark,
                        fontSize: size === 'large' ? typography.fontSize.xl : typography.fontSize.lg,
                        marginLeft: size === 'small' ? 4 : 8
                    }
                ]}>
                    <Text style={{ fontWeight: 'bold' }}>Eco</Text>
                    <Text style={{ fontWeight: '400' }}>Swap</Text>
                </Text>
            )} */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontWeight: '600',
    }
});

export default Logo; 