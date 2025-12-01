import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Card from '../../components/design-system/primitives/Card';
import { Stack } from '../../components/design-system/layout';
import GradientBackground from '../../components/GradientBackground';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherDashboard() {
    const navigation = useNavigation();
    const { tokens, getTextColor } = useTheme();

    const features = [
        {
            title: 'Manage Attendance',
            description: 'Mark student attendance',
            icon: 'checkmark-circle-outline' as const,
            color: tokens.colors.success.main,
            route: 'AttendanceManager',
        },
        {
            title: 'Manage Assignments',
            description: 'Create and review assignments',
            icon: 'create-outline' as const,
            color: tokens.colors.info.main,
            route: 'AssignmentManager',
        },
        {
            title: 'Review Marks',
            description: 'Grade student submissions',
            icon: 'stats-chart-outline' as const,
            color: tokens.colors.warning.main,
            route: 'MarksReviewManager',
        },
    ];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            padding: tokens.spacing.lg,
            paddingTop: tokens.spacing.xl,
        },
        title: {
            fontSize: tokens.typography.h1.fontSize,
            fontWeight: tokens.typography.h1.fontWeight,
            color: tokens.colors.neutral.white,
            marginBottom: tokens.spacing.xs,
        },
        subtitle: {
            fontSize: tokens.typography.body.fontSize,
            color: 'rgba(255, 255, 255, 0.9)',
        },
        featureCard: {
            marginBottom: tokens.spacing.md,
        },
        cardContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: tokens.spacing.md,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: tokens.borders.radius.medium,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: tokens.spacing.md,
        },
        textContainer: {
            flex: 1,
        },
        featureTitle: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.xs / 2,
        },
        featureDescription: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray600,
        },
        statsRow: {
            flexDirection: 'row',
            gap: tokens.spacing.md,
        },
        statCard: {
            flex: 1,
        },
        statContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: tokens.spacing.md,
            gap: tokens.spacing.sm,
        },
        statIconContainer: {
            width: 40,
            height: 40,
            borderRadius: tokens.borders.radius.medium,
            justifyContent: 'center',
            alignItems: 'center',
        },
        statValue: {
            fontSize: tokens.typography.h2.fontSize,
            fontWeight: tokens.typography.h2.fontWeight,
            color: getTextColor(),
        },
        statLabel: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray600,
        },
    });

    return (
        <GradientBackground variant="teacher">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Teacher Dashboard</Text>
                    <Text style={styles.subtitle}>Manage your classes and students</Text>
                </View>

                <Stack spacing="md" style={{ padding: tokens.spacing.md }}>
                    {features.map((feature, index) => (
                        <Card 
                            key={index}
                            variant="glassmorphic" 
                            style={styles.featureCard}
                            onPress={() => navigation.navigate(feature.route as never)}
                        >
                            <View style={styles.cardContent}>
                                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                                    <Ionicons name={feature.icon} size={24} color={feature.color} />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={tokens.colors.neutral.gray400} />
                            </View>
                        </Card>
                    ))}

                    <View style={styles.statsRow}>
                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.primary.main}20` }]}>
                                    <Ionicons name="people" size={24} color={tokens.colors.primary.main} />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>--</Text>
                                    <Text style={styles.statLabel}>Students</Text>
                                </View>
                            </View>
                        </Card>

                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.accent.main}20` }]}>
                                    <Ionicons name="book" size={24} color={tokens.colors.accent.main} />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>--</Text>
                                    <Text style={styles.statLabel}>Classes</Text>
                                </View>
                            </View>
                        </Card>
                    </View>

                    <Card variant="glassmorphic">
                        <View style={styles.statContent}>
                            <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.warning.main}20` }]}>
                                <Ionicons name="time" size={24} color={tokens.colors.warning.main} />
                            </View>
                            <View>
                                <Text style={styles.statValue}>--</Text>
                                <Text style={styles.statLabel}>Pending Reviews</Text>
                            </View>
                        </View>
                    </Card>
                </Stack>
            </ScrollView>
        </GradientBackground>
    );
}


