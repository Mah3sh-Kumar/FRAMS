import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button, Card, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import GradientBackground from '../components/GradientBackground';

export default function UnverifiedScreen() {
    const { signOut, user } = useAuth();

    return (
        <GradientBackground variant="student">
            <View style={styles.container}>
                <Surface style={styles.card} elevation={4}>
                    <Card.Content>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>⏳</Text>
                        </View>
                        
                        <Title style={styles.title}>Account Pending Verification</Title>
                        
                        <Text style={styles.message}>
                            Your account has been created successfully, but it needs to be verified by an administrator before you can access the system.
                        </Text>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoTitle}>What happens next?</Text>
                            <Text style={styles.infoText}>
                                • An administrator will review your account{'\n'}
                                • You'll receive access once verified{'\n'}
                                • This usually takes 1-2 business days{'\n'}
                                • You can log out and check back later
                            </Text>
                        </View>

                        <View style={styles.detailsBox}>
                            <Text style={styles.detailsLabel}>Your Email:</Text>
                            <Text style={styles.detailsValue}>{user?.email}</Text>
                        </View>

                        <Text style={styles.helpText}>
                            If you have any questions, please contact your institution's administrator.
                        </Text>

                        <Button 
                            mode="contained" 
                            onPress={signOut}
                            style={styles.button}
                        >
                            Sign Out
                        </Button>
                    </Card.Content>
                </Surface>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        fontSize: 64,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: '#666',
        lineHeight: 24,
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1976d2',
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    detailsBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    detailsLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    detailsValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    helpText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#888',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    button: {
        marginTop: 8,
    },
});
