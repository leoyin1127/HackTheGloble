import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PlaceholderImage from './PlaceholderImage';

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
            {/* <PlaceholderImage
                type="category" // Using category type for the logo
                width={logoSize}
                height={logoSize}
                borderRadius={logoSize / 2}
                text="Eco"
                containerStyle={{
                    backgroundColor: colors.primary.main,
                }}
            /> */}

            {showText && (
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
            )}
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