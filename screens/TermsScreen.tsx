import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';
import { colors, spacing } from '../lib/theme';

export default function TermsScreen() {
    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Terms of Service</Title>
                    <Paragraph style={styles.paragraph}>
                        Last updated: {new Date().toLocaleDateString()}
                    </Paragraph>

                    <Title style={styles.subtitle}>1. Acceptance of Terms</Title>
                    <Paragraph style={styles.paragraph}>
                        By accessing or using FRAMS (Face Recognition & Attendance Management System), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
                    </Paragraph>

                    <Title style={styles.subtitle}>2. User Responsibilities</Title>
                    <Paragraph style={styles.paragraph}>
                        You are responsible for:
                        {'\n'}- Maintaining the confidentiality of your account
                        {'\n'}- All activities that occur under your account
                        {'\n'}- Providing accurate and current information
                        {'\n'}- Ensuring your face data is accurate for attendance
                    </Paragraph>

                    <Title style={styles.subtitle}>3. Academic Integrity</Title>
                    <Paragraph style={styles.paragraph}>
                        Users must not attempt to manipulate attendance records or grades. Any such attempts will result in disciplinary action.
                    </Paragraph>

                    <Title style={styles.subtitle}>4. Modifications</Title>
                    <Paragraph style={styles.paragraph}>
                        We reserve the right to modify these terms at any time. We will notify users of any significant changes.
                    </Paragraph>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
        padding: spacing.md,
    },
    card: {
        marginBottom: spacing.md,
    },
    title: {
        marginBottom: spacing.md,
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        fontSize: 18,
        fontWeight: 'bold',
    },
    paragraph: {
        marginBottom: spacing.sm,
        lineHeight: 22,
    },
});
