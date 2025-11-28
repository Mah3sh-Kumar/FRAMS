import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Title, Card, Text, Button, ActivityIndicator, SegmentedButtons, Menu, Divider, Surface, IconButton, Portal, Modal } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { fetchTeacherSubjects, fetchStudentsByClass, markAttendance } from '../../lib/database';
import DateRangePicker from '../../components/DateRangePicker';
import FilterBar from '../../components/FilterBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { supabase } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AttendanceManager() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [marking, setMarking] = useState<Record<string, boolean>>({}); // Loading state for individual buttons
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });
    const [bulkConfirmVisible, setBulkConfirmVisible] = useState(false);
    const [bulkAction, setBulkAction] = useState<'present' | 'absent' | null>(null);

    useEffect(() => {
        if (user) {
            loadSubjects();
        }
    }, [user]);

    useEffect(() => {
        if (selectedSubject) {
            loadStudents(selectedSubject.class_id);
            loadAttendanceStats();
        } else {
            setStudents([]);
        }
    }, [selectedSubject, selectedDate]);

    async function loadSubjects() {
        if (!user) return;
        setLoading(true);
        const { data, error } = await fetchTeacherSubjects(user.id);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubject(data[0]); // Auto-select first subject
            }
        }
        setLoading(false);
    }

    async function loadStudents(classId: string) {
        if (!classId) return;
        setLoading(true);
        const { data, error } = await fetchStudentsByClass(classId);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setStudents(data);
        }
        setLoading(false);
    }

    async function loadAttendanceStats() {
        if (!selectedSubject) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('attendance')
            .select('status')
            .eq('subject_id', selectedSubject.id)
            .eq('date', dateStr);

        if (!error && data) {
            const present = data.filter(a => a.status === 'present').length;
            const absent = data.filter(a => a.status === 'absent').length;
            const late = data.filter(a => a.status === 'late').length;
            setStats({ present, absent, late, total: data.length });
        }
    }

    async function handleMarkAttendance(studentId: string, status: 'present' | 'absent' | 'late') {
        if (!selectedSubject) return;

        setMarking(prev => ({ ...prev, [studentId]: true }));
        const date = selectedDate.toISOString().split('T')[0];

        const { error } = await markAttendance(studentId, selectedSubject.id, status, date);

        if (error) {
            Alert.alert('Error', error);
        } else {
            loadAttendanceStats();
        }
        setMarking(prev => ({ ...prev, [studentId]: false }));
    }

    async function handleBulkMark(status: 'present' | 'absent') {
        if (!selectedSubject || !students.length) return;
        
        setLoading(true);
        const date = selectedDate.toISOString().split('T')[0];
        const promises = students.map(student => 
            markAttendance(student.id, selectedSubject.id, status, date)
        );

        await Promise.all(promises);
        Alert.alert('Success', `Marked all students as ${status}`);
        loadAttendanceStats();
        setLoading(false);
        setBulkConfirmVisible(false);
    }

    async function exportAttendance() {
        if (!selectedSubject) return;
        
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('*, students(full_name, enrollment_number)')
                .eq('subject_id', selectedSubject.id)
                .order('date', { ascending: false });

            if (error) throw error;

            let csv = 'Date,Student Name,Enrollment,Status\n';
            data?.forEach(record => {
                csv += `${record.date},${record.students?.full_name},${record.students?.enrollment_number},${record.status}\n`;
            });

            const fileUri = `${(FileSystem as any).documentDirectory}attendance_export.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csv);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            Alert.alert('Error', 'Failed to export attendance');
        }
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchQuery || 
            student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading && !students.length) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <Title style={styles.title}>Attendance Manager</Title>

                {/* Subject Selector */}
                <View style={styles.selectorContainer}>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setMenuVisible(true)}
                                icon="chevron-down"
                            >
                                {selectedSubject ? `${selectedSubject.name} (${selectedSubject.classes?.name})` : 'Select Subject'}
                            </Button>
                        }
                    >
                        {subjects.map((subject) => (
                            <Menu.Item
                                key={subject.id}
                                onPress={() => {
                                    setSelectedSubject(subject);
                                    setMenuVisible(false);
                                }}
                                title={`${subject.name} - ${subject.classes?.name}`}
                            />
                        ))}
                    </Menu>
                </View>

                {/* Date Picker */}
                {selectedSubject && (
                    <View style={styles.dateContainer}>
                        <Button 
                            mode="outlined" 
                            icon="calendar"
                            onPress={() => {
                                // Simple date navigation
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() - 1);
                                setSelectedDate(newDate);
                            }}
                        >
                            Previous
                        </Button>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </Text>
                        <Button 
                            mode="outlined" 
                            icon="calendar"
                            onPress={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() + 1);
                                setSelectedDate(newDate);
                            }}
                        >
                            Next
                        </Button>
                    </View>
                )}

                {/* Statistics */}
                {selectedSubject && stats.total > 0 && (
                    <View style={styles.statsContainer}>
                        <Surface style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                            <Text style={styles.statValue}>{stats.present}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                        </Surface>
                        <Surface style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
                            <Text style={styles.statValue}>{stats.absent}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                        </Surface>
                        <Surface style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                            <Text style={styles.statValue}>{stats.late}</Text>
                            <Text style={styles.statLabel}>Late</Text>
                        </Surface>
                        <Surface style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </Surface>
                    </View>
                )}

                {/* Bulk Actions */}
                {selectedSubject && (
                    <View style={styles.bulkActions}>
                        <Button 
                            mode="contained" 
                            icon="check-all"
                            onPress={() => {
                                setBulkAction('present');
                                setBulkConfirmVisible(true);
                            }}
                            style={styles.bulkButton}
                        >
                            Mark All Present
                        </Button>
                        <Button 
                            mode="contained" 
                            icon="close-circle"
                            onPress={() => {
                                setBulkAction('absent');
                                setBulkConfirmVisible(true);
                            }}
                            buttonColor="#d32f2f"
                            style={styles.bulkButton}
                        >
                            Mark All Absent
                        </Button>
                        <IconButton 
                            icon="export" 
                            mode="contained"
                            onPress={exportAttendance}
                        />
                    </View>
                )}

                {/* Search */}
                {selectedSubject && (
                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="Search students..."
                    />
                )}

                <Divider style={{ marginVertical: 10 }} />

                {selectedSubject ? (
                    <FlatList
                        data={filteredStudents}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No students found.</Text>}
                        renderItem={({ item }) => (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.studentHeader}>
                                        <View>
                                            <Title style={styles.studentName}>{item.full_name}</Title>
                                            <Text style={styles.enrollment}>{item.enrollment_number}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionContainer}>
                                        <SegmentedButtons
                                            value=""
                                            onValueChange={(val) => handleMarkAttendance(item.id, val as any)}
                                            buttons={[
                                                {
                                                    value: 'present',
                                                    label: 'Present',
                                                    style: { backgroundColor: '#e8f5e9' },
                                                    showSelectedCheck: true
                                                },
                                                {
                                                    value: 'absent',
                                                    label: 'Absent',
                                                    style: { backgroundColor: '#ffebee' }
                                                },
                                                {
                                                    value: 'late',
                                                    label: 'Late',
                                                    style: { backgroundColor: '#fff3e0' }
                                                },
                                            ]}
                                            style={styles.segmentedButton}
                                        />
                                        {marking[item.id] && <ActivityIndicator size="small" style={{ marginLeft: 10 }} />}
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}>Please select a subject to load students.</Text>
                )}
            </ScrollView>

            <ConfirmDialog
                visible={bulkConfirmVisible}
                title="Bulk Mark Attendance"
                message={`Are you sure you want to mark all students as ${bulkAction}?`}
                onConfirm={() => bulkAction && handleBulkMark(bulkAction)}
                onCancel={() => setBulkConfirmVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    selectorContainer: {
        marginBottom: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 15,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    bulkActions: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 10,
        alignItems: 'center',
    },
    bulkButton: {
        flex: 1,
    },
    card: {
        marginBottom: 10,
        elevation: 2,
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    studentName: {
        fontSize: 18,
    },
    enrollment: {
        color: '#666',
        fontSize: 14,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    segmentedButton: {
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
        fontStyle: 'italic',
    },
});
