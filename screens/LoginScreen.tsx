import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    async function signInWithEmail() {
        setLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setErrorMsg(error.message);
            Alert.alert('Login Failed', error.message);
        }
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: email.split('@')[0], // Default name from email
                }
            }
        });

        if (error) {
            setErrorMsg(error.message);
            Alert.alert('Signup Failed', error.message);
        } else {
            Alert.alert('Success', 'Check your inbox for email verification!');
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Smart Attendance</Title>
            <View style={styles.inputContainer}>
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    disabled={loading}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    style={styles.input}
                    disabled={loading}
                />
                {errorMsg ? <HelperText type="error" visible={!!errorMsg}>{errorMsg}</HelperText> : null}
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={signInWithEmail}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Sign In
                </Button>
                <Button
                    mode="outlined"
                    onPress={signUpWithEmail}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Sign Up
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 24,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    buttonContainer: {
        gap: 10,
    },
    button: {
        marginTop: 5,
    },
});
