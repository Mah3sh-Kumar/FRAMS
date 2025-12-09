import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentAttendanceStats, fetchStudentPendingAssignments } from '../../lib/database';
import { useTheme } from '../../lib/design-system/ThemeContext';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function StudentDashboard() {
    const navigation = useNavigation();
    const { session } = useAuth();
    const { tokens } = useTheme();
    const [stats, setStats] = useState({ attendanceRate: 0, pendingAssignments: 0 });
    const [studentName, setStudentName] = useState<string>('Student');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
        loadStudentName();
    }, []);

    const loadStudentName = async () => {
        if (!session?.user?.id) return;

        try {
            const { data } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

            if (data?.full_name) {
                const firstName = data.full_name.split(' ')[0];
                setStudentName(firstName);
            }
        } catch (err) {
            console.error('Error loading student name:', err);
        }
    };

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
        } catch (err) {
            console.error('Error loading stats:', err);
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
            <StatusBar barStyle="light-content" backgroundColor={tokens.colors.roles.student.main} />
            {/* Blue Header Section */}
            <View style={[styles.welcomeSection, { backgroundColor: tokens.colors.roles.student.main }]}>
                <View style={styles.headerRow}>
                    <View style={styles.welcomeContent}>
                        <Text style={styles.welcomeTitle}>Welcome Back, {studentName}!</Text>
                        <Text style={styles.welcomeSubtitle}>Here's your summary for the week.</Text>
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
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Attendance' as never)}
                        activeOpacity={0.7}
                        style={styles.cardWrapper}
                    >
                        <View style={[styles.taskCard, { borderLeftColor: tokens.colors.roles.student.main }]}>
                            <View style={[styles.iconContainer, { backgroundColor: `${tokens.colors.roles.student.main}15` }]}>
                                <Ionicons name="calendar" size={28} color={tokens.colors.roles.student.main} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.taskTitle}>Attendance</Text>
                                <Text style={styles.taskDescription}>View your recent attendance records and history.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Assignments' as never)}
                        activeOpacity={0.7}
                        style={styles.cardWrapper}
                    >
                        <View style={[styles.taskCard, { borderLeftColor: tokens.colors.warning.main }]}>
                            <View style={[styles.iconContainer, { backgroundColor: `${tokens.colors.warning.main}15` }]}>
                                <Ionicons name="book" size={28} color={tokens.colors.warning.main} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.taskTitle}>Assignments</Text>
                                <Text style={styles.taskDescription}>Check pending tasks and assignment submissions.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Key Statistics Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Statistics</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.success.main}15` }]}>
                                    <Ionicons name="checkmark-circle" size={20} color={tokens.colors.success.main} />
                                </View>
                                <Text style={styles.statLabel}>Overall Attendance</Text>
                            </View>
                            <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.error.main}15` }]}>
                                    <Ionicons name="document-text" size={20} color={tokens.colors.error.main} />
                                </View>
                                <Text style={styles.statLabel}>Pending Assignments</Text>
                            </View>
                            <Text style={styles.statValue}>{stats.pendingAssignments}</Text>
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
    statsRow: {
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


