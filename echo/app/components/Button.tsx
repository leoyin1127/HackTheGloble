import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = ({
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
    disabled,
    ...rest
}: ButtonProps) => {
    const { colors, spacing, borderRadius, typography } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return colors.neutral.lightGray;

        switch (variant) {
            case 'primary':
                return colors.primary.main;
            case 'secondary':
                return colors.accent.beige;
            case 'outline':
            case 'ghost':
                return 'transparent';
            default:
                return colors.primary.main;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.neutral.mediumGray;

        switch (variant) {
            case 'primary':
            case 'secondary':
                return colors.neutral.white;
            case 'outline':
                return colors.primary.main;
            case 'ghost':
                return colors.primary.main;
            default:
                return colors.neutral.white;
        }
    };

    const getBorderColor = () => {
        if (disabled) return colors.neutral.lightGray;

        switch (variant) {
            case 'outline':
                return colors.primary.main;
            default:
                return 'transparent';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md };
            case 'medium':
                return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
            case 'large':
                return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
            default:
                return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return typography.fontSize.sm;
            case 'medium':
                return typography.fontSize.md;
            case 'large':
                return typography.fontSize.lg;
            default:
                return typography.fontSize.md;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderRadius: borderRadius.md,
                    width: fullWidth ? '100%' : 'auto',
                    ...getPadding(),
                },
                style,
            ]}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {leftIcon && <>{leftIcon}</>}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontSize: getFontSize(),
                                marginLeft: leftIcon ? spacing.sm : 0,
                                marginRight: rightIcon ? spacing.sm : 0,
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {rightIcon && <>{rightIcon}</>}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
}); 