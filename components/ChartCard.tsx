import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { colors, spacing, shadows } from '../lib/theme';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
    return (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.title}>{title}</Title>
                <View style={styles.chartContainer}>
                    {children}
                </View>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
        backgroundColor: colors.background.paper,
        ...shadows.md,
    },
    title: {
        marginBottom: spacing.md,
    },
    chartContainer: {
        alignItems: 'center',
    },
});
