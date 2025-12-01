import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../lib/design-system/tokens';
import StudentDashboard from './student/StudentDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import AdminDashboard from './admin/AdminDashboard';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
    const { session, role, signOut } = useAuth();

    const getRoleGradient = () => {
        switch (role) {
            case 'student': return tokens.colors.roles.student.gradient;
            case 'teacher': return tokens.colors.roles.teacher.gradient;
            case 'admin': return tokens.colors.roles.admin.gradient;
            default: return [tokens.colors.neutral.gray600, tokens.colors.neutral.gray700];
        }
    };

    const getRoleColor = () => {
        switch (role) {
            case 'student': return tokens.colors.roles.student.main;
            case 'teacher': return tokens.colors.roles.teacher.main;
            case 'admin': return tokens.colors.roles.admin.main;
            default: return tokens.colors.neutral.gray600;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.header, { backgroundColor: getRoleColor() }]}>
                <View style={styles.headerInfo}>
                    <Text style={styles.email}>{session?.user.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{role || 'No Role'}</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <IconButton
                        icon="bell"
                        iconColor={tokens.colors.neutral.white}
                        size={24}
                        onPress={() => navigation.navigate('Notifications')}
                        style={{ minWidth: 48, minHeight: 48 }}
                    />
                    <IconButton
                        icon="account-circle"
                        iconColor={tokens.colors.neutral.white}
                        size={24}
                        onPress={() => navigation.navigate('Profile')}
                        style={{ minWidth: 48, minHeight: 48 }}
                    />
                    <IconButton
                        icon="cog"
                        iconColor={tokens.colors.neutral.white}
                        size={24}
                        onPress={() => navigation.navigate('Settings')}
                        style={{ minWidth: 48, minHeight: 48 }}
                    />
                </View>
            </View>

            <View style={styles.content}>
                {role === 'student' && <StudentDashboard />}
                {role === 'teacher' && <TeacherDashboard />}
                {role === 'admin' && <AdminDashboard />}
                {!role && <Text style={styles.noRoleText}>No role assigned. Please contact admin.</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacing.md,
        paddingTop: tokens.spacing.xxl,
        ...tokens.shadows.md,
    },
    headerInfo: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacing.xs,
    },
    email: {
        color: tokens.colors.neutral.white,
        fontSize: tokens.typography.body.fontSize,
        fontWeight: tokens.typography.body.fontWeight,
        lineHeight: tokens.typography.body.lineHeight,
        marginBottom: tokens.spacing.xs,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: tokens.spacing.sm + tokens.spacing.xs,
        paddingVertical: tokens.spacing.xs,
        borderRadius: tokens.borders.medium,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: tokens.colors.neutral.white,
        fontSize: tokens.typography.caption.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        lineHeight: tokens.typography.caption.lineHeight,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
    },
    noRoleText: {
        textAlign: 'center',
        marginTop: tokens.spacing.lg,
        fontSize: tokens.typography.body.fontSize,
        lineHeight: tokens.typography.body.lineHeight,
        color: tokens.colors.theme.light.textSecondary,
    }
});
