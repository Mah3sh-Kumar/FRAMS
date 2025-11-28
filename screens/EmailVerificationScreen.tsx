import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Title, Card, IconButton } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'EmailVerification'>;

export default function EmailVerificationScreen({ navigation, route }: Props) {
    const email = route.params?.email || '';
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState('');

    const handleResendEmail = async () => {
        if (!email) {
            setResendError('Email address not found');
            return;
        }

        setResending(true);
        setResendError('');
        setResendSuccess(false);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                setResendError(error.message);
            } else {
                setResendSuccess(true);
                setTimeout(() => setResendSuccess(false), 5000);
            }
        } catch (err: any) {
            setResendError(err.message || 'Failed to resend email');
        } finally {
            setResending(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <IconButton
                        icon="email-check-outline"
                        size={100}
                        iconColor="#1976d2"
                    />
                </View>

                <Title style={styles.title}>Verify Your Email</Title>
                <Text style={styles.subtitle}>
                    We've sent a verification link to
                </Text>
                <Text style={styles.email}>{email}</Text>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.instructionTitle}>Next Steps:</Text>
                        <View style={styles.instructionItem}>
                            <Text style={styles.bullet}>1.</Text>
                            <Text style={styles.instructionText}>
                                Check your email inbox (and spam folder)
                            </Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.bullet}>2.</Text>
                            <Text style={styles.instructionText}>
                                Click the verification link in the email
                            </Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.bullet}>3.</Text>
                            <Text style={styles.instructionText}>
                                Return to the app and sign in
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {resendSuccess && (
                    <Card style={styles.successCard}>
                        <Card.Content>
                            <Text style={styles.successText}>
                                ✓ Verification email sent successfully!
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {resendError && (
                    <Card style={styles.errorCard}>
                        <Card.Content>
                            <Text style={styles.errorText}>{resendError}</Text>
                        </Card.Content>
                    </Card>
                )}

                <Button
                    mode="outlined"
                    onPress={handleResendEmail}
                    loading={resending}
                    disabled={resending}
                    style={styles.resendButton}
                    icon="refresh"
                >
                    Resend Verification Email
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('SignIn')}
                    style={styles.signInButton}
                >
                    Go to Sign In
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('SignUp')}
                    style={styles.backButton}
                >
                    Back to Sign Up
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1976d2',
        marginBottom: 24,
    },
    card: {
        width: '100%',
        marginBottom: 16,
        backgroundColor: 'white',
        elevation: 2,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#1976d2',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    successCard: {
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#e8f5e9',
    },
    successText: {
        color: '#2e7d32',
        fontSize: 14,
        textAlign: 'center',
    },
    errorCard: {
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#ffebee',
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
        textAlign: 'center',
    },
    resendButton: {
        width: '100%',
        marginBottom: 12,
        paddingVertical: 4,
    },
    signInButton: {
        width: '100%',
        marginBottom: 12,
        paddingVertical: 6,
    },
    backButton: {
        marginTop: 8,
    },
});
