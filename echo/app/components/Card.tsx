import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    ImageSourcePropType,
    Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import PlaceholderImage from './PlaceholderImage';

const { width } = Dimensions.get('window');

interface CardProps {
    image?: ImageSourcePropType;
    title: string;
    subtitle?: string;
    price: string;
    rating?: number;
    sustainabilityScore?: number;
    style?: ViewStyle;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
}

export const Card = ({
    image,
    title,
    subtitle,
    price,
    rating,
    sustainabilityScore,
    style,
    onPress,
    size = 'medium',
}: CardProps) => {
    const { colors, spacing, borderRadius, shadows, typography } = useTheme();

    const getCardWidth = () => {
        switch (size) {
            case 'small':
                return width * 0.4;
            case 'medium':
                return width * 0.45;
            case 'large':
                return width * 0.9;
            default:
                return width * 0.45;
        }
    };

    const getImageHeight = () => {
        switch (size) {
            case 'small':
                return width * 0.4;
            case 'medium':
                return width * 0.45;
            case 'large':
                return width * 0.5;
            default:
                return width * 0.45;
        }
    };

    // Calculate sustainability indicator color
    const getSustainabilityColor = () => {
        if (!sustainabilityScore) return colors.neutral.mediumGray;

        if (sustainabilityScore >= 75) {
            return colors.primary.main;
        } else if (sustainabilityScore >= 50) {
            return colors.accent.beige;
        } else {
            return colors.semantic.error;
        }
    };

    const cardWidth = getCardWidth();
    const imageHeight = getImageHeight();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    width: cardWidth,
                    backgroundColor: colors.neutral.white,
                    borderRadius: borderRadius.md,
                    ...shadows.md,
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                {image ? (
                    // Use provided image if available
                    <PlaceholderImage
                        type="product"
                        width={cardWidth}
                        height={imageHeight}
                        borderRadius={0}
                        containerStyle={{
                            borderTopLeftRadius: borderRadius.md,
                            borderTopRightRadius: borderRadius.md,
                        }}
                        imageStyle={{
                            borderTopLeftRadius: borderRadius.md,
                            borderTopRightRadius: borderRadius.md,
                        }}
                        text={title}
                    />
                ) : (
                    // Use placeholder if no image provided
                    <PlaceholderImage
                        type="product"
                        width={cardWidth}
                        height={imageHeight}
                        borderRadius={0}
                        containerStyle={{
                            borderTopLeftRadius: borderRadius.md,
                            borderTopRightRadius: borderRadius.md,
                        }}
                        imageStyle={{
                            borderTopLeftRadius: borderRadius.md,
                            borderTopRightRadius: borderRadius.md,
                        }}
                        text={title}
                    />
                )}

                {sustainabilityScore && (
                    <View
                        style={[
                            styles.sustainabilityBadge,
                            { backgroundColor: getSustainabilityColor() }
                        ]}
                    >
                        <Text style={styles.sustainabilityText}>{sustainabilityScore}</Text>
                    </View>
                )}
            </View>

            <View style={[styles.contentContainer, { padding: spacing.sm }]}>
                <Text
                    style={[styles.title, { fontSize: typography.fontSize.md, color: colors.neutral.charcoal }]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                {subtitle && (
                    <Text
                        style={[styles.subtitle, { fontSize: typography.fontSize.xs, color: colors.neutral.darkGray }]}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={[styles.price, { color: colors.primary.dark, fontSize: typography.fontSize.md }]}>
                        {price}
                    </Text>

                    {rating && (
                        <View style={styles.rating}>
                            <Text style={{ color: colors.accent.beige, fontSize: typography.fontSize.sm }}>
                                ★ {rating.toFixed(1)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        margin: 8,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
    },
    sustainabilityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sustainabilityText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    price: {
        fontWeight: 'bold',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
}); 