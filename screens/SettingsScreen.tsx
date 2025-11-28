import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Button, Title, Card, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, shadows } from '../lib/theme';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
    const { signOut } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [assignmentReminders, setAssignmentReminders] = useState(true);
    const [attendanceAlerts, setAttendanceAlerts] = useState(true);
    const [gradeNotifications, setGradeNotifications] = useState(true);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Notifications</Title>
                    <List.Item
                        title="Enable Notifications"
                        description="Receive push notifications"
                        right={() => (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                            />
                        )}
                    />
                    <Divider />
                    <List.Item
                        title="Assignment Reminders"
                        description="Get reminded about upcoming assignments"
                        disabled={!notificationsEnabled}
                        right={() => (
                            <Switch
                                value={assignmentReminders}
                                onValueChange={setAssignmentReminders}
                                disabled={!notificationsEnabled}
                            />
                        )}
                    />
                    <Divider />
                    <List.Item
                        title="Attendance Alerts"
                        description="Get alerted about attendance issues"
                        disabled={!notificationsEnabled}
                        right={() => (
                            <Switch
                                value={attendanceAlerts}
                                onValueChange={setAttendanceAlerts}
                                disabled={!notificationsEnabled}
                            />
                        )}
                    />
                    <Divider />
                    <List.Item
                        title="Grade Notifications"
                        description="Get notified when assignments are graded"
                        disabled={!notificationsEnabled}
                        right={() => (
                            <Switch
                                value={gradeNotifications}
                                onValueChange={setGradeNotifications}
                                disabled={!notificationsEnabled}
                            />
                        )}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Security</Title>
                    <List.Item
                        title="Change Password"
                        description="Update your password"
                        left={props => <List.Icon {...props} icon="lock-reset" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => {
                            navigation.navigate('ChangePassword');
                        }}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>About</Title>
                    <List.Item
                        title="App Version"
                        description="1.0.0"
                        left={props => <List.Icon {...props} icon="information" />}
                    />
                    <Divider />
                    <List.Item
                        title="Privacy Policy"
                        description="View our privacy policy"
                        left={props => <List.Icon {...props} icon="shield-check" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => {
                            navigation.navigate('PrivacyPolicy');
                        }}
                    />
                    <Divider />
                    <List.Item
                        title="Terms of Service"
                        description="View terms of service"
                        left={props => <List.Icon {...props} icon="file-document" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => {
                            navigation.navigate('Terms');
                        }}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Actions</Title>
                    <List.Item
                        title="Clear Cache"
                        description="Free up storage space"
                        left={props => <List.Icon {...props} icon="delete" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => {
                            alert('Cache cleared successfully');
                        }}
                    />
                </Card.Content>
            </Card>

            <View style={styles.signOutContainer}>
                <Button
                    mode="contained"
                    onPress={handleSignOut}
                    icon="logout"
                    buttonColor={colors.error.main}
                    style={styles.signOutButton}
                >
                    Sign Out
                </Button>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Made with ❤️ for Education
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    card: {
        margin: spacing.md,
        marginBottom: 0,
        ...shadows.sm,
    },
    signOutContainer: {
        padding: spacing.md,
        paddingTop: spacing.xl,
    },
    signOutButton: {
        paddingVertical: spacing.xs,
    },
    footer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.disabled,
    },
});
