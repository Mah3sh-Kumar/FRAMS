import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Paragraph, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AnimatedCard from '../../components/AnimatedCard';
import GradientBackground from '../../components/GradientBackground';
import { colors, spacing, typography } from '../../lib/theme';

export default function AdminDashboard() {
    const navigation = useNavigation();

    const features = [
        {
            title: 'User Management',
            description: 'Manage users and roles',
            icon: 'account-cog',
            color: colors.primary.main,
            route: 'UserManagement',
        },
        {
            title: 'View Reports',
            description: 'Analytics and insights',
            icon: 'chart-line',
            color: colors.success.main,
            route: 'Reports',
        },
    ];

    return (
        <GradientBackground variant="admin">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Admin Dashboard</Title>
                    <Paragraph style={styles.subtitle}>System overview and management</Paragraph>
                </View>

                <View style={styles.cardsContainer}>
                    {features.map((feature, index) => (
                        <AnimatedCard
                            key={index}
                            onPress={() => navigation.navigate(feature.route as never)}
                            style={styles.featureCard}
                            glassmorphism
                        >
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.iconContainer}>
                                    <IconButton
                                        icon={feature.icon}
                                        size={32}
                                        iconColor={feature.color}
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Title style={styles.featureTitle}>{feature.title}</Title>
                                    <Paragraph style={styles.featureDescription}>
                                        {feature.description}
                                    </Paragraph>
                                </View>
                                <IconButton
                                    icon="chevron-right"
                                    size={24}
                                    iconColor={colors.text.secondary}
                                />
                            </Card.Content>
                        </AnimatedCard>
                    ))}
                </View>

                {/* Quick Stats Section */}
                <View style={styles.statsContainer}>
                    <AnimatedCard glassmorphism style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <IconButton icon="account-multiple" size={28} iconColor={colors.info.main} />
                            <View>
                                <Title style={styles.statValue}>--</Title>
                                <Paragraph style={styles.statLabel}>Total Users</Paragraph>
                            </View>
                        </Card.Content>
                    </AnimatedCard>

                    <AnimatedCard glassmorphism style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <IconButton icon="account-tie" size={28} iconColor={colors.success.main} />
                            <View>
                                <Title style={styles.statValue}>--</Title>
                                <Paragraph style={styles.statLabel}>Teachers</Paragraph>
                            </View>
                        </Card.Content>
                    </AnimatedCard>
                </View>

                <View style={styles.statsContainer}>
                    <AnimatedCard glassmorphism style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <IconButton icon="school" size={28} iconColor={colors.primary.main} />
                            <View>
                                <Title style={styles.statValue}>--</Title>
                                <Paragraph style={styles.statLabel}>Students</Paragraph>
                            </View>
                        </Card.Content>
                    </AnimatedCard>

                    <AnimatedCard glassmorphism style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <IconButton icon="book-multiple" size={28} iconColor={colors.warning.main} />
                            <View>
                                <Title style={styles.statValue}>--</Title>
                                <Paragraph style={styles.statLabel}>Classes</Paragraph>
                            </View>
                        </Card.Content>
                    </AnimatedCard>
                </View>
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    cardsContainer: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    featureCard: {
        marginBottom: spacing.sm,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    textContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    featureDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
    },
    statContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
});
