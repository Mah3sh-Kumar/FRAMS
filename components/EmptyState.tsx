import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { tokens } from '../lib/design-system/tokens';

interface EmptyStateProps {
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    message?: string;
}

export default function EmptyState({ icon = 'inbox', title, message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon} size={64} color={tokens.colors.neutral.gray400} />
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacing.xl,
    },
    title: {
        fontSize: tokens.typography.h2.fontSize,
        fontWeight: tokens.typography.h2.fontWeight,
        lineHeight: tokens.typography.h2.lineHeight,
        color: tokens.colors.theme.light.text,
        marginTop: tokens.spacing.md,
        textAlign: 'center',
    },
    message: {
        fontSize: tokens.typography.body.fontSize,
        lineHeight: tokens.typography.body.lineHeight,
        color: tokens.colors.theme.light.textSecondary,
        marginTop: tokens.spacing.sm,
        textAlign: 'center',
    },
});
