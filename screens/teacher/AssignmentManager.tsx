import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Title, TextInput, Button, SegmentedButtons, Card, Text, Menu, Portal, Modal, Divider, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchTeacherSubjects, fetchTeacherAssignments, fetchAssignmentSubmissions, gradeSubmission } from '../../lib/database';

export default function AssignmentManager() {
    const { user } = useAuth();
    const [tab, setTab] = useState('create');

    // Create Mode State
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Grade Mode State
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [gradingSubmission, setGradingSubmission] = useState<any>(null); // Submission being graded
    const [score, setScore] = useState('');
    const [remarks, setRemarks] = useState('');
    const [gradeLoading, setGradeLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadSubjects();
            if (tab === 'grade') {
                loadAssignments();
            }
        }
    }, [user, tab]);

    useEffect(() => {
        if (selectedAssignment) {
            loadSubmissions(selectedAssignment.id);
        }
    }, [selectedAssignment]);

    async function loadSubjects() {
        if (!user) return;
        const { data, error } = await fetchTeacherSubjects(user.id);
        if (!error) setSubjects(data);
    }

    async function loadAssignments() {
        if (!user) return;
        setListLoading(true);
        const { data, error } = await fetchTeacherAssignments(user.id);
        if (error) Alert.alert('Error', error);
        else setAssignments(data);
        setListLoading(false);
    }

    async function loadSubmissions(assignmentId: string) {
        setListLoading(true);
        const { data, error } = await fetchAssignmentSubmissions(assignmentId);
        if (error) Alert.alert('Error', error);
        else setSubmissions(data);
        setListLoading(false);
    }

    async function handleCreateAssignment() {
        if (!selectedSubject || !title) return Alert.alert('Error', 'Subject and Title are required');

        setCreateLoading(true);
        const { error } = await supabase.from('assignments').insert({
            subject_id: selectedSubject.id,
            title,
            description,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week default
        });

        if (error) Alert.alert('Error', error.message);
        else {
            Alert.alert('Success', 'Assignment created!');
            setTitle('');
            setDescription('');
            setSelectedSubject(null);
        }
        setCreateLoading(false);
    }

    async function handleGrade() {
        if (!gradingSubmission || !score) return;

        setGradeLoading(true);
        const { error } = await gradeSubmission(gradingSubmission.id, parseFloat(score), remarks);

        if (error) Alert.alert('Error', error);
        else {
            Alert.alert('Success', 'Graded successfully');
            setGradingSubmission(null);
            setScore('');
            setRemarks('');
            loadSubmissions(selectedAssignment.id); // Refresh list
        }
        setGradeLoading(false);
    }

    const renderCreateTab = () => (
        <ScrollView style={styles.tabContent}>
            <Title style={styles.subTitle}>Create New Assignment</Title>

            <View style={styles.inputContainer}>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                            style={styles.input}
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

                <TextInput
                    label="Title"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                />
                <TextInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                />
                <Button
                    mode="contained"
                    onPress={handleCreateAssignment}
                    loading={createLoading}
                    style={styles.button}
                >
                    Create Assignment
                </Button>
            </View>
        </ScrollView>
    );

    const renderGradeTab = () => {
        if (selectedAssignment) {
            return (
                <View style={styles.tabContent}>
                    <Button icon="arrow-left" onPress={() => setSelectedAssignment(null)}>Back to Assignments</Button>
                    <Title style={styles.subTitle}>{selectedAssignment.title} - Submissions</Title>

                    {listLoading ? <ActivityIndicator /> : (
                        <FlatList
                            data={submissions}
                            keyExtractor={item => item.id}
                            ListEmptyComponent={<Text style={styles.emptyText}>No submissions yet.</Text>}
                            renderItem={({ item }) => (
                                <Card style={styles.card} onPress={() => {
                                    setGradingSubmission(item);
                                    setScore(item.score ? item.score.toString() : '');
                                    setRemarks(item.remarks || '');
                                }}>
                                    <Card.Content>
                                        <Title>{item.student_name}</Title>
                                        <Text>Enrollment: {item.enrollment_number}</Text>
                                        <Text>Status: {item.status}</Text>
                                        {item.score && <Text style={{ fontWeight: 'bold', color: 'green' }}>Score: {item.score}</Text>}
                                    </Card.Content>
                                </Card>
                            )}
                        />
                    )}
                </View>
            );
        }

        return (
            <View style={styles.tabContent}>
                <Title style={styles.subTitle}>Select Assignment to Grade</Title>
                {listLoading ? <ActivityIndicator /> : (
                    <FlatList
                        data={assignments}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={<Text style={styles.emptyText}>No assignments found.</Text>}
                        renderItem={({ item }) => (
                            <Card style={styles.card} onPress={() => setSelectedAssignment(item)}>
                                <Card.Content>
                                    <Title>{item.title}</Title>
                                    <Text>{item.subjects?.name} ({item.subjects?.classes?.name})</Text>
                                    <Text style={{ fontSize: 12, color: '#666' }}>Due: {item.due_date}</Text>
                                </Card.Content>
                            </Card>
                        )}
                    />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SegmentedButtons
                value={tab}
                onValueChange={setTab}
                buttons={[
                    { value: 'create', label: 'Create' },
                    { value: 'grade', label: 'Grade' },
                ]}
                style={styles.tabs}
            />

            {tab === 'create' ? renderCreateTab() : renderGradeTab()}

            <Portal>
                <Modal visible={!!gradingSubmission} onDismiss={() => setGradingSubmission(null)} contentContainerStyle={styles.modal}>
                    <Title>Grade Submission</Title>
                    <Text style={{ marginBottom: 10 }}>Student: {gradingSubmission?.student_name}</Text>

                    <TextInput
                        label="Score"
                        value={score}
                        onChangeText={setScore}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <TextInput
                        label="Remarks"
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                        style={styles.input}
                    />

                    <Button mode="contained" onPress={handleGrade} loading={gradeLoading}>
                        Submit Grade
                    </Button>
                    <Button onPress={() => setGradingSubmission(null)} style={{ marginTop: 10 }}>
                        Cancel
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    tabs: {
        marginBottom: 20,
    },
    tabContent: {
        flex: 1,
    },
    subTitle: {
        fontSize: 20,
        marginBottom: 15,
    },
    inputContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        elevation: 2,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 10,
    },
    card: {
        marginBottom: 10,
        elevation: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
        fontStyle: 'italic',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    }
});
