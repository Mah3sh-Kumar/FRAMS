import React, { ReactNode, useRef, useEffect } from 'react';
import { StyleSheet, Animated, Pressable, View } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { shadows } from '../lib/theme';

interface AnimatedCardProps {
    children: ReactNode;
    onPress?: () => void;
    style?: any;
    glassmorphism?: boolean;
}

export default function AnimatedCard({ children, onPress, style, glassmorphism = false }: AnimatedCardProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            friction: 3,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
        }).start();
    };

    const content = (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <PaperCard
                style={[
                    styles.card,
                    glassmorphism && styles.glassmorphism,
                    style
                ]}
            >
                {children}
            </PaperCard>
        </Animated.View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
            >
                {content}
            </Pressable>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    pressable: {
        marginBottom: 12,
    },
    card: {
        ...shadows.md,
        backgroundColor: '#ffffff',
    },
    glassmorphism: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
});
