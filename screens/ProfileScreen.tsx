import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, StatusBar, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/database';
import { uploadProfilePicture, uploadFaceRegistrationImage } from '../lib/storage';
import { useTheme } from '../lib/design-system/ThemeContext';
import LoadingSpinner from '../components/design-system/feedback/LoadingSpinner';
import Button from '../components/design-system/primitives/Button';
import Input from '../components/design-system/primitives/Input';
import ImagePickerComponent from '../components/ImagePickerComponent';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Profile'>;

export default function ProfileScreen(_props: Props) {
    const { session, role } = useAuth();
    const { tokens, getBackgroundColor, getSurfaceColor, getTextColor, getTextSecondaryColor, getRoleColor } = useTheme();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
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
                Alert.alert('Error', 'Error updating profile: ' + error);
            } else {
                Alert.alert('Success', 'Profile updated successfully!');
                setEditing(false);
                fetchProfile();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageSelected = async (uri: string) => {
        try {
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
        }
    };

const handleFaceRegistration = async (uri: string) => {
    try {
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
    }
};

if (loading) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: getBackgroundColor() }]}>
            <LoadingSpinner size="large" />
        </View>
    );
}

const roleColor = getRoleColor();
const headerColor = roleColor ? roleColor.main : tokens.colors.primary.main;

return (
    <View style={[styles.mainContainer, { backgroundColor: getBackgroundColor() }]}>
        <StatusBar 
            barStyle="light-content" 
            backgroundColor={headerColor} 
            translucent={false}
        />
        {/* Purple Header Section */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
            <View style={styles.avatarContainer}>
                <ImagePickerComponent
                    currentImageUrl={avatarUrl}
                    onImageSelected={handleImageSelected}
                    size={80}
                />
            </View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
            style={[styles.scrollContainer, { backgroundColor: getBackgroundColor() }]}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
        >
            {/* Personal Information Card */}
            <View style={styles.section}>
                <View style={[styles.card, { backgroundColor: getSurfaceColor() }]}>
                    <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Personal Information</Text>

                    <View style={styles.inputSpacing}>
                        <Input
                            label="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            disabled={!editing}
                        />
                    </View>

                    <View style={styles.inputSpacing}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={() => {}}
                            disabled={true}
                        />
                    </View>

                    {role === 'student' && (
                        <>
                            <View style={styles.inputSpacing}>
                                <Input
                                    label="Enrollment Number"
                                    value={enrollmentNumber}
                                    onChangeText={() => {}}
                                    disabled={true}
                                />
                            </View>
                            {branch && (
                                <View style={styles.inputSpacing}>
                                    <Input
                                        label="Branch"
                                        value={branch}
                                        onChangeText={() => {}}
                                        disabled={true}
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {role === 'teacher' && (
                        <View style={styles.inputSpacing}>
                            <Input
                                label="Department"
                                value={department}
                                onChangeText={setDepartment}
                                disabled={!editing}
                            />
                        </View>
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
                </View>
            </View>

            {/* Face Recognition Section (Students Only) */}
            {role === 'student' && (
                <View style={styles.section}>
                    <View style={[styles.card, { backgroundColor: getSurfaceColor() }]}>
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
                    </View>
                </View>
            )}
        </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: {
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderRadius: 50,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.95)',
        letterSpacing: 1,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    sectionDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    inputSpacing: {
        marginBottom: 10,
    },
    buttonContainer: {
        marginTop: 12,
    },
    buttonSpaced: {
        marginBottom: 12,
    },
    faceRegistrationContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
});
