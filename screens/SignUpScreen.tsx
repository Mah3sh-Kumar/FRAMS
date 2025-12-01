import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth, SignUpPayload } from '../context/AuthContext';
import { checkEnrollmentNumberUnique } from '../lib/database';
import { DEPARTMENTS, CLASS_LEVELS, BRANCHES } from '../lib/constants';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '../lib/design-system/ThemeContext';
import Button from '../components/design-system/primitives/Button';
import Input from '../components/design-system/primitives/Input';
import { Stack } from '../components/design-system/layout';
import { isValidEmail } from '../lib/validation';

type Props = StackScreenProps<any, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
    const { signUp, loading: authLoading } = useAuth();
    const { getTextColor, getSurfaceColor } = useTheme();

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

    // Teacher-specific
    const [department, setDepartment] = useState(DEPARTMENTS[0]);

    // UI state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debounce timer ref for enrollment number validation
    const enrollmentCheckTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced enrollment number validation
    const checkEnrollmentDebounced = useCallback((value: string) => {
        if (enrollmentCheckTimer.current) {
            clearTimeout(enrollmentCheckTimer.current);
        }

        enrollmentCheckTimer.current = setTimeout(async () => {
            if (value.trim() && role === 'student') {
                const isUnique = await checkEnrollmentNumberUnique(value);
                if (!isUnique) {
                    setErrors(prev => ({
                        ...prev,
                        enrollmentNumber: 'This enrollment number is already registered'
                    }));
                }
            }
        }, 500); // 500ms debounce
    }, [role]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (enrollmentCheckTimer.current) {
                clearTimeout(enrollmentCheckTimer.current);
            }
        };
    }, []);

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

    const handleSignUp = useCallback(async () => {
        try {
            const isValid = await validateForm();
            if (!isValid) {
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
            } else if (role === 'teacher') {
                payload.department = department;
            }

            const { error } = await signUp(payload);

            if (error) {
                Alert.alert('Signup Failed', error);
            } else {
                Alert.alert('Success', 'Account created successfully!');
            }
        } catch (err: any) {
            console.error('Error in handleSignUp:', err);
            Alert.alert('Error', `An unexpected error occurred: ${err.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [role, fullName, email, password, enrollmentNumber, classLevel, branch, department, signUp, navigation]);

    const isFormValid = useCallback(() => {
        if (!fullName || !email || !password || !confirmPassword) return false;
        if (password !== confirmPassword) return false;
        if (role === 'student' && !enrollmentNumber) return false;
        if (role === 'student' && classLevel.startsWith('grad_year') && !branch) return false;
        if (role === 'teacher' && !department) return false;
        return true;
    }, [fullName, email, password, confirmPassword, role, enrollmentNumber, classLevel, branch, department]);

    // Memoized handlers to prevent re-renders
    const handleFullNameChange = useCallback((text: string) => {
        setFullName(text);
        if (errors.fullName) {
            setErrors(prev => ({ ...prev, fullName: '' }));
        }
    }, [errors.fullName]);

    const handleEmailChange = useCallback((text: string) => {
        setEmail(text);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    }, [errors.email]);

    const handlePasswordChange = useCallback((text: string) => {
        setPassword(text);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    }, [errors.password]);

    const handleConfirmPasswordChange = useCallback((text: string) => {
        setConfirmPassword(text);
        if (errors.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    }, [errors.confirmPassword]);

    const handleEnrollmentChange = useCallback((text: string) => {
        setEnrollmentNumber(text);
        if (errors.enrollmentNumber) {
            setErrors(prev => ({ ...prev, enrollmentNumber: '' }));
        }
        // Trigger debounced validation
        checkEnrollmentDebounced(text);
    }, [errors.enrollmentNumber, checkEnrollmentDebounced]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: getTextColor() }]}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

                    <Stack spacing="md">
                        {/* Role Selection */}
                        <View>
                            <Text style={[styles.label, { color: getTextColor() }]}>I am a:</Text>
                            <View style={styles.roleContainer}>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'student' && styles.roleButtonActive, { backgroundColor: getSurfaceColor() }]}
                                    onPress={() => {
                                        setRole('student');
                                        setErrors({});
                                    }}
                                    disabled={isSubmitting || authLoading}
                                    accessible
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: role === 'student' }}
                                >
                                    <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>
                                        Student
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive, { backgroundColor: getSurfaceColor() }]}
                                    onPress={() => {
                                        setRole('teacher');
                                        setErrors({});
                                    }}
                                    disabled={isSubmitting || authLoading}
                                    accessible
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: role === 'teacher' }}
                                >
                                    <Text style={[styles.roleButtonText, role === 'teacher' && styles.roleButtonTextActive]}>
                                        Teacher
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Common Fields */}
                        <Input
                            label="Full Name"
                            value={fullName}
                            onChangeText={handleFullNameChange}
                            disabled={isSubmitting || authLoading}
                            error={errors.fullName}
                        />

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={handleEmailChange}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            disabled={isSubmitting || authLoading}
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            disabled={isSubmitting || authLoading}
                            error={errors.password}
                        />
                        <PasswordStrengthIndicator password={password} />

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordChange}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            disabled={isSubmitting || authLoading}
                            error={errors.confirmPassword}
                        />

                        {/* Student-Specific Fields */}
                        {role === 'student' && (
                            <>
                                <Input
                                    label="Enrollment Number"
                                    value={enrollmentNumber}
                                    onChangeText={handleEnrollmentChange}
                                    disabled={isSubmitting || authLoading}
                                    error={errors.enrollmentNumber}
                                    keyboardType="numeric"
                                />

                                <View>
                                    <Text style={[styles.label, { color: getTextColor() }]}>Class Level</Text>
                                    <View style={[styles.pickerContainer, { backgroundColor: getSurfaceColor() }]}>
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
                                </View>

                                {classLevel.startsWith('grad_year') && (
                                    <View>
                                        <Text style={[styles.label, { color: getTextColor() }]}>Branch</Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: getSurfaceColor() }]}>
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
                                        {errors.branch && (
                                            <Text style={styles.errorText}>{errors.branch}</Text>
                                        )}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Teacher-Specific Fields */}
                        {role === 'teacher' && (
                            <View>
                                <Text style={[styles.label, { color: getTextColor() }]}>Department</Text>
                                <View style={[styles.pickerContainer, { backgroundColor: getSurfaceColor() }]}>
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
                                {errors.department && (
                                    <Text style={styles.errorText}>{errors.department}</Text>
                                )}
                            </View>
                        )}

                        <Button
                            variant="primary"
                            onPress={handleSignUp}
                            loading={isSubmitting || authLoading}
                            disabled={isSubmitting || authLoading || !isFormValid()}
                        >
                            Sign Up
                        </Button>

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SignIn')}
                                disabled={isSubmitting || authLoading}
                            >
                                <Text style={styles.signInLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Stack>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 32,
    },
    content: {
        padding: 16,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
    },
    roleButtonActive: {
        borderColor: '#6366F1',
        backgroundColor: '#6366F110',
    },
    roleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    roleButtonTextActive: {
        color: '#6366F1',
    },
    pickerContainer: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginBottom: 16,
        overflow: 'hidden',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        marginTop: 4,
        marginBottom: 8,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    signInText: {
        fontSize: 16,
        color: '#6B7280',
    },
    signInLink: {
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '600',
    },
});
