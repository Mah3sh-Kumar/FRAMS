import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';
import { colors, spacing } from '../lib/theme';

export default function PrivacyPolicyScreen() {
    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Privacy Policy</Title>
                    <Paragraph style={styles.paragraph}>
                        Last updated: {new Date().toLocaleDateString()}
                    </Paragraph>
                    
                    <Title style={styles.subtitle}>1. Information We Collect</Title>
                    <Paragraph style={styles.paragraph}>
                        We collect information you provide directly to us, such as when you create an account, update your profile, or use our services. This includes:
                        {'\n'}- Name and contact information
                        {'\n'}- Student/Employee ID
                        {'\n'}- Profile pictures and face data for attendance
                        {'\n'}- Academic records and attendance history
                    </Paragraph>

                    <Title style={styles.subtitle}>2. How We Use Your Information</Title>
                    <Paragraph style={styles.paragraph}>
                        We use the information we collect to:
                        {'\n'}- Provide, maintain, and improve our services
                        {'\n'}- Process attendance and grades
                        {'\n'}- Send notifications and updates
                        {'\n'}- Authenticate your identity
                    </Paragraph>

                    <Title style={styles.subtitle}>3. Data Security</Title>
                    <Paragraph style={styles.paragraph}>
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </Paragraph>

                    <Title style={styles.subtitle}>4. Contact Us</Title>
                    <Paragraph style={styles.paragraph}>
                        If you have any questions about this Privacy Policy, please contact the administration.
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
