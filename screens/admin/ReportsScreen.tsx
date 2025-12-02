import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/design-system/ThemeContext';
import GlassmorphicWidget from '../../components/design-system/analytics/GlassmorphicWidget';
import HeatmapChart, { HeatmapDataPoint } from '../../components/design-system/analytics/HeatmapChart';
import ProgressRing from '../../components/design-system/analytics/ProgressRing';
import { Stack } from '../../components/design-system/layout';
import Card from '../../components/design-system/primitives/Card';
import Button from '../../components/design-system/primitives/Button';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import DateRangePicker from '../../components/DateRangePicker';
import GradientBackground from '../../components/GradientBackground';
import { Ionicons } from '@expo/vector-icons';
import { exportCSV } from '../../lib/csvExport';

export default function ReportsScreen() {
    const { tokens, getTextColor, getTextSecondaryColor } = useTheme();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        attendanceToday: 0,
        assignmentsTotal: 0,
        assignmentsCompleted: 0,
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
    });
    const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
    const [assignmentCompletion, setAssignmentCompletion] = useState<any>({});
    const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
        fetchAttendanceTrend();
        fetchAssignmentCompletion();
        fetchSubjectPerformance();
    }, [dateRange]);

    async function fetchStats() {
        try {
            setLoading(true);
            
            const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
            const { count: adminCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin');

            const today = new Date().toISOString().split('T')[0];
            const { count: attendanceCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('date', today)
                .eq('status', 'present');

            const { count: assignmentsTotal } = await supabase.from('assignments').select('*', { count: 'exact', head: true });
            const { count: assignmentsCompleted } = await supabase
                .from('student_assignments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'graded');

            setStats({
                totalStudents: studentCount || 0,
                totalTeachers: teacherCount || 0,
                totalAdmins: adminCount || 0,
                attendanceToday: attendanceCount || 0,
                assignmentsTotal: assignmentsTotal || 0,
                assignmentsCompleted: assignmentsCompleted || 0,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAttendanceTrend() {
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('date, status')
                .gte('date', dateRange.start.toISOString().split('T')[0])
                .lte('date', dateRange.end.toISOString().split('T')[0])
                .order('date', { ascending: true });

            if (!error && data) {
                // Group by date and count present
                const grouped = data.reduce((acc: any, curr) => {
                    const date = curr.date;
                    if (!acc[date]) acc[date] = { present: 0, total: 0 };
                    acc[date].total++;
                    if (curr.status === 'present') acc[date].present++;
                    return acc;
                }, {});

                const trend = Object.entries(grouped).map(([date, counts]: [string, any]) => ({
                    date,
                    percentage: (counts.present / counts.total) * 100,
                }));

                setAttendanceTrend(trend);

                // Generate heatmap data for last 4 weeks
                const heatmap: HeatmapDataPoint[] = [];
                const today = new Date();
                for (let week = 0; week < 4; week++) {
                    for (let day = 0; day < 7; day++) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - (week * 7 + (6 - day)));
                        const dateStr = date.toISOString().split('T')[0];
                        const dayData = grouped[dateStr];
                        const value = dayData ? (dayData.present / dayData.total) * 100 : 0;
                        heatmap.push({ day, week, value });
                    }
                }
                setHeatmapData(heatmap);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchAssignmentCompletion() {
        try {
            const { data, error } = await supabase
                .from('student_assignments')
                .select('status')
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());

            if (!error && data) {
                const pending = data.filter(a => a.status === 'pending').length;
                const submitted = data.filter(a => a.status === 'submitted').length;
                const graded = data.filter(a => a.status === 'graded').length;

                setAssignmentCompletion({ pending, submitted, graded });
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchSubjectPerformance() {
        try {
            const { data, error } = await supabase
                .from('student_assignments')
                .select('score, assignments(subject_id, subjects(name))')
                .not('score', 'is', null);

            if (!error && data) {
                const subjectScores: any = {};
                data.forEach((item: any) => {
                    const subjectName = item.assignments?.subjects?.name;
                    if (subjectName && item.score !== null) {
                        if (!subjectScores[subjectName]) {
                            subjectScores[subjectName] = { total: 0, count: 0 };
                        }
                        subjectScores[subjectName].total += item.score;
                        subjectScores[subjectName].count++;
                    }
                });

                const performance = Object.entries(subjectScores).map(([name, data]: [string, any]) => ({
                    name,
                    avgScore: data.total / data.count,
                }));

                setSubjectPerformance(performance);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function exportReport() {
        try {
            let csv = 'Institution Report\n\n';
            csv += 'Statistics\n';
            csv += `Total Students,${stats.totalStudents}\n`;
            csv += `Total Teachers,${stats.totalTeachers}\n`;
            csv += `Total Admins,${stats.totalAdmins}\n`;
            csv += `Attendance Today,${stats.attendanceToday}\n`;
            csv += `Total Assignments,${stats.assignmentsTotal}\n`;
            csv += `Completed Assignments,${stats.assignmentsCompleted}\n\n`;

            csv += 'Subject Performance\n';
            csv += 'Subject,Average Score\n';
            subjectPerformance.forEach(s => {
                csv += `${s.name},${s.avgScore.toFixed(2)}\n`;
            });

            await exportCSV(csv, 'institution_report.csv');
        } catch (error) {
            console.error('Export error:', error);
        }
    }

    const attendanceChartData = {
        labels: attendanceTrend.slice(-7).map(t => new Date(t.date).getDate().toString()),
        datasets: [{
            data: attendanceTrend.slice(-7).map(t => t.percentage),
        }]
    };

    const assignmentChartData = {
        labels: ['Pending', 'Submitted', 'Graded'],
        datasets: [{
            data: [
                assignmentCompletion.pending || 0,
                assignmentCompletion.submitted || 0,
                assignmentCompletion.graded || 0,
            ]
        }]
    };

    const subjectChartData = {
        labels: subjectPerformance.slice(0, 5).map(s => s.name.substring(0, 8)),
        datasets: [{
            data: subjectPerformance.slice(0, 5).map(s => s.avgScore),
        }]
    };

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
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.lg,
        },
        statWidget: {
            flex: 1,
            minWidth: '45%',
        },
        statContent: {
            alignItems: 'center',
            gap: tokens.spacing.sm,
        },
        statValue: {
            fontSize: tokens.typography.display.fontSize,
            fontWeight: tokens.typography.display.fontWeight,
            color: tokens.colors.neutral.gray900,
        },
        statLabel: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray800,
            fontWeight: '600',
            textAlign: 'center',
        },
        dateRangeContainer: {
            paddingHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.lg,
        },
        chartCard: {
            marginHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.lg,
        },
        chartTitle: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: tokens.colors.neutral.gray900,
            marginBottom: tokens.spacing.md,
        },
        completionWidget: {
            marginHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.lg,
            alignItems: 'center',
            paddingVertical: tokens.spacing.lg,
        },
        completionPercentage: {
            fontSize: 48,
            fontWeight: '700',
            color: tokens.colors.success.main,
            marginVertical: tokens.spacing.md,
        },
        completionText: {
            fontSize: tokens.typography.body.fontSize,
            color: tokens.colors.neutral.gray700,
            textAlign: 'center',
        },
        exportButton: {
            marginTop: tokens.spacing.xs,
        },
        loader: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    if (loading) return (
        <GradientBackground variant="admin">
            <View style={styles.loader}>
                <LoadingSpinner size="large" />
                <Text style={{ marginTop: tokens.spacing.md, color: tokens.colors.neutral.white }}>Loading reports...</Text>
            </View>
        </GradientBackground>
    );

    return (
        <GradientBackground variant="admin">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.title}>Institution Reports</Text>
                            <Text style={styles.subtitle}>Analytics and insights</Text>
                        </View>
                        <TouchableOpacity onPress={exportReport} style={styles.exportButton}>
                            <Ionicons name="download-outline" size={28} color={tokens.colors.neutral.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Stack spacing="lg" style={{ paddingBottom: tokens.spacing.xl }}>
                    {/* Statistics Cards */}
                    <View style={styles.statsGrid}>
                        <GlassmorphicWidget style={styles.statWidget} elevation="md">
                            <View style={styles.statContent}>
                                <Ionicons name="school" size={32} color={tokens.colors.primary.main} />
                                <Text style={styles.statValue}>{stats.totalStudents}</Text>
                                <Text style={styles.statLabel}>Total Students</Text>
                            </View>
                        </GlassmorphicWidget>

                        <GlassmorphicWidget style={styles.statWidget} elevation="md">
                            <View style={styles.statContent}>
                                <Ionicons name="briefcase" size={32} color={tokens.colors.success.main} />
                                <Text style={styles.statValue}>{stats.totalTeachers}</Text>
                                <Text style={styles.statLabel}>Total Teachers</Text>
                            </View>
                        </GlassmorphicWidget>

                        <GlassmorphicWidget style={styles.statWidget} elevation="md">
                            <View style={styles.statContent}>
                                <Ionicons name="shield-checkmark" size={32} color={tokens.colors.roles.admin.main} />
                                <Text style={styles.statValue}>{stats.totalAdmins}</Text>
                                <Text style={styles.statLabel}>Admins</Text>
                            </View>
                        </GlassmorphicWidget>

                        <GlassmorphicWidget style={styles.statWidget} elevation="md">
                            <View style={styles.statContent}>
                                <Ionicons name="checkmark-circle" size={32} color={tokens.colors.warning.main} />
                                <Text style={styles.statValue}>{stats.attendanceToday}</Text>
                                <Text style={styles.statLabel}>Present Today</Text>
                            </View>
                        </GlassmorphicWidget>

                        <GlassmorphicWidget style={styles.statWidget} elevation="md">
                            <View style={styles.statContent}>
                                <Ionicons name="document-text" size={32} color={tokens.colors.info.main} />
                                <Text style={styles.statValue}>{stats.assignmentsTotal}</Text>
                                <Text style={styles.statLabel}>Total Assignments</Text>
                            </View>
                        </GlassmorphicWidget>

                        <GlassmorphicWidget style={styles.statWidget} elevation="md">
                            <View style={styles.statContent}>
                                <Ionicons name="checkmark-done" size={32} color={tokens.colors.accent.main} />
                                <Text style={styles.statValue}>{stats.assignmentsCompleted}</Text>
                                <Text style={styles.statLabel}>Completed</Text>
                            </View>
                        </GlassmorphicWidget>
                    </View>

                    {/* Date Range Filter */}
                    <View style={styles.dateRangeContainer}>
                        <DateRangePicker
                            startDate={dateRange.start}
                            endDate={dateRange.end}
                            onStartDateChange={(date: Date) => setDateRange({ ...dateRange, start: date })}
                            onEndDateChange={(date: Date) => setDateRange({ ...dateRange, end: date })}
                        />
                    </View>

                    {/* Attendance Trend Chart */}
                    {attendanceTrend.length > 0 && (
                        <GlassmorphicWidget style={styles.chartCard} elevation="lg">
                            <Text style={styles.chartTitle}>Attendance Trends (Last 7 Days)</Text>
                            <LineChart
                                data={attendanceChartData}
                                width={Dimensions.get('window').width - 64}
                                height={220}
                                yAxisSuffix="%"
                                chartConfig={{
                                    backgroundColor: 'transparent',
                                    backgroundGradientFrom: 'transparent',
                                    backgroundGradientTo: 'transparent',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                                    labelColor: (opacity = 1) => tokens.colors.neutral.gray900,
                                    style: { borderRadius: tokens.borders.radius.medium },
                                    propsForDots: {
                                        r: '6',
                                        strokeWidth: '2',
                                        stroke: tokens.colors.primary.main
                                    }
                                }}
                                bezier
                                style={{ marginVertical: tokens.spacing.sm, borderRadius: tokens.borders.radius.medium }}
                            />
                        </GlassmorphicWidget>
                    )}

                    {/* Weekly Attendance Heatmap */}
                    {heatmapData.length > 0 && (
                        <GlassmorphicWidget style={styles.chartCard} elevation="lg">
                            <Text style={styles.chartTitle}>Weekly Attendance Heatmap</Text>
                            <HeatmapChart data={heatmapData} />
                        </GlassmorphicWidget>
                    )}

                    {/* Assignment Completion Chart */}
                    {Object.keys(assignmentCompletion).length > 0 && (
                        <GlassmorphicWidget style={styles.chartCard} elevation="lg">
                            <Text style={styles.chartTitle}>Assignment Completion Status</Text>
                            <BarChart
                                data={assignmentChartData}
                                width={Dimensions.get('window').width - 64}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundColor: 'transparent',
                                    backgroundGradientFrom: 'transparent',
                                    backgroundGradientTo: 'transparent',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
                                    labelColor: (opacity = 1) => tokens.colors.neutral.gray900,
                                }}
                                style={{ marginVertical: tokens.spacing.sm, borderRadius: tokens.borders.radius.medium }}
                            />
                        </GlassmorphicWidget>
                    )}

                    {/* Subject Performance Chart */}
                    {subjectPerformance.length > 0 && (
                        <GlassmorphicWidget style={styles.chartCard} elevation="lg">
                            <Text style={styles.chartTitle}>Subject-wise Performance (Top 5)</Text>
                            <BarChart
                                data={subjectChartData}
                                width={Dimensions.get('window').width - 64}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundColor: 'transparent',
                                    backgroundGradientFrom: 'transparent',
                                    backgroundGradientTo: 'transparent',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                                    labelColor: (opacity = 1) => tokens.colors.neutral.gray900,
                                }}
                                style={{ marginVertical: tokens.spacing.sm, borderRadius: tokens.borders.radius.medium }}
                            />
                        </GlassmorphicWidget>
                    )}

                    {/* Completion Rate Card */}
                    <GlassmorphicWidget style={styles.completionWidget} elevation="lg">
                        <Text style={styles.chartTitle}>Assignment Completion Rate</Text>
                        <ProgressRing
                            progress={stats.assignmentsTotal > 0 
                                ? (stats.assignmentsCompleted / stats.assignmentsTotal) * 100
                                : 0}
                            size={120}
                            strokeWidth={12}
                            gradientColors={tokens.colors.success.gradient as [string, string]}
                        />
                        <Text style={styles.completionText}>
                            {stats.assignmentsCompleted} of {stats.assignmentsTotal} assignments completed
                        </Text>
                    </GlassmorphicWidget>
                </Stack>
            </ScrollView>
        </GradientBackground>
    );
}


