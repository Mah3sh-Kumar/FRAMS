import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentAttendanceStats, fetchStudentPendingAssignments } from '../../lib/database';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Card from '../../components/design-system/primitives/Card';
import { Stack, Row } from '../../components/design-system/layout';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import GradientBackground from '../../components/GradientBackground';
import { Ionicons } from '@expo/vector-icons';

export default function StudentDashboard() {
    const navigation = useNavigation();
    const { session } = useAuth();
    const { tokens, getTextColor, getSurfaceColor, getRoleColor } = useTheme();
    const [stats, setStats] = useState({ attendanceRate: 0, pendingAssignments: 0 });
    const [loading, setLoading] = useState(true);
    const roleColor = getRoleColor();

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
            icon: 'calendar-outline' as const,
            color: tokens.colors.info.main,
            route: 'Attendance',
        },
        {
            title: 'Assignments',
            description: 'Check pending assignments',
            icon: 'book-outline' as const,
            color: tokens.colors.warning.main,
            route: 'Assignments',
        },
    ];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
            color: tokens.colors.neutral.white,
            opacity: 0.9,
        },
        featureCard: {
            marginBottom: 0,
        },
        cardContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: tokens.spacing.md,
        },
        iconContainer: {
            width: tokens.spacing.xxl,
            height: tokens.spacing.xxl,
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
            width: tokens.spacing.xl + tokens.spacing.sm,
            height: tokens.spacing.xl + tokens.spacing.sm,
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

    if (loading) {
        return (
            <GradientBackground variant="student">
                <View style={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground variant="student">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Student Dashboard</Text>
                    <Text style={styles.subtitle}>Welcome back! Here's your overview</Text>
                </View>

                <Stack spacing="md" style={{ padding: tokens.spacing.md }}>
                    {features.map((feature, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate(feature.route as never)}
                            activeOpacity={0.7}
                        >
                            <Card variant="glassmorphic" style={styles.featureCard}>
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
                        </TouchableOpacity>
                    ))}

                    <Row spacing="md">
                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.success.main}20` }]}>
                                    <Ionicons name="checkmark-circle" size={24} color={tokens.colors.success.main} />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
                                    <Text style={styles.statLabel}>Attendance</Text>
                                </View>
                            </View>
                        </Card>

                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.info.main}20` }]}>
                                    <Ionicons name="document-text" size={24} color={tokens.colors.info.main} />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>{stats.pendingAssignments}</Text>
                                    <Text style={styles.statLabel}>Pending</Text>
                                </View>
                            </View>
                        </Card>
                    </Row>
                </Stack>
            </ScrollView>
        </GradientBackground>
    );
}


