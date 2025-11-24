import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useAuth, SignUpPayload } from '../context/AuthContext';
import { fetchClasses, checkEnrollmentNumberUnique } from '../lib/database';
import { DEPARTMENTS, CLASS_LEVELS, BRANCHES } from '../lib/constants';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'SignUp'>;

interface Class {
    id: string;
    name: string;
    academic_year: string;
}

export default function SignUpScreen({ navigation }: Props) {
    const { signUp, loading: authLoading } = useAuth();

    // Form state
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Student-specific
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [classLevel, setClassLevel] = useState(CLASS_LEVELS[0].value);
    const [branch, setBranch] = useState(BRANCHES[0]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classesError, setClassesError] = useState('');

    // Teacher-specific
    const [department, setDepartment] = useState(DEPARTMENTS[0]);

    // UI state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // No need to load classes from database anymore - using predefined CLASS_LEVELS

    // Validation
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateForm = async (): Promise<boolean> => {
        const newErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (role === 'student') {
            if (!enrollmentNumber.trim()) {
                newErrors.enrollmentNumber = 'Enrollment number is required';
            } else {
                // Check uniqueness
                const isUnique = await checkEnrollmentNumberUnique(enrollmentNumber);
                if (!isUnique) {
                    newErrors.enrollmentNumber = 'This enrollment number is already registered';
                }
            }

            if (classLevel.startsWith('grad_year') && !branch.trim()) {
                newErrors.branch = 'Branch is required for graduation students';
            }
        }

        if (role === 'teacher' && !department.trim()) {
            newErrors.department = 'Department is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        console.log('🔵 handleSignUp started');
        console.log('🔵 Current role:', role);
        console.log('🔵 Department:', department);

        try {
            const isValid = await validateForm();
            console.log('🔵 Form validation result:', isValid);
            if (!isValid) {
                console.log('❌ Form validation failed');
                return;
            }

            setIsSubmitting(true);

            const payload: SignUpPayload = {
                role,
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
            };

            if (role === 'student') {
                payload.enrollmentNumber = enrollmentNumber.trim();
                payload.classLevel = classLevel;
                if (classLevel.startsWith('grad_year')) {
                    payload.branch = branch.trim();
                }
                console.log('🔵 Student payload:', { ...payload, password: '***' });
            } else if (role === 'teacher') {
                payload.department = department;
                console.log('🔵 Teacher payload:', { ...payload, password: '***' });
            }

            console.log('🔵 Calling signUp function...');
            const { error } = await signUp(payload);
            console.log('🔵 signUp completed, error:', error);

            if (error) {
                console.log('❌ Signup error:', error);
                Alert.alert('Signup Failed', error);
            } else {
                console.log('✅ Signup successful!');
                Alert.alert('Success', 'Account created successfully!');
            }

            setIsSubmitting(false);
        } catch (err: any) {
            console.error('❌ CRASH in handleSignUp:', err);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error stack:', err.stack);
            setIsSubmitting(false);
            Alert.alert('Error', `An unexpected error occurred: ${err.message || 'Unknown error'}`);
        }
    };

    const isFormValid = () => {
        if (!fullName || !email || !password || !confirmPassword) return false;
        if (password !== confirmPassword) return false;
        if (role === 'student' && !enrollmentNumber) return false;
        if (role === 'student' && classLevel.startsWith('grad_year') && !branch) return false;
        if (role === 'teacher' && !department) return false;
        return true;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <Title style={styles.title}>Create Account</Title>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

                    <View style={styles.form}>
                        {/* Role Selection */}
                        <Text style={styles.label}>I am a:</Text>
                        <SegmentedButtons
                            value={role}
                            onValueChange={(value) => {
                                setRole(value as 'student' | 'teacher');
                                setErrors({});
                            }}
                            buttons={[
                                {
                                    value: 'student',
                                    label: 'Student',
                                    disabled: isSubmitting || authLoading
                                },
                                {
                                    value: 'teacher',
                                    label: 'Teacher',
                                    disabled: isSubmitting || authLoading
                                },
                            ]}
                            style={styles.segmentedButtons}
                        />

                        {/* Common Fields */}
                        <TextInput
                            label="Full Name"
                            value={fullName}
                            onChangeText={(text) => {
                                setFullName(text);
                                setErrors({ ...errors, fullName: '' });
                            }}
                            style={styles.input}
                            disabled={isSubmitting || authLoading}
                            mode="outlined"
                            error={!!errors.fullName}
                        />
                        {errors.fullName ? (
                            <HelperText type="error" visible={!!errors.fullName}>
                                {errors.fullName}
                            </HelperText>
                        ) : null}

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors({ ...errors, email: '' });
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={styles.input}
                            disabled={isSubmitting || authLoading}
                            mode="outlined"
                            error={!!errors.email}
                        />
                        {errors.email ? (
                            <HelperText type="error" visible={!!errors.email}>
                                {errors.email}
                            </HelperText>
                        ) : null}

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors({ ...errors, password: '' });
                            }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            style={styles.input}
                            disabled={isSubmitting || authLoading}
                            mode="outlined"
                            error={!!errors.password}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />
                        {errors.password ? (
                            <HelperText type="error" visible={!!errors.password}>
                                {errors.password}
                            </HelperText>
                        ) : (
                            <HelperText type="info" visible={!errors.password}>
                                Minimum 8 characters
                            </HelperText>
                        )}

                        <TextInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors({ ...errors, confirmPassword: '' });
                            }}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            style={styles.input}
                            disabled={isSubmitting || authLoading}
                            mode="outlined"
                            error={!!errors.confirmPassword}
                            right={
                                <TextInput.Icon
                                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            }
                        />
                        {errors.confirmPassword ? (
                            <HelperText type="error" visible={!!errors.confirmPassword}>
                                {errors.confirmPassword}
                            </HelperText>
                        ) : null}

                        {/* Student-Specific Fields */}
                        {role === 'student' && (
                            <>
                                <TextInput
                                    label="Enrollment Number"
                                    value={enrollmentNumber}
                                    onChangeText={(text) => {
                                        setEnrollmentNumber(text);
                                        setErrors({ ...errors, enrollmentNumber: '' });
                                    }}
                                    style={styles.input}
                                    disabled={isSubmitting || authLoading}
                                    mode="outlined"
                                    error={!!errors.enrollmentNumber}
                                    keyboardType="numeric"
                                />
                                {errors.enrollmentNumber ? (
                                    <HelperText type="error" visible={!!errors.enrollmentNumber}>
                                        {errors.enrollmentNumber}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Class Level</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={classLevel}
                                        onValueChange={(value) => setClassLevel(value)}
                                        enabled={!isSubmitting && !authLoading}
                                    >
                                        {CLASS_LEVELS.map((level) => (
                                            <Picker.Item
                                                key={level.value}
                                                label={level.label}
                                                value={level.value}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {classLevel.startsWith('grad_year') && (
                                    <>
                                        <Text style={styles.label}>Branch</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={branch}
                                                onValueChange={(value) => setBranch(value)}
                                                enabled={!isSubmitting && !authLoading}
                                            >
                                                {BRANCHES.map((b) => (
                                                    <Picker.Item
                                                        key={b}
                                                        label={b}
                                                        value={b}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </>
                                )}
                            </>
                        )}

                        {/* Teacher-Specific Fields */}
                        {role === 'teacher' && (
                            <>
                                <Text style={styles.label}>Department</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={department}
                                        onValueChange={(value) => setDepartment(value)}
                                        enabled={!isSubmitting && !authLoading}
                                    >
                                        {DEPARTMENTS.map((dept) => (
                                            <Picker.Item
                                                key={dept}
                                                label={dept}
                                                value={dept}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleSignUp}
                            loading={isSubmitting || authLoading}
                            disabled={isSubmitting || authLoading || !isFormValid()}
                            style={styles.signUpButton}
                        >
                            Sign Up
                        </Button>

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('SignIn')}
                                disabled={isSubmitting || authLoading}
                                compact
                            >
                                Sign In
                            </Button>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
        color: '#333',
    },
    segmentedButtons: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 4,
        backgroundColor: 'white',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 4,
        marginBottom: 12,
    },
    loadingText: {
        marginLeft: 12,
        color: '#666',
    },
    errorContainer: {
        padding: 12,
        backgroundColor: '#ffebee',
        borderRadius: 4,
        marginBottom: 12,
    },
    errorText: {
        color: '#c62828',
        marginBottom: 8,
    },
    signUpButton: {
        marginTop: 16,
        paddingVertical: 6,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    signInText: {
        fontSize: 14,
        color: '#666',
    },
});
