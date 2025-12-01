import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Card from '../../components/design-system/primitives/Card';
import { Stack } from '../../components/design-system/layout';
import GradientBackground from '../../components/GradientBackground';
import GlassmorphicWidget from '../../components/design-system/analytics/GlassmorphicWidget';
import ProgressRing from '../../components/design-system/analytics/ProgressRing';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
    const navigation = useNavigation();
    const { tokens, getTextColor } = useTheme();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        unverifiedUsers: 0,
        attendanceRate: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            
            // Fetch user counts
            const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
            const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: totalTeachers } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
            const { count: totalAdmins } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin');
            const { count: unverifiedUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', false);

            // Calculate attendance rate for today
            const today = new Date().toISOString().split('T')[0];
            const { count: presentCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('date', today)
                .eq('status', 'present');
            
            const { count: totalAttendance } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('date', today);

            const attendanceRate = totalAttendance ? (presentCount || 0) / totalAttendance * 100 : 0;

            setStats({
                totalUsers: totalUsers || 0,
                totalStudents: totalStudents || 0,
                totalTeachers: totalTeachers || 0,
                totalAdmins: totalAdmins || 0,
                unverifiedUsers: unverifiedUsers || 0,
                attendanceRate,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            title: 'User Management',
            description: 'Manage users and roles',
            icon: 'settings-outline' as const,
            color: tokens.colors.roles.admin.main,
            route: 'UserManagement',
        },
        {
            title: 'View Reports',
            description: 'Analytics and insights',
            icon: 'bar-chart-outline' as const,
            color: tokens.colors.success.main,
            route: 'Reports',
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
        sectionHeader: {
            fontSize: tokens.typography.h2.fontSize,
            fontWeight: tokens.typography.h2.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.md,
            marginTop: tokens.spacing.lg,
        },
        divider: {
            height: 1,
            backgroundColor: tokens.colors.neutral.gray300,
            marginVertical: tokens.spacing.lg,
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
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.md,
        },
        statWidget: {
            flex: 1,
            minWidth: '45%',
        },
        statContent: {
            alignItems: 'center',
        },
        statValue: {
            fontSize: tokens.typography.display.fontSize,
            fontWeight: tokens.typography.display.fontWeight,
            color: getTextColor(),
            marginTop: tokens.spacing.sm,
        },
        statLabel: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray600,
            marginTop: tokens.spacing.xs,
            textAlign: 'center',
        },
        progressWidget: {
            alignItems: 'center',
            paddingVertical: tokens.spacing.md,
        },
        progressLabel: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.md,
        },
    });

    return (
        <GradientBackground variant="admin">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Dashboard</Text>
                    <Text style={styles.subtitle}>System overview and management</Text>
                </View>

                <Stack spacing="lg" style={{ padding: tokens.spacing.md }}>
                    {/* Quick Actions Section */}
                    <View>
                        <Text style={styles.sectionHeader}>Quick Actions</Text>
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
                    </View>

                    <View style={styles.divider} />

                    {/* System Statistics Section */}
                    <View>
                        <Text style={styles.sectionHeader}>System Statistics</Text>
                        <View style={styles.statsGrid}>
                            <GlassmorphicWidget style={styles.statWidget} elevation="md">
                                <View style={styles.statContent}>
                                    <Ionicons name="people" size={32} color={tokens.colors.info.main} />
                                    <Text style={styles.statValue}>{loading ? '--' : stats.totalUsers}</Text>
                                    <Text style={styles.statLabel}>Total Users</Text>
                                </View>
                            </GlassmorphicWidget>

                            <GlassmorphicWidget style={styles.statWidget} elevation="md">
                                <View style={styles.statContent}>
                                    <Ionicons name="school" size={32} color={tokens.colors.primary.main} />
                                    <Text style={styles.statValue}>{loading ? '--' : stats.totalStudents}</Text>
                                    <Text style={styles.statLabel}>Students</Text>
                                </View>
                            </GlassmorphicWidget>

                            <GlassmorphicWidget style={styles.statWidget} elevation="md">
                                <View style={styles.statContent}>
                                    <Ionicons name="briefcase" size={32} color={tokens.colors.success.main} />
                                    <Text style={styles.statValue}>{loading ? '--' : stats.totalTeachers}</Text>
                                    <Text style={styles.statLabel}>Teachers</Text>
                                </View>
                            </GlassmorphicWidget>

                            <GlassmorphicWidget style={styles.statWidget} elevation="md">
                                <View style={styles.statContent}>
                                    <Ionicons name="shield-checkmark" size={32} color={tokens.colors.roles.admin.main} />
                                    <Text style={styles.statValue}>{loading ? '--' : stats.totalAdmins}</Text>
                                    <Text style={styles.statLabel}>Admins</Text>
                                </View>
                            </GlassmorphicWidget>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Metrics Section */}
                    <View>
                        <Text style={styles.sectionHeader}>Key Metrics</Text>
                        <View style={styles.statsGrid}>
                            <GlassmorphicWidget style={styles.statWidget} elevation="lg">
                                <View style={styles.progressWidget}>
                                    <Text style={styles.progressLabel}>Today's Attendance</Text>
                                    <ProgressRing
                                        progress={loading ? 0 : stats.attendanceRate}
                                        size={100}
                                        strokeWidth={10}
                                        gradientColors={tokens.colors.success.gradient as [string, string]}
                                    />
                                </View>
                            </GlassmorphicWidget>

                            <GlassmorphicWidget style={styles.statWidget} elevation="lg">
                                <View style={styles.statContent}>
                                    <Ionicons name="alert-circle" size={32} color={tokens.colors.warning.main} />
                                    <Text style={styles.statValue}>{loading ? '--' : stats.unverifiedUsers}</Text>
                                    <Text style={styles.statLabel}>Pending Verification</Text>
                                </View>
                            </GlassmorphicWidget>
                        </View>
                    </View>
                </Stack>
            </ScrollView>
        </GradientBackground>
    );
}


