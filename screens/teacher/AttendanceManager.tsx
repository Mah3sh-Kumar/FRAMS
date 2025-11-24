import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Title, Card, Text, Button, ActivityIndicator, SegmentedButtons, Menu, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { fetchTeacherSubjects, fetchStudentsByClass, markAttendance } from '../../lib/database';

export default function AttendanceManager() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [marking, setMarking] = useState<Record<string, boolean>>({}); // Loading state for individual buttons
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        if (user) {
            loadSubjects();
        }
    }, [user]);

    useEffect(() => {
        if (selectedSubject) {
            loadStudents(selectedSubject.class_id);
        } else {
            setStudents([]);
        }
    }, [selectedSubject]);

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

    async function handleMarkAttendance(studentId: string, status: 'present' | 'absent' | 'late') {
        if (!selectedSubject) return;

        setMarking(prev => ({ ...prev, [studentId]: true }));
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const { error } = await markAttendance(studentId, selectedSubject.id, status, date);

        if (error) {
            Alert.alert('Error', error);
        } else {
            // Optional: Show success feedback (toast or icon change)
            // For now, we just stop loading
        }
        setMarking(prev => ({ ...prev, [studentId]: false }));
    }

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

            <Divider style={{ marginVertical: 10 }} />

            {selectedSubject ? (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text style={styles.emptyText}>No students found in this class.</Text>}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.studentHeader}>
                                    <Title style={styles.studentName}>{item.full_name}</Title>
                                    <Text style={styles.enrollment}>{item.enrollment_number}</Text>
                                </View>

                                <View style={styles.actionContainer}>
                                    <SegmentedButtons
                                        value="" // We don't track state locally for simplicity, just action triggers
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
