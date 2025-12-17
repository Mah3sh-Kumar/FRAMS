import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import type { StackScreenProps } from '@react-navigation/stack';
import { isValidEmail } from '../lib/validation';
import { RootStackParamList } from '../lib/types';
import { useTheme } from '../lib/design-system/ThemeContext';
import Button from '../components/design-system/primitives/Button';
import Input from '../components/design-system/primitives/Input';
import { Stack } from '../components/design-system/layout';
import GradientBackground from '../components/GradientBackground';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';

type Props = StackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
    const { signIn, loading } = useAuth();
    const { tokens, getSurfaceColor, getTextColor } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        // Load credentials asynchronously without blocking render
        loadSavedCredentials();
    }, []);

    const loadSavedCredentials = useCallback(async () => {
        try {
            const savedEmail = await SecureStore.getItemAsync('saved_email');
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
                // Load password separately to avoid blocking
                SecureStore.getItemAsync('saved_password').then(savedPassword => {
                    if (savedPassword) setPassword(savedPassword);
                });
            }
        } catch (error) {
            console.log('Error loading saved credentials:', error);
        }
    }, []);

    const handleEmailChange = useCallback((text: string) => {
        setEmail(text);
        if (errorMsg) setErrorMsg('');
    }, [errorMsg]);

    const handlePasswordChange = useCallback((text: string) => {
        setPassword(text);
        if (errorMsg) setErrorMsg('');
    }, [errorMsg]);

    const handleSignIn = useCallback(async () => {
        setErrorMsg('');

        if (!email || !password) {
            setErrorMsg('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMsg('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        const { error } = await signIn(email, password);

        if (error) {
            // Check if error is related to email verification
            if (error.toLowerCase().includes('email') && error.toLowerCase().includes('confirm')) {
                setErrorMsg('Please verify your email before signing in. Check your inbox for the verification link.');
            } else if (error.includes('Invalid login credentials')) {
                setErrorMsg('Invalid email or password. Please try again.');
            } else {
                setErrorMsg(error);
            }
            setIsSubmitting(false);
        } else {
            // Save credentials asynchronously without blocking navigation
            if (rememberMe) {
                SecureStore.setItemAsync('saved_email', email).catch(err => 
                    console.log('Error saving email:', err)
                );
                SecureStore.setItemAsync('saved_password', password).catch(err => 
                    console.log('Error saving password:', err)
                );
            } else {
                SecureStore.deleteItemAsync('saved_email').catch(err => 
                    console.log('Error clearing email:', err)
                );
                SecureStore.deleteItemAsync('saved_password').catch(err => 
                    console.log('Error clearing password:', err)
                );
            }
            setIsSubmitting(false);
        }
    }, [email, password, rememberMe, signIn]);

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            extraScrollHeight={20}
            enableAutomaticScroll={true}
        >
            <View style={styles.content}>
                <Text style={[styles.title, { color: getTextColor() }]}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <Stack spacing="md">
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={handleEmailChange}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        disabled={isSubmitting || loading}
                        error={!!errorMsg && !email ? 'Email is required' : undefined}
                        returnKeyType="next"
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={handlePasswordChange}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        disabled={isSubmitting || loading}
                        error={!!errorMsg && !password ? 'Password is required' : undefined}
                        returnKeyType="done"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons 
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                                    size={24} 
                                    color={tokens.colors.neutral.gray500} 
                                />
                            </TouchableOpacity>
                        }
                    />

                    {errorMsg ? (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : null}

                    <View style={styles.rememberMeContainer}>
                        <TouchableOpacity
                            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                            onPress={() => setRememberMe(!rememberMe)}
                            disabled={isSubmitting || loading}
                            accessible
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: rememberMe }}
                        >
                            {rememberMe && <View style={styles.checkboxInner} />}
                        </TouchableOpacity>
                        <Text style={[styles.rememberMeText, { color: getTextColor() }]}>Remember Me</Text>
                    </View>

                    <Button
                        variant="primary"
                        onPress={handleSignIn}
                        loading={isSubmitting || loading}
                        disabled={isSubmitting || loading || !email || !password}
                    >
                        Sign In
                    </Button>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignUp')}
                            disabled={isSubmitting || loading}
                        >
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </Stack>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    content: {
        maxWidth: 400,
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
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        marginTop: 4,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#6366F1',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#6366F1',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    rememberMeText: {
        fontSize: 16,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    signUpText: {
        fontSize: 16,
        color: '#6B7280',
    },
    signUpLink: {
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '600',
    },
});


