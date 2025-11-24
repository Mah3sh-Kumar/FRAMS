import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../lib/theme';

interface EmptyStateProps {
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    message?: string;
}

export default function EmptyState({ icon = 'inbox', title, message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon} size={64} color={colors.text.disabled} />
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
        padding: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    message: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});
