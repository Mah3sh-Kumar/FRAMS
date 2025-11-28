import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Title, TextInput, Button, SegmentedButtons, Card, Text, Menu, Portal, Modal, Divider, ActivityIndicator, Surface, IconButton, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchTeacherSubjects, fetchTeacherAssignments, fetchAssignmentSubmissions, gradeSubmission } from '../../lib/database';
import FilterBar from '../../components/FilterBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

export default function AssignmentManager() {
    const { user } = useAuth();
    const [tab, setTab] = useState('all');

    // Create Mode State
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [maxScore, setMaxScore] = useState('100');
    const [dueDate, setDueDate] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);

    // List Mode State
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [gradingSubmission, setGradingSubmission] = useState<any>(null);
    const [score, setScore] = useState('');
    const [remarks, setRemarks] = useState('');
    const [gradeLoading, setGradeLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadSubjects();
            loadAssignments();
        }
    }, [user]);

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
        if (!selectedSubject || !title || !maxScore) {
            return Alert.alert('Error', 'Subject, Title, and Max Score are required');
        }

        setCreateLoading(true);
        const dueDateValue = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const { error } = await supabase.from('assignments').insert({
            subject_id: selectedSubject.id,
            title,
            description,
            due_date: dueDateValue,
            max_score: parseFloat(maxScore),
        });

        if (error) Alert.alert('Error', error.message);
        else {
            Alert.alert('Success', 'Assignment created!');
            setTitle('');
            setDescription('');
            setMaxScore('100');
            setDueDate('');
            setSelectedSubject(null);
            setCreateModalVisible(false);
            loadAssignments();
        }
        setCreateLoading(false);
    }

    async function handleUpdateAssignment() {
        if (!editingAssignment) return;

        setCreateLoading(true);
        const { error } = await supabase
            .from('assignments')
            .update({
                title: editingAssignment.title,
                description: editingAssignment.description,
                max_score: parseFloat(editingAssignment.max_score),
                due_date: editingAssignment.due_date,
            })
            .eq('id', editingAssignment.id);

        if (error) Alert.alert('Error', error.message);
        else {
            Alert.alert('Success', 'Assignment updated!');
            setEditModalVisible(false);
            setEditingAssignment(null);
            loadAssignments();
        }
        setCreateLoading(false);
    }

    async function handleDeleteAssignment() {
        if (!assignmentToDelete) return;

        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', assignmentToDelete.id);

        if (error) Alert.alert('Error', error.message);
        else {
            Alert.alert('Success', 'Assignment deleted!');
            setDeleteConfirmVisible(false);
            setAssignmentToDelete(null);
            loadAssignments();
        }
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
            loadSubmissions(selectedAssignment.id);
        }
        setGradeLoading(false);
    }

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = !searchQuery ||
            a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.subjects?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (tab === 'all') return matchesSearch;
        if (tab === 'pending') {
            // Assignments with pending submissions
            return matchesSearch && new Date(a.due_date) > new Date();
        }
        if (tab === 'graded') {
            // Assignments past due date
            return matchesSearch && new Date(a.due_date) <= new Date();
        }
        return matchesSearch;
    });

    const submissionStats = {
        submitted: submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
        pending: submissions.filter(s => s.status === 'pending').length,
        avgScore: submissions.filter(s => s.score !== null).reduce((sum, s) => sum + (s.score || 0), 0) /
            Math.max(submissions.filter(s => s.score !== null).length, 1)
    };

    const renderAssignmentList = () => {
        if (selectedAssignment) {
            return (
                <View style={styles.tabContent}>
                    <Button icon="arrow-left" onPress={() => setSelectedAssignment(null)} style={{ marginBottom: 10 }}>
                        Back to Assignments
                    </Button>
                    <Title style={styles.subTitle}>{selectedAssignment.title} - Submissions</Title>

                    {/* Submission Statistics */}
                    <View style={styles.statsContainer}>
                        <Surface style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                            <Text style={styles.statValue}>{submissions.length}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </Surface>
                        <Surface style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                            <Text style={styles.statValue}>{submissionStats.submitted}</Text>
                            <Text style={styles.statLabel}>Submitted</Text>
                        </Surface>
                        <Surface style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                            <Text style={styles.statValue}>{submissionStats.pending}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </Surface>
                        <Surface style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
                            <Text style={styles.statValue}>{submissionStats.avgScore.toFixed(0)}</Text>
                            <Text style={styles.statLabel}>Avg Score</Text>
                        </Surface>
                    </View>

                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="Search students..."
                    />

                    {listLoading ? <ActivityIndicator /> : (
                        <FlatList
                            data={submissions.filter(s => 
                                !searchQuery || 
                                s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase())
                            )}
                            keyExtractor={item => item.id}
                            ListEmptyComponent={
                                <EmptyState icon="file-document-outline" message="No submissions yet" />
                            }
                            renderItem={({ item }) => (
                                <Card style={styles.card} onPress={() => {
                                    setGradingSubmission(item);
                                    setScore(item.score ? item.score.toString() : '');
                                    setRemarks(item.remarks || '');
                                }}>
                                    <Card.Content>
                                        <View style={styles.submissionHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Title>{item.student_name}</Title>
                                                <Text style={{ color: '#666' }}>Enrollment: {item.enrollment_number}</Text>
                                            </View>
                                            <Chip 
                                                icon={item.status === 'graded' ? 'check-circle' : 'clock-outline'}
                                                style={{ 
                                                    backgroundColor: item.status === 'graded' ? '#e8f5e9' : '#fff3e0' 
                                                }}
                                            >
                                                {item.status.toUpperCase()}
                                            </Chip>
                                        </View>
                                        {item.score !== null && (
                                            <Text style={{ fontWeight: 'bold', color: 'green', marginTop: 8 }}>
                                                Score: {item.score}/{selectedAssignment.max_score}
                                            </Text>
                                        )}
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
                <View style={styles.headerRow}>
                    <Title style={styles.subTitle}>Assignments</Title>
                    <Button 
                        mode="contained" 
                        icon="plus" 
                        onPress={() => setCreateModalVisible(true)}
                    >
                        Create
                    </Button>
                </View>

                <SegmentedButtons
                    value={tab}
                    onValueChange={setTab}
                    buttons={[
                        { value: 'all', label: 'All' },
                        { value: 'pending', label: 'Pending Review' },
                        { value: 'graded', label: 'Graded' },
                    ]}
                    style={styles.tabs}
                />

                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder="Search assignments..."
                />

                {listLoading ? <ActivityIndicator /> : (
                    <FlatList
                        data={filteredAssignments}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <EmptyState icon="book-open-variant" message="No assignments found" />
                        }
                        renderItem={({ item }) => (
                            <Card style={styles.card} onPress={() => setSelectedAssignment(item)}>
                                <Card.Content>
                                    <View style={styles.assignmentHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Title>{item.title}</Title>
                                            <Text style={{ color: '#666' }}>
                                                {item.subjects?.name} ({item.subjects?.classes?.name})
                                            </Text>
                                            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                                Due: {new Date(item.due_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.assignmentActions}>
                                            <IconButton 
                                                icon="pencil" 
                                                size={20}
                                                onPress={() => {
                                                    setEditingAssignment(item);
                                                    setEditModalVisible(true);
                                                }}
                                            />
                                            <IconButton 
                                                icon="delete" 
                                                size={20}
                                                iconColor="#d32f2f"
                                                onPress={() => {
                                                    setAssignmentToDelete(item);
                                                    setDeleteConfirmVisible(true);
                                                }}
                                            />
                                        </View>
                                    </View>
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
            {renderAssignmentList()}

            {/* Create Assignment Modal */}
            <Portal>
                <Modal 
                    visible={createModalVisible} 
                    onDismiss={() => setCreateModalVisible(false)} 
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView>
                        <Title style={{ marginBottom: 15 }}>Create New Assignment</Title>

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
                            label="Title *"
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
                        <TextInput
                            label="Max Score *"
                            value={maxScore}
                            onChangeText={setMaxScore}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            label="Due Date (YYYY-MM-DD)"
                            value={dueDate}
                            onChangeText={setDueDate}
                            placeholder="Leave empty for 7 days from now"
                            style={styles.input}
                        />

                        <View style={styles.modalActions}>
                            <Button onPress={() => setCreateModalVisible(false)} style={{ marginRight: 10 }}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleCreateAssignment} loading={createLoading}>
                                Create
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>

                {/* Edit Assignment Modal */}
                <Modal 
                    visible={editModalVisible} 
                    onDismiss={() => setEditModalVisible(false)} 
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView>
                        <Title style={{ marginBottom: 15 }}>Edit Assignment</Title>

                        <TextInput
                            label="Title"
                            value={editingAssignment?.title || ''}
                            onChangeText={(text) => setEditingAssignment({ ...editingAssignment, title: text })}
                            style={styles.input}
                        />
                        <TextInput
                            label="Description"
                            value={editingAssignment?.description || ''}
                            onChangeText={(text) => setEditingAssignment({ ...editingAssignment, description: text })}
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                        />
                        <TextInput
                            label="Max Score"
                            value={editingAssignment?.max_score?.toString() || ''}
                            onChangeText={(text) => setEditingAssignment({ ...editingAssignment, max_score: text })}
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <View style={styles.modalActions}>
                            <Button onPress={() => setEditModalVisible(false)} style={{ marginRight: 10 }}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleUpdateAssignment} loading={createLoading}>
                                Update
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>

                {/* Grade Submission Modal */}
                <Modal 
                    visible={!!gradingSubmission} 
                    onDismiss={() => setGradingSubmission(null)} 
                    contentContainerStyle={styles.modal}
                >
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

                    <View style={styles.modalActions}>
                        <Button onPress={() => setGradingSubmission(null)} style={{ marginRight: 10 }}>
                            Cancel
                        </Button>
                        <Button mode="contained" onPress={handleGrade} loading={gradeLoading}>
                            Submit Grade
                        </Button>
                    </View>
                </Modal>
            </Portal>

            <ConfirmDialog
                visible={deleteConfirmVisible}
                title="Delete Assignment"
                message={`Are you sure you want to delete "${assignmentToDelete?.title}"? This action cannot be undone.`}
                onConfirm={handleDeleteAssignment}
                onCancel={() => setDeleteConfirmVisible(false)}
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
    tabs: {
        marginBottom: 20,
    },
    tabContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    subTitle: {
        fontSize: 20,
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },
    card: {
        marginBottom: 10,
        elevation: 2,
    },
    assignmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    assignmentActions: {
        flexDirection: 'row',
    },
    submissionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
});
