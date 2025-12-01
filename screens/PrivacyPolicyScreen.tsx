import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/design-system/primitives';
import { tokens } from '../lib/design-system/tokens';

export default function PrivacyPolicyScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Card>
                <View style={styles.cardContent}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.paragraph}>
                        Last updated: {new Date().toLocaleDateString()}
                    </Text>
                    
                    <Text style={styles.subtitle}>1. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        We collect information you provide directly to us, such as when you create an account, update your profile, or use our services. This includes:
                        {'\n'}- Name and contact information
                        {'\n'}- Student/Employee ID
                        {'\n'}- Profile pictures and face data for attendance
                        {'\n'}- Academic records and attendance history
                    </Text>

                    <Text style={styles.subtitle}>2. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use the information we collect to:
                        {'\n'}- Provide, maintain, and improve our services
                        {'\n'}- Process attendance and grades
                        {'\n'}- Send notifications and updates
                        {'\n'}- Authenticate your identity
                    </Text>

                    <Text style={styles.subtitle}>3. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </Text>

                    <Text style={styles.subtitle}>4. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about this Privacy Policy, please contact the administration.
                    </Text>
                </View>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tokens.colors.theme.light.background,
    },
    contentContainer: {
        padding: tokens.spacing.md,
    },
    cardContent: {
        padding: tokens.spacing.lg,
    },
    title: {
        marginBottom: tokens.spacing.md,
        fontSize: tokens.typography.h1.fontSize,
        fontWeight: tokens.typography.h1.fontWeight,
        lineHeight: tokens.typography.h1.lineHeight,
        color: tokens.colors.theme.light.text,
    },
    subtitle: {
        marginTop: tokens.spacing.lg,
        marginBottom: tokens.spacing.sm,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        lineHeight: tokens.typography.h3.lineHeight,
        color: tokens.colors.theme.light.text,
    },
    paragraph: {
        marginBottom: tokens.spacing.md,
        fontSize: tokens.typography.body.fontSize,
        lineHeight: tokens.typography.body.lineHeight,
        color: tokens.colors.theme.light.textSecondary,
    },
});
