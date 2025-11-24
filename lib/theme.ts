import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Modern color palette
export const colors = {
    // Primary colors with gradients
    primary: {
        main: '#6366f1', // Indigo
        light: '#818cf8',
        dark: '#4f46e5',
        gradient: ['#6366f1', '#8b5cf6'], // Indigo to Purple
    },
    secondary: {
        main: '#ec4899', // Pink
        light: '#f472b6',
        dark: '#db2777',
        gradient: ['#ec4899', '#f43f5e'], // Pink to Rose
    },
    success: {
        main: '#10b981', // Green
        light: '#34d399',
        dark: '#059669',
    },
    warning: {
        main: '#f59e0b', // Amber
        light: '#fbbf24',
        dark: '#d97706',
    },
    error: {
        main: '#ef4444', // Red
        light: '#f87171',
        dark: '#dc2626',
    },
    info: {
        main: '#3b82f6', // Blue
        light: '#60a5fa',
        dark: '#2563eb',
    },
    // Neutral colors
    background: {
        default: '#f8fafc',
        paper: '#ffffff',
        dark: '#0f172a',
    },
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        disabled: '#cbd5e1',
        inverse: '#ffffff',
    },
    // Role-specific gradients
    student: {
        gradient: ['#3b82f6', '#1d4ed8'], // Blue gradient
        accent: '#3b82f6',
    },
    teacher: {
        gradient: ['#10b981', '#047857'], // Green gradient
        accent: '#10b981',
    },
    admin: {
        gradient: ['#8b5cf6', '#6d28d9'], // Purple gradient
        accent: '#8b5cf6',
    },
};

// Typography
export const typography = {
    fontFamily: {
        regular: 'System', // Will use system font, can be replaced with custom fonts
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border radius
export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Shadows
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
};

// Animation timing
export const animation = {
    duration: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
    easing: {
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
    },
};

// React Native Paper theme
export const paperTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary.main,
        secondary: colors.secondary.main,
        error: colors.error.main,
        background: colors.background.default,
        surface: colors.background.paper,
        text: colors.text.primary,
    },
    roundness: borderRadius.md,
};

// Export complete theme
export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    paperTheme,
};

export default theme;
