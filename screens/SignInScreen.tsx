import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, Checkbox } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        loadSavedCredentials();
    }, []);

    const loadSavedCredentials = async () => {
        try {
            const savedEmail = await SecureStore.getItemAsync('saved_email');
            const savedPassword = await SecureStore.getItemAsync('saved_password');
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
                if (savedPassword) {
                    setPassword(savedPassword);
                }
            }
        } catch (error) {
            console.log('Error loading saved credentials:', error);
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSignIn = async () => {
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
            setErrorMsg(error);
        } else {
            if (rememberMe) {
                try {
                    await SecureStore.setItemAsync('saved_email', email);
                    await SecureStore.setItemAsync('saved_password', password);
                } catch (err) {
                    console.log('Error saving credentials:', err);
                }
            } else {
                try {
                    await SecureStore.deleteItemAsync('saved_email');
                    await SecureStore.deleteItemAsync('saved_password');
                } catch (err) {
                    console.log('Error clearing credentials:', err);
                }
            }
        }

        setIsSubmitting(false);
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
                    <Title style={styles.title}>Welcome Back</Title>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrorMsg('');
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={styles.input}
                            disabled={isSubmitting || loading}
                            mode="outlined"
                            error={!!errorMsg && !email}
                        />

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrorMsg('');
                            }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            style={styles.input}
                            disabled={isSubmitting || loading}
                            mode="outlined"
                            error={!!errorMsg && !password}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        {errorMsg ? (
                            <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
                                {errorMsg}
                            </HelperText>
                        ) : null}

                        <View style={styles.rememberMeContainer}>
                            <Checkbox.Android
                                status={rememberMe ? 'checked' : 'unchecked'}
                                onPress={() => setRememberMe(!rememberMe)}
                                disabled={isSubmitting || loading}
                            />
                            <Text style={styles.rememberMeText}>Remember Me</Text>
                        </View>

                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPassword}
                            disabled={isSubmitting || loading}
                        >
                            Forgot password?
                        </Button>

                        <Button
                            mode="contained"
                            onPress={handleSignIn}
                            loading={isSubmitting || loading}
                            disabled={isSubmitting || loading || !email || !password}
                            style={styles.signInButton}
                        >
                            Sign In
                        </Button>

                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('SignUp')}
                                disabled={isSubmitting || loading}
                                compact
                            >
                                Sign Up
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
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    errorText: {
        marginBottom: 8,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rememberMeText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    signInButton: {
        marginTop: 8,
        paddingVertical: 6,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    signUpText: {
        fontSize: 14,
        color: '#666',
    },
});
