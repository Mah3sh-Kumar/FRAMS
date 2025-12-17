import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../lib/design-system/ThemeContext';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
    const navigation = useNavigation();
    const { session } = useAuth();
    const { tokens } = useTheme();
    const [adminName, setAdminName] = useState<string>('Admin');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        unverifiedUsers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdminName();
        fetchStats();
    }, []);

    const loadAdminName = async () => {
        if (!session?.user?.id) return;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error loading admin name:', error);
                return;
            }

            if (data?.full_name) {
                const firstName = data.full_name.split(' ')[0];
                setAdminName(firstName || 'Admin');
            }
        } catch (err) {
            console.error('Error loading admin name:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const [usersResult, studentsResult, teachersResult, unverifiedResult] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('students').select('*', { count: 'exact', head: true }),
                supabase.from('teachers').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', false)
            ]);

            // Check for errors in any of the queries
            if (usersResult.error) console.error('Error fetching users count:', usersResult.error);
            if (studentsResult.error) console.error('Error fetching students count:', studentsResult.error);
            if (teachersResult.error) console.error('Error fetching teachers count:', teachersResult.error);
            if (unverifiedResult.error) console.error('Error fetching unverified count:', unverifiedResult.error);

            setStats({
                totalUsers: usersResult.count || 0,
                totalStudents: studentsResult.count || 0,
                totalTeachers: teachersResult.count || 0,
                unverifiedUsers: unverifiedResult.count || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default values on error
            setStats({
                totalUsers: 0,
                totalStudents: 0,
                totalTeachers: 0,
                unverifiedUsers: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: '#F9FAFB' }]}>
                <LoadingSpinner size="large" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor={tokens.colors.roles.admin.main} />
            {/* Purple Header Section */}
            <View style={[styles.welcomeSection, { backgroundColor: tokens.colors.roles.admin.main }]}>
                <View style={styles.headerRow}>
                    <View style={styles.welcomeContent}>
                        <Text style={styles.welcomeTitle}>Welcome Back, {adminName}!</Text>
                        <Text style={styles.welcomeSubtitle}>System overview and management</Text>
                    </View>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Notifications' as never)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Profile' as never)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Settings' as never)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Scrollable Content Area */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Quick Access Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    
                    <TouchableOpacity
                        onPress={() => navigation.navigate('UserManagement' as never)}
                        activeOpacity={0.7}
                        style={styles.cardWrapper}
                    >
                        <View style={[styles.taskCard, { borderLeftColor: tokens.colors.roles.admin.main }]}>
                            <View style={[styles.iconContainer, { backgroundColor: `${tokens.colors.roles.admin.main}15` }]}>
                                <Ionicons name="settings" size={28} color={tokens.colors.roles.admin.main} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.taskTitle}>User Management</Text>
                                <Text style={styles.taskDescription}>Manage users, roles, and permissions.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('OrganizationManager' as never)}
                        activeOpacity={0.7}
                        style={styles.cardWrapper}
                    >
                        <View style={[styles.taskCard, { borderLeftColor: tokens.colors.primary.main }]}>
                            <View style={[styles.iconContainer, { backgroundColor: `${tokens.colors.primary.main}15` }]}>
                                <Ionicons name="business" size={28} color={tokens.colors.primary.main} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.taskTitle}>Organization Manager</Text>
                                <Text style={styles.taskDescription}>Manage classes, branches, and departments.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Reports' as never)}
                        activeOpacity={0.7}
                        style={styles.cardWrapper}
                    >
                        <View style={[styles.taskCard, { borderLeftColor: tokens.colors.success.main }]}>
                            <View style={[styles.iconContainer, { backgroundColor: `${tokens.colors.success.main}15` }]}>
                                <Ionicons name="bar-chart" size={28} color={tokens.colors.success.main} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.taskTitle}>View Reports</Text>
                                <Text style={styles.taskDescription}>Analytics and system insights.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* System Statistics Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.info.main}15` }]}>
                                    <Ionicons name="people" size={20} color={tokens.colors.info.main} />
                                </View>
                                <Text style={styles.statLabel}>Total Users</Text>
                            </View>
                            <Text style={styles.statValue}>{stats.totalUsers}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.primary.main}15` }]}>
                                    <Ionicons name="school" size={20} color={tokens.colors.primary.main} />
                                </View>
                                <Text style={styles.statLabel}>Students</Text>
                            </View>
                            <Text style={styles.statValue}>{stats.totalStudents}</Text>
                        </View>
                    </View>

                    <View style={[styles.statsGrid, { marginTop: 16 }]}>
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.success.main}15` }]}>
                                    <Ionicons name="briefcase" size={20} color={tokens.colors.success.main} />
                                </View>
                                <Text style={styles.statLabel}>Teachers</Text>
                            </View>
                            <Text style={styles.statValue}>{stats.totalTeachers}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.warning.main}15` }]}>
                                    <Ionicons name="alert-circle" size={20} color={tokens.colors.warning.main} />
                                </View>
                                <Text style={styles.statLabel}>Pending Verification</Text>
                            </View>
                            <Text style={styles.statValue}>{stats.unverifiedUsers}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    welcomeSection: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    welcomeContent: {
        flex: 1,
        marginRight: 16,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 34,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.95,
        lineHeight: 22,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 16,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        minHeight: 128,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        flex: 1,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '700',
        color: '#1F2937',
    },
});
