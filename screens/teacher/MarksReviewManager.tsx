import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Title, Button, TextInput, List, Divider, ActivityIndicator, Text } from 'react-native-paper';
import { fetchTeacherAssignments, fetchAssignmentSubmissions, gradeSubmission } from '../../lib/database';
import { useAuth } from '../../context/AuthContext';

export default function MarksReviewManager() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (user?.id) loadAssignments();
    }, [user]);

    const loadAssignments = async () => {
        setLoading(true);
        const { data, error } = await fetchTeacherAssignments(user!.id);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setAssignments(data);
        }
        setLoading(false);
    };

    const loadSubmissions = async (assignmentId: string) => {
        setLoading(true);
        const { data, error } = await fetchAssignmentSubmissions(assignmentId);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setSubmissions(data);
        }
        setLoading(false);
    };

    const handleGrade = async (submissionId: string) => {
        const numericScore = Number(score);
        if (isNaN(numericScore)) {
            Alert.alert('Invalid score', 'Please enter a valid number');
            return;
        }
        const { error } = await gradeSubmission(submissionId, numericScore, remarks);
        if (error) {
            Alert.alert('Error', error);
        } else {
            Alert.alert('Success', 'Submission graded');
            // Refresh submissions
            if (selectedAssignment) loadSubmissions(selectedAssignment);
        }
        setScore('');
        setRemarks('');
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Marks & Reviews</Title>
            {selectedAssignment ? (
                <View style={styles.submissionContainer}>
                    <Button mode="outlined" onPress={() => setSelectedAssignment(null)} style={styles.backButton}>
                        Back to Assignments
                    </Button>
                    <FlatList
                        data={submissions}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={Divider}
                        renderItem={({ item }) => (
                            <List.Item
                                title={`Student: ${item.student_name}`}
                                description={`Enrollment: ${item.enrollment_number} | Score: ${item.score ?? 'N/A'}`}
                                onPress={() => {
                                    // Prompt for grading
                                    Alert.prompt(
                                        'Grade Submission',
                                        `Enter score and remarks for ${item.student_name}`,
                                        [
                                            {
                                                text: 'Cancel',
                                                style: 'cancel',
                                            },
                                            {
                                                text: 'Submit',
                                                onPress: () => handleGrade(item.id),
                                            },
                                        ],
                                        'plain-text',
                                        '',
                                        'numeric'
                                    );
                                }}
                            />
                        )}
                    />
                </View>
            ) : (
                <FlatList
                    data={assignments}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={Divider}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.title}
                            description={item.description}
                            onPress={() => {
                                setSelectedAssignment(item.id);
                                loadSubmissions(item.id);
                            }}
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { marginBottom: 10 },
    submissionContainer: { flex: 1 },
});
