import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, Dimensions } from 'react-native';
import { Title, Button, Card, ActivityIndicator, Text, Surface, IconButton, Chip, Menu, SegmentedButtons } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { fetchTeacherAssignments, fetchAssignmentSubmissions } from '../../lib/database';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import FilterBar from '../../components/FilterBar';
import DateRangePicker from '../../components/DateRangePicker';
import ChartCard from '../../components/ChartCard';
import EmptyState from '../../components/EmptyState';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function MarksReviewManager() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('date');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        end: new Date(),
    });

    useEffect(() => {
        if (user?.id) {
            loadSubjects();
            loadData();
        }
    }, [user, dateRange]);

    const loadSubjects = async () => {
        const { data, error } = await supabase
            .from('subjects')
            .select('id, name')
            .eq('teacher_id', user!.id);
        
        if (!error && data) {
            setSubjects(data);
        }
    };

    const loadData = async () => {
        setLoading(true);
        
        const { data: assignmentsData, error: assignmentsError } = await fetchTeacherAssignments(user!.id);
        if (!assignmentsError && assignmentsData) {
            const allSubmissions: any[] = [];
            for (const assignment of assignmentsData) {
                const { data: subs } = await fetchAssignmentSubmissions(assignment.id);
                if (subs) {
                    allSubmissions.push(...subs.map(s => ({
                        ...s,
                        assignment_title: assignment.title,
                        subject_name: assignment.subjects?.name,
                        subject_id: assignment.subject_id,
                        max_score: assignment.max_score,
                    })));
                }
            }
            setSubmissions(allSubmissions);
        }
        
        setLoading(false);
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch = !searchQuery ||
            s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSubject = selectedSubject === 'all' || s.subject_id === selectedSubject;
        const submissionDate = new Date(s.created_at);
        const matchesDateRange = submissionDate >= dateRange.start && submissionDate <= dateRange.end;
        
        return matchesSearch && matchesSubject && matchesDateRange && s.score !== null;
    });

    const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.student_name || '').localeCompare(b.student_name || '');
            case 'score':
                return (b.score || 0) - (a.score || 0);
            case 'date':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            default:
                return 0;
        }
    });

    const gradeDistribution = {
        'A': filteredSubmissions.filter(s => s.score >= 90).length,
        'B': filteredSubmissions.filter(s => s.score >= 80 && s.score < 90).length,
        'C': filteredSubmissions.filter(s => s.score >= 70 && s.score < 80).length,
        'D': filteredSubmissions.filter(s => s.score >= 60 && s.score < 70).length,
        'F': filteredSubmissions.filter(s => s.score < 60).length,
    };

    const chartData = {
        labels: ['A', 'B', 'C', 'D', 'F'],
        datasets: [{
            data: [
                gradeDistribution['A'],
                gradeDistribution['B'],
                gradeDistribution['C'],
                gradeDistribution['D'],
                gradeDistribution['F'],
            ]
        }]
    };

    const stats = {
        totalGraded: filteredSubmissions.length,
        avgScore: filteredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(filteredSubmissions.length, 1),
        highestScore: Math.max(...filteredSubmissions.map(s => s.score || 0), 0),
        lowestScore: filteredSubmissions.length > 0 ? Math.min(...filteredSubmissions.map(s => s.score || 0)) : 0,
    };

    const exportToCSV = async () => {
        try {
            let csv = 'Student Name,Enrollment,Assignment,Subject,Score,Max Score,Percentage,Date\n';
            sortedSubmissions.forEach(s => {
                const percentage = ((s.score / s.max_score) * 100).toFixed(1);
                csv += `${s.student_name},${s.enrollment_number},${s.assignment_title},${s.subject_name},${s.score},${s.max_score},${percentage}%,${new Date(s.created_at).toLocaleDateString()}\n`;
            });

            const fileUri = `${(FileSystem as any).documentDirectory}marks_export.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csv);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            Alert.alert('Error', 'Failed to export data');
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Loading marks...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Marks & Reviews</Title>
                <IconButton icon="export" mode="contained" onPress={exportToCSV} />
            </View>

            <View style={styles.statsContainer}>
                <Surface style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                    <Text style={styles.statValue}>{stats.totalGraded}</Text>
                    <Text style={styles.statLabel}>Total Graded</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
                    <Text style={styles.statValue}>{stats.avgScore.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                    <Text style={styles.statValue}>{stats.highestScore}</Text>
                    <Text style={styles.statLabel}>Highest</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
                    <Text style={styles.statValue}>{stats.lowestScore}</Text>
                    <Text style={styles.statLabel}>Lowest</Text>
                </Surface>
            </View>

            {filteredSubmissions.length > 0 && (
                <ChartCard title="Grade Distribution">
                    <BarChart
                        data={chartData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </ChartCard>
            )}

            <View style={styles.filtersContainer}>
                <Menu
                    visible={subjectMenuVisible}
                    onDismiss={() => setSubjectMenuVisible(false)}
                    anchor={
                        <Button mode="outlined" onPress={() => setSubjectMenuVisible(true)} icon="book">
                            {selectedSubject === 'all' ? 'All Subjects' : subjects.find(s => s.id === selectedSubject)?.name}
                        </Button>
                    }
                >
                    <Menu.Item onPress={() => { setSelectedSubject('all'); setSubjectMenuVisible(false); }} title="All Subjects" />
                    {subjects.map(subject => (
                        <Menu.Item key={subject.id} onPress={() => { setSelectedSubject(subject.id); setSubjectMenuVisible(false); }} title={subject.name} />
                    ))}
                </Menu>
            </View>

            <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onStartDateChange={(date: Date) => setDateRange({ ...dateRange, start: date })}
                onEndDateChange={(date: Date) => setDateRange({ ...dateRange, end: date })}
            />

            <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search students..." />

            <SegmentedButtons
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
                buttons={[
                    { value: 'date', label: 'Date', icon: 'calendar' },
                    { value: 'name', label: 'Name', icon: 'account' },
                    { value: 'score', label: 'Score', icon: 'star' },
                ]}
                style={styles.sortButtons}
            />

            {sortedSubmissions.length === 0 ? (
                <EmptyState icon="file-document-outline" title="No graded submissions found" />
            ) : (
                <FlatList
                    data={sortedSubmissions}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                        const percentage = ((item.score / item.max_score) * 100).toFixed(0);
                        return (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.submissionHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.studentName}>{item.student_name}</Text>
                                            <Text style={styles.enrollmentText}>{item.enrollment_number}</Text>
                                            <Text style={styles.assignmentText}>{item.assignment_title}</Text>
                                            <Text style={styles.subjectText}>{item.subject_name}</Text>
                                        </View>
                                        <View style={styles.scoreContainer}>
                                            <Chip icon="star" style={{ backgroundColor: item.score >= 80 ? '#e8f5e9' : item.score >= 60 ? '#fff3e0' : '#ffebee' }}>
                                                {item.score}/{item.max_score}
                                            </Chip>
                                            <Text style={styles.percentageText}>{percentage}%</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.dateText}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </Text>
                                </Card.Content>
                            </Card>
                        );
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 24 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statsContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    statCard: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', elevation: 2 },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: '#666', marginTop: 4 },
    filtersContainer: { marginVertical: 10 },
    sortButtons: { marginVertical: 10 },
    card: { marginBottom: 10, elevation: 2 },
    submissionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    studentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    enrollmentText: { fontSize: 12, color: '#666', marginTop: 2 },
    assignmentText: { fontSize: 14, color: '#333', marginTop: 4 },
    subjectText: { fontSize: 12, color: '#999', marginTop: 2 },
    scoreContainer: { alignItems: 'flex-end' },
    percentageText: { fontSize: 12, color: '#666', marginTop: 4 },
    dateText: { fontSize: 11, color: '#999', marginTop: 4 },
});
