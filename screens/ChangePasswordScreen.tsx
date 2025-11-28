import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import type { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/types';

type Props = StackScreenProps<RootStackParamList, 'ChangePassword'>;

export default function ChangePasswordScreen({ navigation }: Props) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrorMsg('Please fill in all fields');
            return false;
        }

        if (newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('New passwords do not match');
            return false;
        }

        if (currentPassword === newPassword) {
            setErrorMsg('New password must be different from current password');
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        setErrorMsg('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Supabase allows changing password for logged-in users
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setErrorMsg(error.message);
            } else {
                Alert.alert(
                    'Success',
                    'Password changed successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
                <Title style={styles.title}>Change Password</Title>
                <Text style={styles.subtitle}>
                    Enter your current password and choose a new one
                </Text>

                <View style={styles.form}>
                    <TextInput
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={(text) => {
                            setCurrentPassword(text);
                            setErrorMsg('');
                        }}
                        secureTextEntry={!showCurrentPassword}
                        autoCapitalize="none"
                        style={styles.input}
                        disabled={isSubmitting}
                        mode="outlined"
                        right={
                            <TextInput.Icon
                                icon={showCurrentPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            />
                        }
                    />

                    <TextInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={(text) => {
                            setNewPassword(text);
                            setErrorMsg('');
                        }}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        style={styles.input}
                        disabled={isSubmitting}
                        mode="outlined"
                        right={
                            <TextInput.Icon
                                icon={showNewPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            />
                        }
                    />

                    <TextInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setErrorMsg('');
                        }}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        style={styles.input}
                        disabled={isSubmitting}
                        mode="outlined"
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        }
                    />

                    {errorMsg ? (
                        <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
                            {errorMsg}
                        </HelperText>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleChangePassword}
                        loading={isSubmitting}
                        disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                        style={styles.submitButton}
                    >
                        Change Password
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => navigation.goBack()}
                        disabled={isSubmitting}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                </View>
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
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 14,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    errorText: {
        marginBottom: 8,
    },
    submitButton: {
        marginTop: 8,
        paddingVertical: 6,
    },
    cancelButton: {
        marginTop: 8,
    },
});
