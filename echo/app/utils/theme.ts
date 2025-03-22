import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Modern color palette based on the provided colors
const palette = {
    // Primary colors
    primary: {
        light: '#C9E4DF', // Light mint/pale teal
        main: '#92C8BE', // Teal/mint
        dark: '#6AA79D', // Darker version of the teal/mint
    },
    // Neutrals
    neutral: {
        white: '#FFFFFF',
        offWhite: '#E8F2F2', // Very pale mint/almost white
        lightGray: '#C9E4DF', // Light mint/pale teal
        mediumGray: '#AFA59E', // Light beige/taupe
        darkGray: '#565961', // Lighter version of dark gray
        charcoal: '#2B2D33', // Dark gray/almost black
        black: '#1A1C20', // Darker version of the dark gray
    },
    // Accent colors
    accent: {
        teal: '#92C8BE', // Teal/mint
        beige: '#AFA59E', // Light beige/taupe
        mint: '#C9E4DF', // Light mint/pale teal
        dark: '#2B2D33', // Dark gray/almost black
    },
    // Gradient pairs for modern UI
    gradients: {
        primary: ['#92C8BE', '#C9E4DF'],
        secondary: ['#AFA59E', '#E8F2F2'],
        accent: ['#2B2D33', '#565961'],
        light: ['#C9E4DF', '#E8F2F2'],
    },
    // Semantic colors
    semantic: {
        success: '#92C8BE',
        error: '#E07A73',
        warning: '#DDB681',
        info: '#92C8BE',
    },
};

// More modern typography system with enhanced font weights
const typography = {
    fontFamily: {
        thin: 'System',
        light: 'System',
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
        bold: 'System',
        black: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        display1: 32,
        display2: 40,
        hero: 48,
    },
    lineHeight: {
        xs: 18,
        sm: 21,
        md: 24,
        lg: 27,
        xl: 30,
        xxl: 36,
        display1: 40,
        display2: 50,
        hero: 58,
    },
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
    },
};

// More nuanced spacing scale
const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    huge: 80,
};

// More dynamic border radius system
const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
};

// Modern, elevated shadow system
const shadows = {
    xs: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    sm: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    xl: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 16,
    },
};

// Animation timing values
const animation = {
    fast: 200,
    normal: 300,
    slow: 500,
};

// Screen dimensions
const screen = {
    width,
    height,
    isSmallDevice: width < 375,
};

export const theme = {
    colors: palette,
    typography,
    spacing,
    borderRadius,
    shadows,
    screen,
    animation,
};

export type Theme = typeof theme; 