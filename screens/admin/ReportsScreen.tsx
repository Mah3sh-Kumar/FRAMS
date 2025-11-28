import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Title, Card, Text, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';
import ChartCard from '../../components/ChartCard';
import DateRangePicker from '../../components/DateRangePicker';
import FilterBar from '../../components/FilterBar';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ReportsScreen() {
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

            const fileUri = `${(FileSystem as any).documentDirectory}institution_report.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csv);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error('Export error:', error);
        }
    }

    if (loading) return (
        <View style={styles.loader}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10 }}>Loading reports...</Text>
        </View>
    );

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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Institution Reports</Title>
                <IconButton icon="export" mode="contained" onPress={exportReport} />
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsGrid}>
                <Surface style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                    <IconButton icon="account-group" size={32} iconColor="#1976d2" />
                    <Text style={styles.statValue}>{stats.totalStudents}</Text>
                    <Text style={styles.statLabel}>Total Students</Text>
                </Surface>

                <Surface style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                    <IconButton icon="account-tie" size={32} iconColor="#388e3c" />
                    <Text style={styles.statValue}>{stats.totalTeachers}</Text>
                    <Text style={styles.statLabel}>Total Teachers</Text>
                </Surface>

                <Surface style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
                    <IconButton icon="shield-account" size={32} iconColor="#7b1fa2" />
                    <Text style={styles.statValue}>{stats.totalAdmins}</Text>
                    <Text style={styles.statLabel}>Admins</Text>
                </Surface>

                <Surface style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                    <IconButton icon="check-circle" size={32} iconColor="#f57c00" />
                    <Text style={styles.statValue}>{stats.attendanceToday}</Text>
                    <Text style={styles.statLabel}>Present Today</Text>
                </Surface>

                <Surface style={[styles.statCard, { backgroundColor: '#fce4ec' }]}>
                    <IconButton icon="book-open-variant" size={32} iconColor="#c2185b" />
                    <Text style={styles.statValue}>{stats.assignmentsTotal}</Text>
                    <Text style={styles.statLabel}>Total Assignments</Text>
                </Surface>

                <Surface style={[styles.statCard, { backgroundColor: '#e0f2f1' }]}>
                    <IconButton icon="check-all" size={32} iconColor="#00796b" />
                    <Text style={styles.statValue}>{stats.assignmentsCompleted}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </Surface>
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
                <ChartCard title="Attendance Trends (Last 7 Days)">
                    <LineChart
                        data={attendanceChartData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        yAxisSuffix="%"
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#1976d2'
                            }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </ChartCard>
            )}

            {/* Assignment Completion Chart */}
            {Object.keys(assignmentCompletion).length > 0 && (
                <ChartCard title="Assignment Completion Rate">
                    <BarChart
                        data={assignmentChartData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </ChartCard>
            )}

            {/* Subject Performance Chart */}
            {subjectPerformance.length > 0 && (
                <ChartCard title="Subject-wise Performance (Top 5)">
                    <BarChart
                        data={subjectChartData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </ChartCard>
            )}

            {/* Completion Rate Card */}
            <Card style={styles.completionCard}>
                <Card.Content>
                    <Title>Assignment Completion Rate</Title>
                    <Text style={styles.completionPercentage}>
                        {stats.assignmentsTotal > 0 
                            ? ((stats.assignmentsCompleted / stats.assignmentsTotal) * 100).toFixed(1)
                            : 0}%
                    </Text>
                    <Text style={{ color: '#666', textAlign: 'center' }}>
                        {stats.assignmentsCompleted} of {stats.assignmentsTotal} assignments completed
                    </Text>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: -5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    dateRangeContainer: {
        marginBottom: 20,
    },
    completionCard: {
        marginTop: 10,
        marginBottom: 20,
        elevation: 2,
    },
    completionPercentage: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4caf50',
        textAlign: 'center',
        marginVertical: 10,
    },
});
