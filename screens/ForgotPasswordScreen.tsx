import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, Card } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/theme';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

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
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'your-app://reset-password',
            });

            if (error) {
                setErrorMsg(error.message);
            } else {
                setSuccessMsg('Password reset instructions have been sent to your email.');
                setTimeout(() => {
                    navigation.goBack();
                }, 3000);
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
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
