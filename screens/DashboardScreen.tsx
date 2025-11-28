import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './student/StudentDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import AdminDashboard from './admin/AdminDashboard';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
    const { session, role, signOut } = useAuth();

    const getRoleColor = () => {
        switch (role) {
            case 'student': return '#3b82f6';
            case 'teacher': return '#10b981';
            case 'admin': return '#8b5cf6';
            default: return '#64748b';
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
                        iconColor="#ffffff"
                        size={22}
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <IconButton
                        icon="account-circle"
                        iconColor="#ffffff"
                        size={22}
                        onPress={() => navigation.navigate('Profile')}
                    />
                    <IconButton
                        icon="cog"
                        iconColor="#ffffff"
                        size={22}
                        onPress={() => navigation.navigate('Settings')}
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
        padding: 16,
        paddingTop: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerInfo: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    email: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
    },
    noRoleText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    }
});
