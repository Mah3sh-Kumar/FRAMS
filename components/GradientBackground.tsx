import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../lib/theme';

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
                return colors.primary.gradient;
            case 'secondary':
                return colors.secondary.gradient;
            case 'student':
                return colors.student.gradient;
            case 'teacher':
                return colors.teacher.gradient;
            case 'admin':
                return colors.admin.gradient;
            default:
                return colors.primary.gradient;
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
