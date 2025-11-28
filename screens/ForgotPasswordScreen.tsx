import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, Card } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/theme';
import { isValidEmail } from '../lib/validation';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleResetPassword = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        if (!email) {
            setErrorMsg('Please enter your email address');
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMsg('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('=== PASSWORD RESET DEBUG ===');
            console.log('Email:', email);
            console.log('Redirect URL:', 'myapp://reset-password');
            console.log('Timestamp:', new Date().toISOString());

            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'myapp://reset-password',
            });

            console.log('=== SUPABASE RESPONSE ===');
            console.log('Full Response:', JSON.stringify({ data, error }, null, 2));
            console.log('Error Details:', error ? {
                message: error.message,
                status: error.status,
                name: error.name,
            } : 'No error');

            if (error) {
                console.error('❌ Password reset error:', error);

                // Provide more helpful error messages
                let userMessage = error.message;

                if (error.message.includes('rate limit')) {
                    userMessage = 'Too many reset attempts. Please wait and try again. (Rate limit: 30 emails/hour)';
                } else if (error.message.includes('Invalid')) {
                    userMessage = 'Invalid email address or user not found. Please check your email and try again.';
                } else if (error.message.includes('redirect')) {
                    userMessage = 'Configuration error. Please contact support. (Redirect URL not whitelisted)';
                }

                setErrorMsg(userMessage);
            } else {
                console.log('✅ Password reset email request sent successfully');
                console.log('⚠️  IMPORTANT CHECKS:');
                console.log('1. Check your email inbox AND spam/junk folder');
                console.log('2. Email may take 5-10 minutes to arrive');
                console.log('3. Verify redirect URL is whitelisted in Supabase dashboard');
                console.log('4. Check Supabase SMTP configuration');
                console.log('5. Verify email template is enabled');
                console.log('6. Rate limit: 30 emails per hour');

                setSuccessMsg(
                    'Password reset instructions have been sent to your email. ' +
                    'Please check your inbox AND spam folder. ' +
                    'Email may take 5-10 minutes to arrive. ' +
                    'If you don\'t receive it, check Supabase configuration.'
                );
                setTimeout(() => {
                    navigation.goBack();
                }, 5000);
            }
        } catch (error: any) {
            console.error('❌ Password reset exception:', error);
            console.error('Exception details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
            });
            setErrorMsg(error.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
            console.log('=== END PASSWORD RESET DEBUG ===');
        }
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
                    <Title style={styles.title}>Reset Password</Title>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you instructions to reset your password.
                    </Text>

                    <Card style={styles.card}>
                        <Card.Content>
                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                                disabled={isSubmitting}
                                mode="outlined"
                                error={!!errorMsg}
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
                                disabled={isSubmitting || !email}
                                style={styles.button}
                            >
                                Send Reset Link
                            </Button>

                            <Button
                                mode="text"
                                onPress={() => navigation.goBack()}
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
