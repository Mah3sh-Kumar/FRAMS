import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Paragraph, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AnimatedCard from '../../components/AnimatedCard';
import GradientBackground from '../../components/GradientBackground';
import { colors, spacing, typography } from '../../lib/theme';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentAttendanceStats, fetchStudentPendingAssignments } from '../../lib/database';
import { useState, useEffect } from 'react';

export default function StudentDashboard() {
    const navigation = useNavigation();
    const { session } = useAuth();
    const [stats, setStats] = useState({ attendanceRate: 0, pendingAssignments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        if (!session?.user?.id) return;

        try {
            const [attendanceRes, assignmentsRes] = await Promise.all([
                fetchStudentAttendanceStats(session.user.id),
                fetchStudentPendingAssignments(session.user.id)
            ]);

            setStats({
                attendanceRate: attendanceRes.data?.rate || 0,
                pendingAssignments: assignmentsRes.data || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            title: 'Attendance',
            description: 'View your attendance record',
            icon: 'clipboard-check-outline',
            color: colors.info.main,
            route: 'Attendance',
        },
        {
            title: 'Assignments',
            description: 'Check pending assignments',
            icon: 'book-open-variant',
            color: colors.warning.main,
            route: 'Assignments',
        },
    ];

    return (
        <GradientBackground variant="student">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Student Dashboard</Title>
                    <Paragraph style={styles.subtitle}>Welcome back! Here's your overview</Paragraph>
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
                            <IconButton icon="calendar-check" size={28} iconColor={colors.success.main} />
                            <View>
                                <Title style={styles.statValue}>
                                    {loading ? '...' : `${stats.attendanceRate}%`}
                                </Title>
                                <Paragraph style={styles.statLabel}>Attendance Rate</Paragraph>
                            </View>
                        </Card.Content>
                    </AnimatedCard>

                    <AnimatedCard glassmorphism style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <IconButton icon="file-document-outline" size={28} iconColor={colors.info.main} />
                            <View>
                                <Title style={styles.statValue}>
                                    {loading ? '...' : stats.pendingAssignments}
                                </Title>
                                <Paragraph style={styles.statLabel}>Pending Tasks</Paragraph>
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
        padding: spacing.md,
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
