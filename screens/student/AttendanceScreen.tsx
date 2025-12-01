import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Text, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Card from '../../components/design-system/primitives/Card';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import DateRangePicker from '../../components/DateRangePicker';
import { Stack, Row } from '../../components/design-system/layout';

type AttendanceRecord = {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    subjects: { name: string } | null;
};

export default function AttendanceScreen() {
    const { tokens, getTextColor, getSurfaceColor } = useTheme();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
    });
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 });
    const [subjectStats, setSubjectStats] = useState<Record<string, { present: number; total: number }>>({});

    useEffect(() => {
        fetchAttendance();
    }, [dateRange]);

    useEffect(() => {
        calculateStats();
    }, [attendance]);

    async function fetchAttendance() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('id', user.id)
                .single();

            if (student) {
                const { data, error } = await supabase
                    .from('attendance')
                    .select('*, subjects(name)')
                    .eq('student_id', student.id)
                    .gte('date', dateRange.start.toISOString())
                    .lte('date', dateRange.end.toISOString())
                    .order('date', { ascending: false });

                if (error) console.error(error);
                else setAttendance(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function calculateStats() {
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        const total = attendance.length;
        const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;

        setStats({ present, absent, late, total, percentage: Number(percentage) });

        const subjectMap: Record<string, { present: number; total: number }> = {};
        attendance.forEach(record => {
            const subjectName = record.subjects?.name || 'Unknown';
            if (!subjectMap[subjectName]) {
                subjectMap[subjectName] = { present: 0, total: 0 };
            }
            subjectMap[subjectName].total++;
            if (record.status === 'present' || record.status === 'late') {
                subjectMap[subjectName].present++;
            }
        });
        setSubjectStats(subjectMap);
    }

    function onRefresh() {
        setRefreshing(true);
        fetchAttendance();
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'present': return tokens.colors.success.main;
            case 'absent': return tokens.colors.error.main;
            case 'late': return tokens.colors.warning.main;
            default: return tokens.colors.neutral.gray600;
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'present': return 'checkmark-circle';
            case 'absent': return 'close-circle';
            case 'late': return 'time';
            default: return 'information-circle';
        }
    }

    const filteredAttendance = filterStatus === 'all'
        ? attendance
        : attendance.filter(a => a.status === filterStatus);

    const chartData = [
        {
            name: 'Present',
            population: stats.present,
            color: tokens.colors.success.main,
            legendFontColor: getTextColor(),
            legendFontSize: 12,
        },
        {
            name: 'Absent',
            population: stats.absent,
            color: tokens.colors.error.main,
            legendFontColor: getTextColor(),
            legendFontSize: 12,
        },
        {
            name: 'Late',
            population: stats.late,
            color: tokens.colors.warning.main,
            legendFontColor: getTextColor(),
            legendFontSize: 12,
        },
    ].filter(item => item.population > 0);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: tokens.colors.theme.light.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: tokens.colors.theme.light.background,
        },
        header: {
            padding: tokens.spacing.lg,
            paddingTop: tokens.spacing.xl,
        },
        title: {
            fontSize: tokens.typography.h1.fontSize,
            fontWeight: tokens.typography.h1.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.xs,
        },
        subtitle: {
            fontSize: tokens.typography.body.fontSize,
            color: tokens.colors.neutral.gray600,
        },
        statCard: {
            flex: 1,
        },
        statContent: {
            padding: tokens.spacing.md,
            alignItems: 'center',
        },
        statIconContainer: {
            width: tokens.spacing.xl + tokens.spacing.sm,
            height: tokens.spacing.xl + tokens.spacing.sm,
            borderRadius: tokens.borders.radius.medium,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: tokens.spacing.sm,
        },
        statValue: {
            fontSize: tokens.typography.h2.fontSize,
            fontWeight: tokens.typography.h2.fontWeight,
            color: getTextColor(),
        },
        statLabel: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray600,
            marginTop: tokens.spacing.xs / 2,
        },
        chartCard: {
            marginBottom: 0,
        },
        chartContent: {
            padding: tokens.spacing.md,
            alignItems: 'center',
        },
        chartTitle: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.md,
        },
        subjectCard: {
            marginBottom: 0,
        },
        subjectContent: {
            padding: tokens.spacing.md,
        },
        subjectTitle: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.md,
        },
        subjectRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: tokens.spacing.sm,
            borderBottomWidth: tokens.borders.width.thin,
            borderBottomColor: tokens.colors.neutral.gray200,
        },
        subjectName: {
            fontSize: tokens.typography.body.fontSize,
            color: getTextColor(),
            flex: 1,
        },
        subjectStats: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing.xs,
        },
        subjectPercentage: {
            fontSize: tokens.typography.body.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: tokens.colors.primary.main,
        },
        subjectCount: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray600,
        },
        filterButton: {
            flex: 1,
            paddingVertical: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            borderRadius: tokens.borders.radius.medium,
            borderWidth: tokens.borders.width.medium,
            borderColor: tokens.colors.neutral.gray300,
            backgroundColor: getSurfaceColor(),
            alignItems: 'center',
        },
        filterButtonActive: {
            borderColor: tokens.colors.primary.main,
            backgroundColor: tokens.colors.primary.light,
        },
        filterButtonText: {
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: tokens.colors.neutral.gray600,
        },
        filterButtonTextActive: {
            color: tokens.colors.primary.main,
        },
        recordCard: {
            marginBottom: 0,
        },
        recordContent: {
            padding: tokens.spacing.md,
        },
        recordHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        recordInfo: {
            flex: 1,
        },
        recordSubject: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.xs / 2,
        },
        recordDate: {
            fontSize: tokens.typography.caption.fontSize,
            color: tokens.colors.neutral.gray600,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: tokens.spacing.xs / 2,
            paddingHorizontal: tokens.spacing.sm,
            borderRadius: tokens.borders.radius.small,
            gap: tokens.spacing.xs / 2,
        },
        statusText: {
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
        },
        dateRangeContainer: {
            paddingHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.md,
        },
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>My Attendance</Text>
                    <Text style={styles.subtitle}>Track your class attendance</Text>
                </View>

                <View style={styles.dateRangeContainer}>
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onStartDateChange={(date: Date) => setDateRange({ ...dateRange, start: date })}
                        onEndDateChange={(date: Date) => setDateRange({ ...dateRange, end: date })}
                    />
                </View>

                <Stack spacing="md" style={{ paddingHorizontal: tokens.spacing.md }}>
                    <Row spacing="sm">
                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: tokens.colors.success.light }]}>
                                    <Ionicons name="stats-chart" size={20} color={tokens.colors.success.main} />
                                </View>
                                <Text style={styles.statValue}>{stats.percentage}%</Text>
                                <Text style={styles.statLabel}>Overall</Text>
                            </View>
                        </Card>

                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: tokens.colors.success.light }]}>
                                    <Ionicons name="checkmark-circle" size={20} color={tokens.colors.success.main} />
                                </View>
                                <Text style={styles.statValue}>{stats.present}</Text>
                                <Text style={styles.statLabel}>Present</Text>
                            </View>
                        </Card>

                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: tokens.colors.error.light }]}>
                                    <Ionicons name="close-circle" size={20} color={tokens.colors.error.main} />
                                </View>
                                <Text style={styles.statValue}>{stats.absent}</Text>
                                <Text style={styles.statLabel}>Absent</Text>
                            </View>
                        </Card>

                        <Card variant="glassmorphic" style={styles.statCard}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: tokens.colors.warning.light }]}>
                                    <Ionicons name="time" size={20} color={tokens.colors.warning.main} />
                                </View>
                                <Text style={styles.statValue}>{stats.late}</Text>
                                <Text style={styles.statLabel}>Late</Text>
                            </View>
                        </Card>
                    </Row>

                    {stats.total > 0 && (
                        <Card variant="glassmorphic" style={styles.chartCard}>
                            <View style={styles.chartContent}>
                                <Text style={styles.chartTitle}>Attendance Overview</Text>
                                <PieChart
                                    data={chartData}
                                    width={Dimensions.get('window').width - (tokens.spacing.md * 2) - tokens.spacing.lg}
                                    height={200}
                                    chartConfig={{
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    }}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                            </View>
                        </Card>
                    )}

                    {Object.keys(subjectStats).length > 0 && (
                        <Card variant="glassmorphic" style={styles.subjectCard}>
                            <View style={styles.subjectContent}>
                                <Text style={styles.subjectTitle}>Subject-wise Attendance</Text>
                                {Object.entries(subjectStats).map(([subject, data]) => {
                                    const percentage = ((data.present / data.total) * 100).toFixed(1);
                                    return (
                                        <View key={subject} style={styles.subjectRow}>
                                            <Text style={styles.subjectName}>{subject}</Text>
                                            <View style={styles.subjectStats}>
                                                <Text style={styles.subjectPercentage}>{percentage}%</Text>
                                                <Text style={styles.subjectCount}>
                                                    ({data.present}/{data.total})
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </Card>
                    )}

                    <Row spacing="sm">
                        {['all', 'present', 'absent', 'late'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
                                onPress={() => setFilterStatus(status)}
                                accessible
                                accessibilityRole="button"
                                accessibilityState={{ selected: filterStatus === status }}
                            >
                                <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Row>

                    <Stack spacing="sm">
                        {filteredAttendance.length === 0 ? (
                            <EmptyState
                                icon="calendar-blank"
                                title="No Records Found"
                                message={filterStatus === 'all'
                                    ? 'No attendance records in selected date range'
                                    : `No ${filterStatus} records in selected date range`}
                            />
                        ) : (
                            filteredAttendance.map((item) => (
                                <Card key={item.id} variant="default" style={styles.recordCard}>
                                    <View style={styles.recordContent}>
                                        <View style={styles.recordHeader}>
                                            <View style={styles.recordInfo}>
                                                <Text style={styles.recordSubject}>
                                                    {item.subjects?.name || 'Unknown Subject'}
                                                </Text>
                                                <Text style={styles.recordDate}>
                                                    {new Date(item.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                                <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                                    {item.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            ))
                        )}
                    </Stack>
                </Stack>
            </ScrollView>
        </View>
    );
}
