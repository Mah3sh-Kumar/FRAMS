import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, Card, Avatar, Switch, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/database';
import { colors, spacing, typography, shadows } from '../lib/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { session, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [branch, setBranch] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userId = session?.user?.id;
            if (!userId) return;

            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    students (*),
                    teachers (*)
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            setFullName(data.full_name || '');
            setEmail(data.email || '');

            if (role === 'student' && data.students) {
                setEnrollmentNumber(data.students.enrollment_number || '');
                setBranch(data.students.branch || '');
            } else if (role === 'teacher' && data.teachers) {
                setDepartment(data.teachers.department || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const userId = session?.user?.id;
            if (!userId) return;

            const updates: any = {
                full_name: fullName,
            };

            if (role === 'teacher') {
                updates.department = department;
            }

            const { error } = await updateUserProfile(userId, updates);

            if (error) {
                alert('Error updating profile: ' + error);
            } else {
                alert('Profile updated successfully!');
                setEditing(false);
                fetchProfile();
            }
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={fullName.substring(0, 2).toUpperCase()}
                    style={styles.avatar}
                />
                <Title style={styles.name}>{fullName}</Title>
                <Text style={styles.role}>{role?.toUpperCase()}</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Personal Information</Title>

                    <TextInput
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        disabled={!editing}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="Email"
                        value={email}
                        disabled={true}
                        mode="outlined"
                        style={styles.input}
                    />

                    {role === 'student' && (
                        <>
                            <TextInput
                                label="Enrollment Number"
                                value={enrollmentNumber}
                                disabled={true}
                                mode="outlined"
                                style={styles.input}
                            />
                            {branch && (
                                <TextInput
                                    label="Branch"
                                    value={branch}
                                    disabled={true}
                                    mode="outlined"
                                    style={styles.input}
                                />
                            )}
                        </>
                    )}

                    {role === 'teacher' && (
                        <TextInput
                            label="Department"
                            value={department}
                            onChangeText={setDepartment}
                            disabled={!editing}
                            mode="outlined"
                            style={styles.input}
                        />
                    )}

                    <View style={styles.buttonContainer}>
                        {!editing ? (
                            <Button
                                mode="contained"
                                onPress={() => setEditing(true)}
                                style={styles.button}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    mode="contained"
                                    onPress={handleSave}
                                    loading={saving}
                                    disabled={saving}
                                    style={[styles.button, styles.buttonSpaced]}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        setEditing(false);
                                        fetchProfile();
                                    }}
                                    disabled={saving}
                                    style={styles.button}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: colors.background.paper,
        ...shadows.sm,
    },
    avatar: {
        backgroundColor: colors.primary.main,
        marginBottom: spacing.md,
    },
    name: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
    },
    role: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium,
    },
    card: {
        margin: spacing.md,
        ...shadows.md,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: colors.background.paper,
    },
    buttonContainer: {
        marginTop: spacing.md,
    },
    button: {
        marginVertical: spacing.xs,
    },
    buttonSpaced: {
        marginBottom: spacing.sm,
    },
});
