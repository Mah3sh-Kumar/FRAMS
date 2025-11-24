import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../lib/theme';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export default function SkeletonLoader({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style
}: SkeletonLoaderProps) {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function SkeletonCard() {
    return (
        <View style={styles.card}>
            <SkeletonLoader height={24} width="60%" style={styles.title} />
            <SkeletonLoader height={16} width="40%" style={styles.subtitle} />
            <SkeletonLoader height={16} width="90%" style={styles.line} />
            <SkeletonLoader height={16} width="70%" style={styles.line} />
        </View>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <View>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: colors.text.disabled,
    },
    card: {
        backgroundColor: colors.background.paper,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 8,
    },
    title: {
        marginBottom: spacing.sm,
    },
    subtitle: {
        marginBottom: spacing.md,
    },
    line: {
        marginBottom: spacing.sm,
    },
});
