import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/database';
import { uploadProfilePicture, uploadFaceRegistrationImage } from '../lib/storage';
import { useTheme } from '../lib/design-system/ThemeContext';
import LoadingSpinner from '../components/design-system/feedback/LoadingSpinner';
import Button from '../components/design-system/primitives/Button';
import Input from '../components/design-system/primitives/Input';
import Card from '../components/design-system/primitives/Card';
import ImagePickerComponent from '../components/ImagePickerComponent';
import { LinearGradient } from 'expo-linear-gradient';
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
                    students!students_user_id_fkey(*),
                    teachers!teachers_id_fkey(*)
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

const { tokens, getBackgroundColor, getSurfaceColor, getTextColor, getTextSecondaryColor, getRoleColor } = useTheme();

if (loading) {
    return <LoadingSpinner />;
}

const roleColor = getRoleColor();
const gradientColors = roleColor ? roleColor.gradient : tokens.colors.primary.gradient;

return (
    <ScrollView 
        style={[styles.container, { backgroundColor: getBackgroundColor() }]}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
    >
        {/* Gradient Profile Header */}
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
        >
            <View style={styles.avatarContainer}>
                <ImagePickerComponent
                    currentImageUrl={avatarUrl}
                    onImageSelected={handleImageSelected}
                    size={100}
                />
            </View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
        </LinearGradient>

        {/* Personal Information Card */}
        <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Personal Information</Text>

            <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                disabled={!editing}
            />

            <Input
                label="Email"
                value={email}
                onChangeText={() => {}}
                disabled={true}
            />

            {role === 'student' && (
                <>
                    <Input
                        label="Enrollment Number"
                        value={enrollmentNumber}
                        onChangeText={() => {}}
                        disabled={true}
                    />
                    {branch && (
                        <Input
                            label="Branch"
                            value={branch}
                            onChangeText={() => {}}
                            disabled={true}
                        />
                    )}
                </>
            )}

            {role === 'teacher' && (
                <Input
                    label="Department"
                    value={department}
                    onChangeText={setDepartment}
                    disabled={!editing}
                />
            )}

            <View style={styles.buttonContainer}>
                {!editing ? (
                    <Button
                        variant="primary"
                        onPress={() => setEditing(true)}
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="primary"
                            onPress={handleSave}
                            loading={saving}
                            disabled={saving}
                            style={styles.buttonSpaced}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="secondary"
                            onPress={() => {
                                setEditing(false);
                                fetchProfile();
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    </>
                )}
            </View>
        </Card>

        {/* Face Recognition Section (Students Only) */}
        {role === 'student' && (
            <Card style={styles.card}>
                <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Face Recognition</Text>
                <Text style={[styles.sectionDescription, { color: getTextSecondaryColor() }]}>
                    Upload a clear photo of your face to enable automated attendance.
                </Text>
                <View style={styles.faceRegistrationContainer}>
                    <ImagePickerComponent
                        currentImageUrl={undefined}
                        onImageSelected={handleFaceRegistration}
                        size={60}
                    />
                </View>
            </Card>
        )}
    </ScrollView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    avatarContainer: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderRadius: 50,
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: 1,
    },
    card: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    sectionDescription: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    buttonContainer: {
        marginTop: 8,
    },
    buttonSpaced: {
        marginBottom: 12,
    },
    faceRegistrationContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
});
