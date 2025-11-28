import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Title, Card, Text, Chip, IconButton, SegmentedButtons, Surface } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AnimatedCard from '../../components/AnimatedCard';
import EmptyState from '../../components/EmptyState';
import ChartCard from '../../components/ChartCard';
import DateRangePicker from '../../components/DateRangePicker';
import { colors, spacing, typography } from '../../lib/theme';

type AttendanceRecord = {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    subjects: { name: string } | null;
};

export default function AttendanceScreen() {
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

        // Calculate subject-wise stats
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
            case 'present': return colors.success.main;
            case 'absent': return colors.error.main;
            case 'late': return colors.warning.main;
            default: return colors.text.secondary;
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'present': return 'check-circle';
            case 'absent': return 'close-circle';
            case 'late': return 'clock-alert';
            default: return 'information';
        }
    }

    const filteredAttendance = filterStatus === 'all'
        ? attendance
        : attendance.filter(a => a.status === filterStatus);

    // Prepare pie chart data
    const chartData = [
        {
            name: 'Present',
            population: stats.present,
            color: colors.success.main,
            legendFontColor: colors.text.primary,
            legendFontSize: 12,
        },
        {
            name: 'Absent',
            population: stats.absent,
            color: colors.error.main,
            legendFontColor: colors.text.primary,
            legendFontSize: 12,
        },
        {
            name: 'Late',
            population: stats.late,
            color: colors.warning.main,
            legendFontColor: colors.text.primary,
            legendFontSize: 12,
        },
    ].filter(item => item.population > 0); // Only show non-zero categories

    if (loading) return <LoadingSpinner text="Loading attendance..." />;

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Title style={styles.title}>My Attendance</Title>
                    <Text style={styles.subtitle}>Track your class attendance</Text>
                </View>

                {/* Date Range Picker */}
                <View style={styles.dateRangeContainer}>
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onStartDateChange={(date: Date) => setDateRange({ ...dateRange, start: date })}
                        onEndDateChange={(date: Date) => setDateRange({ ...dateRange, end: date })}
                    />
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <Surface style={[styles.statCard, { backgroundColor: colors.success.light + '20' }]}>
                        <IconButton icon="chart-arc" size={32} iconColor={colors.success.main} />
                        <Title style={[styles.statValue, { color: colors.success.main }]}>
                            {stats.percentage}%
                        </Title>
                        <Text style={styles.statLabel}>Overall</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.success.main + '20' }]}>
                        <IconButton icon="check-circle" size={28} iconColor={colors.success.main} />
                        <Title style={styles.statValue}>{stats.present}</Title>
                        <Text style={styles.statLabel}>Present</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.error.main + '20' }]}>
                        <IconButton icon="close-circle" size={28} iconColor={colors.error.main} />
                        <Title style={styles.statValue}>{stats.absent}</Title>
                        <Text style={styles.statLabel}>Absent</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.warning.main + '20' }]}>
                        <IconButton icon="clock-alert" size={28} iconColor={colors.warning.main} />
                        <Title style={styles.statValue}>{stats.late}</Title>
                        <Text style={styles.statLabel}>Late</Text>
                    </Surface>
                </View>

                {/* Pie Chart */}
                {stats.total > 0 && (
                    <ChartCard title="Attendance Overview">
                        <PieChart
                            data={chartData}
                            width={Dimensions.get('window').width - 64}
                            height={200}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </ChartCard>
                )}

                {/* Subject-wise Breakdown */}
                {Object.keys(subjectStats).length > 0 && (
                    <Card style={styles.subjectCard}>
                        <Card.Content>
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
                        </Card.Content>
                    </Card>
                )}

                {/* Filter */}
                <View style={styles.filterContainer}>
                    <SegmentedButtons
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                        buttons={[
                            { value: 'all', label: 'All' },
                            { value: 'present', label: 'Present', icon: 'check' },
                            { value: 'absent', label: 'Absent', icon: 'close' },
                            { value: 'late', label: 'Late', icon: 'clock' },
                        ]}
                        style={styles.segmentedButtons}
                    />
                </View>

                {/* Attendance List */}
                <View style={styles.listContainer}>
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
                            <AnimatedCard key={item.id} style={styles.card}>
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.subjectNameText}>
                                                {item.subjects?.name || 'Unknown Subject'}
                                            </Text>
                                            <Text style={styles.dateText}>
                                                {new Date(item.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Text>
                                        </View>
                                        <Chip
                                            icon={getStatusIcon(item.status)}
                                            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                                            textStyle={{ color: getStatusColor(item.status), fontWeight: '600' }}
                                        >
                                            {item.status.toUpperCase()}
                                        </Chip>
                                    </View>
                                </Card.Content>
                            </AnimatedCard>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
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
    dateRangeContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: -spacing.xs,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs / 2,
    },
    subjectCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        elevation: 2,
    },
    subjectTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    subjectRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    subjectName: {
        fontSize: typography.fontSize.md,
        color: colors.text.primary,
        flex: 1,
    },
    subjectStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    subjectPercentage: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary.main,
    },
    subjectCount: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    filterContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    segmentedButtons: {
        borderRadius: 8,
    },
    listContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    card: {
        marginBottom: spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    subjectNameText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    statusChip: {
        marginLeft: spacing.sm,
    },
});
