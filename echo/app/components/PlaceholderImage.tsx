import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type PlaceholderType = 'product' | 'avatar' | 'banner' | 'category';

interface PlaceholderImageProps {
    type?: PlaceholderType;
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    containerStyle?: ViewStyle;
    imageStyle?: ImageStyle;
    text?: string;
}

const PLACEHOLDER_URLS = {
    // Using placeholder.com for dynamic placeholders with custom sizes
    product: (w: number, h: number) => `https://via.placeholder.com/${w}x${h}/92C8BE/FFFFFF?text=Product`,
    avatar: (w: number, h: number) => `https://via.placeholder.com/${w}x${h}/C9E4DF/FFFFFF?text=User`,
    banner: (w: number, h: number) => `https://via.placeholder.com/${w}x${h}/2B2D33/FFFFFF?text=Banner`,
    category: (w: number, h: number) => `https://via.placeholder.com/${w}x${h}/AFA59E/FFFFFF?text=Category`,
};

// Icons for local placeholders
const PLACEHOLDER_ICONS: Record<PlaceholderType, typeof Ionicons.defaultProps.name> = {
    product: 'cube-outline',
    avatar: 'person-outline',
    banner: 'image-outline',
    category: 'grid-outline',
};

const PlaceholderImage = ({
    type = 'product',
    width = 100,
    height = 100,
    borderRadius,
    containerStyle,
    imageStyle,
    text,
}: PlaceholderImageProps) => {
    const { colors, borderRadius: themeRadius } = useTheme();

    // Convert dimensions to numbers for URL construction
    const w = typeof width === 'string' ? parseInt(width) : width;
    const h = typeof height === 'string' ? parseInt(height) : height;

    // Calculate final border radius
    const finalBorderRadius = borderRadius !== undefined
        ? borderRadius
        : themeRadius.md;

    // Get background color based on type
    const getBackgroundColor = () => {
        switch (type) {
            case 'product':
                return colors.primary.main;
            case 'avatar':
                return colors.primary.light;
            case 'banner':
                return colors.accent.dark;
            case 'category':
                return colors.accent.beige;
            default:
                return colors.primary.main;
        }
    };

    const placeholderUrl = PLACEHOLDER_URLS[type](w, h);
    const iconName = PLACEHOLDER_ICONS[type];

    // Convert width/height to appropriate format for styling
    const styleWidth = typeof width === 'number' ? width : width;
    const styleHeight = typeof height === 'number' ? height : height;

    return (
        <View
            style={[
                styles.container,
                { borderRadius: finalBorderRadius },
                containerStyle,
                // Add width and height as separate style object to avoid type errors
                { width: styleWidth, height: styleHeight } as ViewStyle,
            ]}
        >
            <Image
                source={{ uri: placeholderUrl }}
                style={[
                    styles.image,
                    { borderRadius: finalBorderRadius },
                    imageStyle
                ]}
                // Fallback to local placeholder if image fails
                onError={({ nativeEvent: { error } }) => {
                    console.log('Image load error:', error);
                }}
            />

            {/* Overlay with icon as fallback */}
            <View style={[
                styles.localPlaceholder,
                {
                    backgroundColor: getBackgroundColor(),
                    borderRadius: finalBorderRadius,
                },
                // Add width and height as separate style object to avoid type errors
                { width: styleWidth, height: styleHeight } as ViewStyle,
            ]}>
                <Ionicons name={iconName} size={w > 100 ? 48 : 24} color="white" />
                {text && <Text style={styles.text}>{text}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    localPlaceholder: {
        position: 'absolute',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        opacity: 0.3,
    },
    text: {
        marginTop: 4,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default PlaceholderImage; 