import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, Card } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/theme';
import { validatePassword } from '../lib/validation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import type { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';

type Props = StackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Extract token from route params
        const tokenParam = route.params?.token;
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            // No token provided, redirect to forgot password
            setErrorMsg('Invalid or missing reset token. Please request a new password reset link.');
            setTimeout(() => {
                navigation.replace('ForgotPassword');
            }, 3000);
        }
    }, [route.params]);

    const checkPasswordMatch = (): boolean => {
        return password === confirmPassword;
    };

    const handleResetPassword = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        // Validate password
        const validation = validatePassword(password);
        if (!validation.isValid) {
            setErrorMsg(validation.errors.join('. '));
            return;
        }

        // Check password match
        if (!checkPasswordMatch()) {
            setErrorMsg('Passwords do not match');
            return;
        }

        if (!token) {
            setErrorMsg('Invalid reset token. Please request a new password reset link.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                // Check if token is invalid or expired
                if (error.message.toLowerCase().includes('token') || 
                    error.message.toLowerCase().includes('expired')) {
                    setErrorMsg('Your reset link has expired. Please request a new one.');
                    setTimeout(() => {
                        navigation.replace('ForgotPassword');
                    }, 3000);
                } else {
                    setErrorMsg(error.message);
                }
            } else {
                setSuccessMsg('Password updated successfully! Redirecting to sign in...');
                setTimeout(() => {
                    navigation.replace('SignIn');
                }, 2000);
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred while resetting your password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = () => {
        const validation = validatePassword(password);
        return validation.isValid && checkPasswordMatch() && !isSubmitting;
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
                    <Title style={styles.title}>Set New Password</Title>
                    <Text style={styles.subtitle}>
                        Enter your new password below. Make sure it's at least 8 characters long.
                    </Text>

                    <Card style={styles.card}>
                        <Card.Content>
                            <TextInput
                                label="New Password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                style={styles.input}
                                disabled={isSubmitting}
                                mode="outlined"
                                error={!!errorMsg && !password}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />

                            {password ? (
                                <PasswordStrengthIndicator password={password} />
                            ) : null}

                            <TextInput
                                label="Confirm Password"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                style={styles.input}
                                disabled={isSubmitting}
                                mode="outlined"
                                error={!!errorMsg && !confirmPassword}
                                right={
                                    <TextInput.Icon
                                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                }
                            />

                            {errorMsg ? (
                                <HelperText type="error" visible={!!errorMsg}>
                                    {errorMsg}
                                </HelperText>
                            ) : null}

                            {successMsg ? (
                                <HelperText type="info" visible={!!successMsg} style={styles.successText}>
                                    {successMsg}
                                </HelperText>
                            ) : null}

                            <Button
                                mode="contained"
                                onPress={handleResetPassword}
                                loading={isSubmitting}
                                disabled={!isFormValid()}
                                style={styles.button}
                            >
                                Reset Password
                            </Button>

                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('SignIn')}
                                disabled={isSubmitting}
                                style={styles.backButton}
                            >
                                Back to Sign In
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        padding: spacing.lg,
    },
    title: {
        textAlign: 'center',
        marginBottom: spacing.sm,
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: spacing.xl,
        fontSize: typography.fontSize.md,
        color: colors.text.secondary,
    },
    card: {
        padding: spacing.md,
    },
    input: {
        marginBottom: spacing.sm,
        backgroundColor: colors.background.paper,
    },
    button: {
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
    },
    backButton: {
        marginTop: spacing.sm,
    },
    successText: {
        color: colors.success.main,
    },
});
