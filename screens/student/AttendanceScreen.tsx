import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { Title, Card, Text, Chip, IconButton, SegmentedButtons, Surface } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AnimatedCard from '../../components/AnimatedCard';
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
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 });

    useEffect(() => {
        fetchAttendance();
    }, []);

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
                        <View style={styles.emptyState}>
                            <IconButton icon="calendar-blank" size={64} iconColor={colors.text.secondary} />
                            <Text style={styles.emptyText}>
                                {filterStatus === 'all'
                                    ? 'No attendance records yet'
                                    : `No ${filterStatus} records`}
                            </Text>
                        </View>
                    ) : (
                        filteredAttendance.map((item) => (
                            <AnimatedCard key={item.id} style={styles.card}>
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.subjectName}>
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
    subjectName: {
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
});
