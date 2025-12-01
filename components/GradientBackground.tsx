import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../lib/design-system/tokens';

type GradientVariant = 'primary' | 'secondary' | 'student' | 'teacher' | 'admin';

interface GradientBackgroundProps {
    children: ReactNode;
    variant?: GradientVariant;
    customColors?: string[];
}

export default function GradientBackground({
    children,
    variant = 'primary',
    customColors
}: GradientBackgroundProps) {
    const getGradientColors = (): string[] => {
        if (customColors) return customColors;

        switch (variant) {
            case 'primary':
                return tokens.colors.primary.gradient;
            case 'secondary':
                return tokens.colors.accent.gradient;
            case 'student':
                return tokens.colors.roles.student.gradient;
            case 'teacher':
                return tokens.colors.roles.teacher.gradient;
            case 'admin':
                return tokens.colors.roles.admin.gradient;
            default:
                return tokens.colors.primary.gradient;
        }
    };

    return (
        <LinearGradient
            colors={getGradientColors()}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});
