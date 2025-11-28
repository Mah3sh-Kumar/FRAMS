import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Card, Avatar, Switch, Text, Paragraph } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/database';
import { uploadProfilePicture, uploadFaceRegistrationImage } from '../lib/storage';
import { colors, spacing, typography, shadows } from '../lib/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ImagePickerComponent from '../components/ImagePickerComponent';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { session, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
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
            setAvatarUrl(data.avatar_url || '');

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

    const handleImageSelected = async (uri: string) => {
        try {
            setUploadingImage(true);
            const userId = session?.user?.id;
            if (!userId) return;

            const url = await uploadProfilePicture(userId, uri);
            if (url) {
                setAvatarUrl(url);
                Alert.alert('Success', 'Profile picture updated successfully!');
            } else {
                Alert.alert('Error', 'Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'An error occurred while uploading');
        } finally {
            setUploadingImage(false);
        }
    };

const handleFaceRegistration = async (uri: string) => {
    try {
        setUploadingImage(true);
        const userId = session?.user?.id;
        if (!userId) return;

        const url = await uploadFaceRegistrationImage(userId, uri);
        if (url) {
            Alert.alert(
                'Success',
                'Face registration image uploaded. Please ask the admin to run the registration script.'
            );
        } else {
            Alert.alert('Error', 'Failed to upload face registration image');
        }
    } catch (error) {
        console.error('Error uploading face image:', error);
        Alert.alert('Error', 'An error occurred while uploading');
    } finally {
        setUploadingImage(false);
    }
};

if (loading) {
    return <LoadingSpinner />;
}

return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <ImagePickerComponent
                currentImageUrl={avatarUrl}
                onImageSelected={handleImageSelected}
                size={100}
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
                        <View style={styles.section}>
                            <Title style={styles.sectionTitle}>Face Recognition</Title>
                            <Paragraph style={styles.sectionDescription}>
                                Upload a clear photo of your face to enable automated attendance.
                            </Paragraph>
                            <ImagePickerComponent
                                currentImageUrl={undefined} // Don't show preview of face reg image here
                                onImageSelected={handleFaceRegistration}
                                size={60}
                            />
                        </View>
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
    section: {
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    sectionTitle: {
        fontSize: typography.fontSize.md,
        marginBottom: spacing.xs,
    },
    sectionDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.md,
    },
});
