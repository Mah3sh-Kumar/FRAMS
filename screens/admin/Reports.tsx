import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, Button, Surface, IconButton, SegmentedButtons } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, typography } from '../../lib/theme';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalSubjects: 0,
        totalAssignments: 0,
        avgAttendance: 0,
        avgAssignmentScore: 0,
    });

    useEffect(() => {
        fetchReportData();
    }, [timeRange]);

    async function fetchReportData() {
        setLoading(true);
        try {
            // Fetch  user counts
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            const { count: totalStudents } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true });

            const { count: totalTeachers } = await supabase
                .from('teachers')
                .select('*', { count: 'exact', head: true });

            const { count: totalClasses } = await supabase
                .from('classes')
                .select('*', { count: 'exact', head: true });

            const { count: totalSubjects } = await supabase
                .from('subjects')
                .select('*', { count: 'exact', head: true });

            const { count: totalAssignments } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true });

            // Calculate average attendance
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('status');

            const presentCount = attendanceData?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
            const totalAttendance = attendanceData?.length || 1;
            const avgAttendance = ((presentCount / totalAttendance) * 100).toFixed(1);

            // Calculate average assignment score
            const { data: submissionsData } = await supabase
                .from('student_assignments')
                .select('score, assignments(max_score)');

            const gradedSubmissions = submissionsData?.filter(s => s.score !== null) || [];
            const avgScore = gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((sum, s) => {
                    const percentage = (s.score! / (s.assignments?.max_score || 100)) * 100;
                    return sum + percentage;
                }, 0) / gradedSubmissions.length
                : 0;

            setStats({
                totalUsers: totalUsers || 0,
                totalStudents: totalStudents || 0,
                totalTeachers: totalTeachers || 0,
                totalClasses: totalClasses || 0,
                totalSubjects: totalSubjects || 0,
                totalAssignments: totalAssignments || 0,
                avgAttendance: Number(avgAttendance),
                avgAssignmentScore: avgScore,
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <LoadingSpinner text="Loading reports..." />;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Title style={styles.title}>System Reports</Title>
                <Text style={styles.subtitle}>Analytics and insights</Text>
            </View>

            {/* Time Range Selector */}
            <View style={styles.filterContainer}>
                <SegmentedButtons
                    value={timeRange}
                    onValueChange={setTimeRange}
                    buttons={[
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                        { value: 'year', label: 'Year' },
                        { value: 'all', label: 'All Time' },
                    ]}
                    style={styles.segmentedButtons}
                />
            </View>

            {/* User Statistics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Statistics</Text>
                <View style={styles.statsGrid}>
                    <Surface style={[styles.statCard, { backgroundColor: colors.primary.light + '20' }]}>
                        <IconButton icon="account-group" size={32} iconColor={colors.primary.main} />
                        <Title style={styles.statValue}>{stats.totalUsers}</Title>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.info.light + '20' }]}>
                        <IconButton icon="school" size={32} iconColor={colors.info.main} />
                        <Title style={styles.statValue}>{stats.totalStudents}</Title>
                        <Text style={styles.statLabel}>Students</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.success.light + '20' }]}>
                        <IconButton icon="account-tie" size={32} iconColor={colors.success.main} />
                        <Title style={styles.statValue}>{stats.totalTeachers}</Title>
                        <Text style={styles.statLabel}>Teachers</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.secondary.light + '20' }]}>
                        <IconButton icon="google-classroom" size={32} iconColor={colors.secondary.main} />
                        <Title style={styles.statValue}>{stats.totalClasses}</Title>
                        <Text style={styles.statLabel}>Classes</Text>
                    </Surface>
                </View>
            </View>

            {/* Academic Statistics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Academic Statistics</Text>
                <View style={styles.statsGrid}>
                    <Surface style={[styles.statCard, { backgroundColor: colors.warning.light + '20' }]}>
                        <IconButton icon="book-multiple" size={32} iconColor={colors.warning.main} />
                        <Title style={styles.statValue}>{stats.totalSubjects}</Title>
                        <Text style={styles.statLabel}>Subjects</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.info.light + '20' }]}>
                        <IconButton icon="clipboard-text" size={32} iconColor={colors.info.main} />
                        <Title style={styles.statValue}>{stats.totalAssignments}</Title>
                        <Text style={styles.statLabel}>Assignments</Text>
                    </Surface>
                </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                <Card style={styles.metricCard}>
                    <Card.Content>
                        <View style={styles.metricRow}>
                            <View style={styles.metricInfo}>
                                <IconButton icon="calendar-check" size={28} iconColor={colors.success.main} />
                                <View>
                                    <Text style={styles.metricLabel}>Average Attendance</Text>
                                    <Text style={styles.metricValue}>{stats.avgAttendance}%</Text>
                                </View>
                            </View>
                            <View style={[styles.progressBar, { width: `${stats.avgAttendance}%`, backgroundColor: colors.success.main }]} />
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.metricCard}>
                    <Card.Content>
                        <View style={styles.metricRow}>
                            <View style={styles.metricInfo}>
                                <IconButton icon="star" size={28} iconColor={colors.warning.main} />
                                <View>
                                    <Text style={styles.metricLabel}>Average Assignment Score</Text>
                                    <Text style={styles.metricValue}>{stats.avgAssignmentScore.toFixed(1)}%</Text>
                                </View>
                            </View>
                            <View style={[styles.progressBar, { width: `${stats.avgAssignmentScore}%`, backgroundColor: colors.warning.main }]} />
                        </View>
                    </Card.Content>
                </Card>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <Button
                    mode="contained"
                    icon="download"
                    style={styles.actionButton}
                    buttonColor={colors.primary.main}
                    onPress={() => {/* Export functionality */ }}
                >
                    Export to CSV
                </Button>
                <Button
                    mode="outlined"
                    icon="printer"
                    style={styles.actionButton}
                    onPress={() => {/* Print functionality */ }}
                >
                    Print Report
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.text.secondary,
    },
    filterContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    segmentedButtons: {
        borderRadius: 8,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    statValue: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: -spacing.xs,
    },
    statLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    metricCard: {
        marginBottom: spacing.md,
        elevation: 2,
    },
    metricRow: {
        flexDirection: 'column',
    },
    metricInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    metricLabel: {
        fontSize: typography.fontSize.md,
        color: colors.text.secondary,
        marginBottom: spacing.xs / 2,
    },
    metricValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginTop: spacing.xs,
    },
    actionsContainer: {
        padding: spacing.md,
        gap: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    actionButton: {
        borderRadius: 8,
    },
});
