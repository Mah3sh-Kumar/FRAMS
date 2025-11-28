import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView, Alert } from 'react-native';
import { Title, Card, Text, Chip, IconButton, SegmentedButtons, Button, Surface, Searchbar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AnimatedCard from '../../components/AnimatedCard';
import EmptyState from '../../components/EmptyState';
import CountdownTimer from '../../components/CountdownTimer';
import { colors, spacing, typography } from '../../lib/theme';

type Assignment = {
    id: string;
    assignment_id: string;
    status: 'pending' | 'submitted' | 'graded';
    score: number | null;
    remarks: string | null;
    submission_url: string | null;
    created_at: string;
    assignments: {
        title: string;
        description: string;
        due_date: string;
        max_score: number;
        subjects: {
            name: string;
        } | null;
    } | null;
};

export default function AssignmentScreen() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, []);

    async function fetchAssignments() {
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
                    .from('student_assignments')
                    .select('*, assignments(*, subjects(name))')
                    .eq('student_id', student.id)
                    .order('created_at', { ascending: false });

                if (error) console.error(error);
                else setAssignments(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function onRefresh() {
        setRefreshing(true);
        fetchAssignments();
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'pending': return colors.warning.main;
            case 'submitted': return colors.info.main;
            case 'graded': return colors.success.main;
            default: return colors.text.secondary;
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'pending': return 'clock-outline';
            case 'submitted': return 'file-check';
            case 'graded': return 'check-circle';
            default: return 'information';
        }
    }

    function isOverdue(dueDate: string, status: string) {
        return status === 'pending' && new Date(dueDate) < new Date();
    }

    const stats = {
        pending: assignments.filter(a => a.status === 'pending').length,
        submitted: assignments.filter(a => a.status === 'submitted').length,
        graded: assignments.filter(a => a.status === 'graded').length,
        total: assignments.length,
        avgScore: assignments.filter(a => a.score !== null).reduce((sum, a) => sum + (a.score || 0), 0) /
            Math.max(assignments.filter(a => a.score !== null).length, 1)
    };

    const filteredAssignments = assignments.filter(a => {
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        const matchesSearch = !searchQuery ||
            a.assignments?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.assignments?.subjects?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <LoadingSpinner text="Loading assignments..." />;

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Title style={styles.title}>My Assignments</Title>
                    <Text style={styles.subtitle}>Track your coursework</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <Surface style={[styles.statCard, { backgroundColor: colors.warning.main + '20' }]}>
                        <IconButton icon="clock-outline" size={28} iconColor={colors.warning.main} />
                        <Title style={styles.statValue}>{stats.pending}</Title>
                        <Text style={styles.statLabel}>Pending</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.info.main + '20' }]}>
                        <IconButton icon="file-check" size={28} iconColor={colors.info.main} />
                        <Title style={styles.statValue}>{stats.submitted}</Title>
                        <Text style={styles.statLabel}>Submitted</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.success.main + '20' }]}>
                        <IconButton icon="check-circle" size={28} iconColor={colors.success.main} />
                        <Title style={styles.statValue}>{stats.graded}</Title>
                        <Text style={styles.statLabel}>Graded</Text>
                    </Surface>

                    <Surface style={[styles.statCard, { backgroundColor: colors.primary.main + '20' }]}>
                        <IconButton icon="star" size={28} iconColor={colors.primary.main} />
                        <Title style={styles.statValue}>{stats.avgScore.toFixed(0)}</Title>
                        <Text style={styles.statLabel}>Avg Score</Text>
                    </Surface>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Search assignments..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        iconColor={colors.primary.main}
                    />
                </View>

                {/* Filter */}
                <View style={styles.filterContainer}>
                    <SegmentedButtons
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                        buttons={[
                            { value: 'all', label: 'All' },
                            { value: 'pending', label: 'Pending', icon: 'clock' },
                            { value: 'submitted', label: 'Submitted', icon: 'file-check' },
                            { value: 'graded', label: 'Graded', icon: 'check' },
                        ]}
                        style={styles.segmentedButtons}
                    />
                </View>

                {/* Assignments List */}
                <View style={styles.listContainer}>
                    {filteredAssignments.length === 0 ? (
                        <EmptyState
                            icon="book-open-variant"
                            message={searchQuery ? 'No assignments found' :
                                filterStatus === 'all' ? 'No assignments yet' :
                                    `No ${filterStatus} assignments`}
                        />
                    ) : (
                        filteredAssignments.map((item) => {
                            const assignment = item.assignments;
                            if (!assignment) return null;

                            const overdue = isOverdue(assignment.due_date, item.status);

                            return (
                                <AnimatedCard key={item.id} style={styles.card}>
                                    <Card.Content>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardTitleContainer}>
                                                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                                                <Text style={styles.subjectName}>
                                                    {assignment.subjects?.name || 'Unknown Subject'}
                                                </Text>
                                            </View>
                                            <Chip
                                                icon={getStatusIcon(item.status)}
                                                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                                                textStyle={{ color: getStatusColor(item.status), fontWeight: '600', fontSize: 11 }}
                                                compact
                                            >
                                                {item.status.toUpperCase()}
                                            </Chip>
                                        </View>

                                        {assignment.description && (
                                            <Text style={styles.description} numberOfLines={2}>
                                                {assignment.description}
                                            </Text>
                                        )}

                                        <View style={styles.cardFooter}>
                                            <View style={styles.dueDateContainer}>
                                                {item.status === 'pending' && !overdue ? (
                                                    <CountdownTimer dueDate={assignment.due_date} />
                                                ) : (
                                                    <>
                                                        <IconButton
                                                            icon={overdue ? "alert-circle" : "calendar"}
                                                            size={16}
                                                            iconColor={overdue ? colors.error.main : colors.text.secondary}
                                                            style={styles.iconButton}
                                                        />
                                                        <Text style={[
                                                            styles.dueDate,
                                                            overdue && styles.overdueText
                                                        ]}>
                                                            {overdue ? 'Overdue' : 'Completed'}
                                                        </Text>
                                                    </>
                                                )}
                                            </View>

                                            {item.status === 'graded' && item.score !== null && (
                                                <Chip
                                                    icon="star"
                                                    style={[styles.scoreChip, { backgroundColor: colors.success.light + '30' }]}
                                                    textStyle={{ color: colors.success.dark, fontWeight: '700' }}
                                                >
                                                    {item.score}/{assignment.max_score}
                                                </Chip>
                                            )}

                                            {item.status === 'pending' && (
                                                <Button
                                                    mode="contained"
                                                    compact
                                                    onPress={() => Alert.alert('Submit', 'Submission interface coming soon!')}
                                                    buttonColor={colors.primary.main}
                                                    icon="upload"
                                                    style={styles.submitButton}
                                                >
                                                    Submit
                                                </Button>
                                            )}
                                        </View>
                                    </Card.Content>
                                </AnimatedCard>
                            );
                        })
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
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: -spacing.xs,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs / 2,
    },
    searchContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    searchBar: {
        elevation: 2,
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
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: spacing.sm,
    },
    assignmentTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    subjectName: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    statusChip: {
        height: 28,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        margin: 0,
        marginRight: -8,
    },
    dueDate: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    overdueText: {
        color: colors.error.main,
        fontWeight: typography.fontWeight.semibold,
    },
    scoreChip: {
        height: 28,
    },
    submitButton: {
        borderRadius: 8,
    },
});
