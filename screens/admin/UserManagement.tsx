import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, ScrollView, TouchableOpacity, Modal, Text } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { verifyUser, unverifyUser, updateUserRole, deleteUser } from '../../lib/admin';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Card from '../../components/design-system/primitives/Card';
import Button from '../../components/design-system/primitives/Button';
import Input from '../../components/design-system/primitives/Input';
import GlassmorphicWidget from '../../components/design-system/analytics/GlassmorphicWidget';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import GradientBackground from '../../components/GradientBackground';
import { Picker } from '@react-native-picker/picker';
import { DEPARTMENTS, CLASS_LEVELS, BRANCHES } from '../../lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { exportCSV } from '../../lib/csvExport';

type UserData = {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'teacher' | 'student';
    is_verified: boolean;
    verified_at?: string;
    department?: string;
    enrollment_number?: string;
    class_level?: string;
    branch?: string;
};

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterVerification, setFilterVerification] = useState<string>('all');

    // Edit Modal State
    const [visible, setVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState<'admin' | 'teacher' | 'student'>('student');
    const [editDepartment, setEditDepartment] = useState('');
    const [editEnrollment, setEditEnrollment] = useState('');
    const [editClassLevel, setEditClassLevel] = useState('');
    const [editBranch, setEditBranch] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete Confirmation
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    // Create User Modal
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newUserRole, setNewUserRole] = useState<'student' | 'teacher'>('student');
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserDepartment, setNewUserDepartment] = useState(DEPARTMENTS[0]);
    const [newUserEnrollment, setNewUserEnrollment] = useState('');
    const [newUserClassLevel, setNewUserClassLevel] = useState(CLASS_LEVELS[0].value);
    const [newUserBranch, setNewUserBranch] = useState(BRANCHES[0]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;

            const { data: teachersData } = await supabase.from('teachers').select('id, department');
            const { data: studentsData } = await supabase.from('students').select('id, enrollment_number, class_level, branch');

            const mergedUsers = usersData.map((user: any) => {
                const teacher = teachersData?.find((t: any) => t.id === user.id);
                const student = studentsData?.find((s: any) => s.id === user.id);
                return {
                    ...user,
                    department: teacher?.department,
                    enrollment_number: student?.enrollment_number,
                    class_level: student?.class_level,
                    branch: student?.branch,
                };
            });

            setUsers(mergedUsers);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (userId: string) => {
        try {
            const { error } = await verifyUser(userId);
            if (error) throw new Error(error);
            
            Alert.alert('Success', 'User verified successfully');
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to verify user');
        }
    };

    const handleUnverifyUser = async (userId: string) => {
        try {
            const { error } = await unverifyUser(userId);
            if (error) throw new Error(error);
            
            Alert.alert('Success', 'User unverified successfully');
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to unverify user');
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            const { error } = await deleteUser(userToDelete.id);
            if (error) throw new Error(error);

            Alert.alert('Success', 'User deleted successfully');
            setDeleteConfirmVisible(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete user');
        }
    };

    const openEditModal = (user: UserData) => {
        setSelectedUser(user);
        setEditName(user.full_name || '');
        setEditRole(user.role);
        setEditDepartment(user.department || DEPARTMENTS[0]);
        setEditEnrollment(user.enrollment_number || '');
        setEditClassLevel(user.class_level || CLASS_LEVELS[0].value);
        setEditBranch(user.branch || BRANCHES[0]);
        setVisible(true);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        
        if (!editName.trim()) {
            Alert.alert('Error', 'Full name is required');
            return;
        }

        setSaving(true);
        try {
            // Update user profile
            const { error: userError } = await supabase
                .from('users')
                .update({ full_name: editName })
                .eq('id', selectedUser.id);

            if (userError) throw userError;

            // Handle role change
            if (editRole !== selectedUser.role) {
                // Delete old role-specific data
                if (selectedUser.role === 'teacher') {
                    await supabase.from('teachers').delete().eq('id', selectedUser.id);
                } else if (selectedUser.role === 'student') {
                    await supabase.from('students').delete().eq('id', selectedUser.id);
                }

                // Update role
                const { error: roleError } = await updateUserRole(selectedUser.id, editRole);
                if (roleError) throw new Error(roleError);

                // Create new role-specific data
                if (editRole === 'teacher') {
                    await supabase.from('teachers').insert({
                        id: selectedUser.id,
                        department: editDepartment
                    });
                } else if (editRole === 'student') {
                    if (!editEnrollment.trim()) {
                        throw new Error('Enrollment number is required for students');
                    }
                    await supabase.from('students').insert({
                        id: selectedUser.id,
                        enrollment_number: editEnrollment,
                        class_level: editClassLevel,
                        branch: editBranch
                    });
                }
            } else {
                // Update existing role-specific data
                if (editRole === 'teacher') {
                    await supabase.from('teachers').upsert({
                        id: selectedUser.id,
                        department: editDepartment
                    });
                } else if (editRole === 'student') {
                    if (!editEnrollment.trim()) {
                        throw new Error('Enrollment number is required for students');
                    }
                    await supabase.from('students').upsert({
                        id: selectedUser.id,
                        enrollment_number: editEnrollment,
                        class_level: editClassLevel,
                        branch: editBranch
                    });
                }
            }

            Alert.alert('Success', 'User updated successfully');
            setVisible(false);
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update user');
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
            return Alert.alert('Error', 'Please fill all required fields');
        }

        if (newUserRole === 'student' && !newUserEnrollment.trim()) {
            return Alert.alert('Error', 'Enrollment number is required for students');
        }

        setCreating(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPassword,
                options: {
                    data: {
                        full_name: newUserName,
                        role: newUserRole
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Create user profile (trigger should handle this, but we'll ensure it)
                const { error: profileError } = await supabase.from('users').upsert({
                    id: authData.user.id,
                    email: newUserEmail,
                    full_name: newUserName,
                    role: newUserRole,
                    is_verified: false
                });

                if (profileError) throw profileError;

                // Create role-specific profile
                if (newUserRole === 'teacher') {
                    await supabase.from('teachers').insert({
                        id: authData.user.id,
                        department: newUserDepartment,
                    });
                } else if (newUserRole === 'student') {
                    await supabase.from('students').insert({
                        id: authData.user.id,
                        enrollment_number: newUserEnrollment,
                        class_level: newUserClassLevel,
                        branch: newUserBranch,
                    });
                }

                Alert.alert('Success', 'User created successfully. Remember to verify them!');
                setCreateModalVisible(false);
                resetCreateForm();
                fetchUsers();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create user');
            console.error('Create user error:', error);
        } finally {
            setCreating(false);
        }
    };

    const resetCreateForm = () => {
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('student');
        setNewUserDepartment(DEPARTMENTS[0]);
        setNewUserEnrollment('');
        setNewUserClassLevel(CLASS_LEVELS[0].value);
        setNewUserBranch(BRANCHES[0]);
    };

    const handleExportUsers = async () => {
        try {
            let csv = 'ID,Email,Full Name,Role,Verified,Department,Enrollment Number,Class Level,Branch\n';
            users.forEach(user => {
                const row = [
                    user.id,
                    user.email,
                    user.full_name,
                    user.role,
                    user.is_verified ? 'Yes' : 'No',
                    user.department || '',
                    user.enrollment_number || '',
                    user.class_level || '',
                    user.branch || ''
                ].map(field => `"${field || ''}"`).join(',');
                csv += row + '\n';
            });

            await exportCSV(csv, 'users_export.csv');
        } catch (error) {
            Alert.alert('Error', 'Failed to export users');
            console.error(error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchQuery ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesVerification = filterVerification === 'all' || 
            (filterVerification === 'verified' && user.is_verified) ||
            (filterVerification === 'unverified' && !user.is_verified);
        return matchesSearch && matchesRole && matchesVerification;
    });

    const userStats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        students: users.filter(u => u.role === 'student').length,
        unverified: users.filter(u => !u.is_verified).length,
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return tokens.colors.roles.admin.main;
            case 'teacher': return tokens.colors.roles.teacher.main;
            case 'student': return tokens.colors.roles.student.main;
            default: return tokens.colors.neutral.gray500;
        }
    };

    const { tokens, getTextColor, getTextSecondaryColor, getSurfaceColor } = useTheme();

    const styles = StyleSheet.create({
        container: { flex: 1 },
        header: { 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            padding: tokens.spacing.lg,
            paddingTop: tokens.spacing.xl,
        },
        headerTitle: {
            fontSize: tokens.typography.h1.fontSize,
            fontWeight: tokens.typography.h1.fontWeight,
            color: tokens.colors.neutral.white,
            marginBottom: tokens.spacing.xs / 2,
        },
        headerSubtitle: {
            fontSize: tokens.typography.body.fontSize,
            color: tokens.colors.neutral.white,
        },
        headerButton: {
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: tokens.borders.radius.medium,
        },
        createButton: {
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: tokens.borders.radius.medium,
            backgroundColor: tokens.colors.primary.main,
        },
        statsContainer: { 
            flexDirection: 'row', 
            padding: tokens.spacing.md,
            gap: tokens.spacing.md,
        },
        statCard: { 
            minWidth: 120,
            marginRight: tokens.spacing.sm,
        },
        statContent: {
            alignItems: 'center',
            gap: tokens.spacing.sm,
        },
        statValue: { 
            fontSize: tokens.typography.display.fontSize, 
            fontWeight: tokens.typography.display.fontWeight,
            color: tokens.colors.neutral.gray900,
        },
        statLabel: { 
            fontSize: tokens.typography.caption.fontSize, 
            marginTop: tokens.spacing.xs, 
            textAlign: 'center',
            color: tokens.colors.neutral.gray800,
            fontWeight: '600',
        },
        searchContainer: {
            paddingHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
        },
        filterButtons: { 
            marginHorizontal: tokens.spacing.md, 
            marginBottom: tokens.spacing.sm,
        },
        list: { 
            padding: tokens.spacing.md,
            paddingBottom: tokens.spacing.xl,
        },
        card: { marginBottom: tokens.spacing.md },
        cardContent: { 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: tokens.spacing.md,
        },
        userInfo: { flex: 1 },
        userName: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
        },
        email: { 
            marginBottom: tokens.spacing.sm, 
            marginTop: tokens.spacing.xs, 
            fontSize: tokens.typography.body.fontSize,
        },
        badges: { 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: tokens.spacing.xs, 
            marginTop: tokens.spacing.sm,
        },
        badge: {
            width: 24,
            height: 24,
            borderRadius: tokens.borders.radius.full,
            justifyContent: 'center',
            alignItems: 'center',
        },
        roleBadge: {
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs / 2,
            borderRadius: tokens.borders.radius.full,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing.xs / 2,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs / 2,
            borderRadius: tokens.borders.radius.full,
        },
        infoBadge: {
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs / 2,
            borderRadius: tokens.borders.radius.full,
        },
        badgeText: {
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: '600',
            color: tokens.colors.neutral.white,
        },
        infoBadgeText: {
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: '600',
            color: tokens.colors.neutral.gray900,
        },
        actions: { 
            flexDirection: 'row', 
            gap: tokens.spacing.sm,
        },
        actionButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: { 
            width: '90%',
            maxHeight: '80%',
            padding: tokens.spacing.lg,
            borderRadius: tokens.borders.radius.large,
        },
        modalTitle: {
            fontSize: tokens.typography.h2.fontSize,
            fontWeight: tokens.typography.h2.fontWeight,
            marginBottom: tokens.spacing.md,
        },
        pickerContainer: { 
            borderRadius: tokens.borders.radius.medium, 
            borderWidth: 1, 
            borderColor: tokens.colors.neutral.gray300, 
            marginBottom: tokens.spacing.md,
        },
        label: { 
            fontSize: tokens.typography.body.fontSize, 
            fontWeight: '600', 
            marginBottom: tokens.spacing.sm, 
            marginTop: tokens.spacing.sm, 
            paddingHorizontal: tokens.spacing.sm,
            color: getTextColor(),
        },
        modalActions: { 
            flexDirection: 'row', 
            justifyContent: 'flex-end', 
            marginTop: tokens.spacing.md, 
            gap: tokens.spacing.sm,
        },
    });

    const renderUserItem = ({ item }: { item: UserData }) => (
        <Card variant="glassmorphic" style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.userInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.userName, { color: getTextColor() }]}>{item.full_name || 'No Name'}</Text>
                        {!item.is_verified && (
                            <View style={[styles.badge, { backgroundColor: tokens.colors.warning.main }]}>
                                <Ionicons name="alert-circle" size={16} color="white" />
                            </View>
                        )}
                    </View>
                    <Text style={[styles.email, { color: getTextSecondaryColor() }]}>{item.email}</Text>
                    <View style={styles.badges}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
                            <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
                        </View>
                        {item.is_verified ? (
                            <View style={[styles.statusBadge, { backgroundColor: tokens.colors.success.main }]}>
                                <Ionicons name="checkmark-circle" size={12} color="white" />
                                <Text style={styles.badgeText}>Verified</Text>
                            </View>
                        ) : (
                            <View style={[styles.statusBadge, { backgroundColor: tokens.colors.warning.main }]}>
                                <Ionicons name="alert-circle" size={12} color="white" />
                                <Text style={styles.badgeText}>Pending</Text>
                            </View>
                        )}
                        {item.role === 'teacher' && item.department && (
                            <View style={[styles.infoBadge, { backgroundColor: tokens.colors.neutral.gray200 }]}>
                                <Text style={styles.infoBadgeText}>{item.department}</Text>
                            </View>
                        )}
                        {item.role === 'student' && item.enrollment_number && (
                            <View style={[styles.infoBadge, { backgroundColor: tokens.colors.neutral.gray200 }]}>
                                <Text style={styles.infoBadgeText}>{item.enrollment_number}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.actions}>
                    {!item.is_verified ? (
                        <TouchableOpacity onPress={() => handleVerifyUser(item.id)} style={styles.actionButton}>
                            <Ionicons name="checkmark-circle" size={24} color={tokens.colors.success.main} />
                        </TouchableOpacity>
                    ) : item.role !== 'admin' && (
                        <TouchableOpacity onPress={() => handleUnverifyUser(item.id)} style={styles.actionButton}>
                            <Ionicons name="close-circle" size={24} color={tokens.colors.warning.main} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
                        <Ionicons name="pencil" size={24} color={tokens.colors.primary.main} />
                    </TouchableOpacity>
                    {item.role !== 'admin' && (
                        <TouchableOpacity onPress={() => {
                            setUserToDelete(item);
                            setDeleteConfirmVisible(true);
                        }} style={styles.actionButton}>
                            <Ionicons name="trash" size={24} color={tokens.colors.error.main} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );

    return (
        <GradientBackground variant="admin">
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>User Management</Text>
                        <Text style={styles.headerSubtitle}>Manage users and roles</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: tokens.spacing.sm }}>
                        <TouchableOpacity onPress={handleExportUsers} style={styles.headerButton}>
                            <Ionicons name="download-outline" size={24} color={tokens.colors.neutral.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCreateModalVisible(true)} style={styles.createButton}>
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            {/* Statistics */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
                <GlassmorphicWidget style={styles.statCard}>
                    <View style={styles.statContent}>
                        <Ionicons name="people" size={24} color={tokens.colors.info.main} />
                        <Text style={styles.statValue}>{userStats.total}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                </GlassmorphicWidget>
                <GlassmorphicWidget style={styles.statCard}>
                    <View style={styles.statContent}>
                        <Ionicons name="shield-checkmark" size={24} color={tokens.colors.roles.admin.main} />
                        <Text style={styles.statValue}>{userStats.admins}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                    </View>
                </GlassmorphicWidget>
                <GlassmorphicWidget style={styles.statCard}>
                    <View style={styles.statContent}>
                        <Ionicons name="briefcase" size={24} color={tokens.colors.roles.teacher.main} />
                        <Text style={styles.statValue}>{userStats.teachers}</Text>
                        <Text style={styles.statLabel}>Teachers</Text>
                    </View>
                </GlassmorphicWidget>
                <GlassmorphicWidget style={styles.statCard}>
                    <View style={styles.statContent}>
                        <Ionicons name="school" size={24} color={tokens.colors.roles.student.main} />
                        <Text style={styles.statValue}>{userStats.students}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                </GlassmorphicWidget>
                <GlassmorphicWidget style={styles.statCard}>
                    <View style={styles.statContent}>
                        <Ionicons name="alert-circle" size={24} color={tokens.colors.warning.main} />
                        <Text style={styles.statValue}>{userStats.unverified}</Text>
                        <Text style={styles.statLabel}>Unverified</Text>
                    </View>
                </GlassmorphicWidget>
            </ScrollView>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Input
                    label="Search"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={<Ionicons name="search" size={20} color={tokens.colors.neutral.gray500} />}
                    style={{ marginBottom: 0 }}
                />
            </View>

            <SegmentedButtons
                value={filterRole}
                onValueChange={setFilterRole}
                buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'admin', label: 'Admins' },
                    { value: 'teacher', label: 'Teachers' },
                    { value: 'student', label: 'Students' },
                ]}
                style={styles.filterButtons}
            />

            <SegmentedButtons
                value={filterVerification}
                onValueChange={setFilterVerification}
                buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'verified', label: 'Verified' },
                    { value: 'unverified', label: 'Unverified' },
                ]}
                style={styles.filterButtons}
            />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingSpinner size="large" />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<EmptyState icon="account-off" title="No users found" />}
                />
            )}

            {/* Edit User Modal */}
            <Modal visible={visible} onRequestClose={() => setVisible(false)} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: getSurfaceColor() }]}>
                        <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalTitle, { color: getTextColor() }]}>Edit User</Text>
                            
                            <Input 
                                label="Full Name *" 
                                value={editName} 
                                onChangeText={setEditName} 
                            />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Role</Text>
                            <Picker selectedValue={editRole} onValueChange={(value) => setEditRole(value as any)}>
                                <Picker.Item label="Student" value="student" />
                                <Picker.Item label="Teacher" value="teacher" />
                                <Picker.Item label="Admin" value="admin" />
                            </Picker>
                        </View>

                        {editRole === 'teacher' && (
                            <View style={styles.pickerContainer}>
                                <Text style={styles.label}>Department</Text>
                                <Picker selectedValue={editDepartment} onValueChange={setEditDepartment}>
                                    {DEPARTMENTS.map(dept => (
                                        <Picker.Item key={dept} label={dept} value={dept} />
                                    ))}
                                </Picker>
                            </View>
                        )}

                        {editRole === 'student' && (
                            <>
                                <Input 
                                    label="Enrollment Number *" 
                                    value={editEnrollment} 
                                    onChangeText={setEditEnrollment} 
                                />
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.label}>Class Level</Text>
                                    <Picker selectedValue={editClassLevel} onValueChange={setEditClassLevel}>
                                        {CLASS_LEVELS.map(level => (
                                            <Picker.Item key={level.value} label={level.label} value={level.value} />
                                        ))}
                                    </Picker>
                                </View>
                                {editClassLevel?.startsWith('grad_year') && (
                                    <View style={styles.pickerContainer}>
                                        <Text style={styles.label}>Branch</Text>
                                        <Picker selectedValue={editBranch} onValueChange={setEditBranch}>
                                            {BRANCHES.map(branch => (
                                                <Picker.Item key={branch} label={branch} value={branch} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <Button variant="secondary" onPress={() => setVisible(false)} style={{ marginRight: tokens.spacing.sm }}>
                                Cancel
                            </Button>
                            <Button variant="primary" onPress={handleSave} loading={saving}>
                                Save
                            </Button>
                        </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Create User Modal */}
            <Modal visible={createModalVisible} onRequestClose={() => setCreateModalVisible(false)} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: getSurfaceColor() }]}>
                        <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalTitle, { color: getTextColor() }]}>Create New User</Text>

                        <SegmentedButtons
                            value={newUserRole}
                            onValueChange={(value) => setNewUserRole(value as any)}
                            buttons={[
                                { value: 'student', label: 'Student' },
                                { value: 'teacher', label: 'Teacher' },
                            ]}
                            style={{ marginBottom: 15 }}
                        />

                        <Input label="Full Name *" value={newUserName} onChangeText={setNewUserName} />
                        <Input label="Email *" value={newUserEmail} onChangeText={setNewUserEmail} autoCapitalize="none" keyboardType="email-address" />
                        <Input label="Password *" value={newUserPassword} onChangeText={setNewUserPassword} secureTextEntry />

                        {newUserRole === 'teacher' && (
                            <View style={styles.pickerContainer}>
                                <Text style={styles.label}>Department</Text>
                                <Picker selectedValue={newUserDepartment} onValueChange={setNewUserDepartment}>
                                    {DEPARTMENTS.map(dept => (
                                        <Picker.Item key={dept} label={dept} value={dept} />
                                    ))}
                                </Picker>
                            </View>
                        )}

                        {newUserRole === 'student' && (
                            <>
                                <Input label="Enrollment Number *" value={newUserEnrollment} onChangeText={setNewUserEnrollment} />
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.label}>Class Level</Text>
                                    <Picker selectedValue={newUserClassLevel} onValueChange={setNewUserClassLevel}>
                                        {CLASS_LEVELS.map(level => (
                                            <Picker.Item key={level.value} label={level.label} value={level.value} />
                                        ))}
                                    </Picker>
                                </View>
                                {newUserClassLevel?.startsWith('grad_year') && (
                                    <View style={styles.pickerContainer}>
                                        <Text style={styles.label}>Branch</Text>
                                        <Picker selectedValue={newUserBranch} onValueChange={setNewUserBranch}>
                                            {BRANCHES.map(branch => (
                                                <Picker.Item key={branch} label={branch} value={branch} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <Button variant="secondary" onPress={() => setCreateModalVisible(false)} style={{ marginRight: tokens.spacing.sm }}>
                                Cancel
                            </Button>
                            <Button variant="primary" onPress={handleCreateUser} loading={creating}>
                                Create
                            </Button>
                        </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <ConfirmDialog
                visible={deleteConfirmVisible}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmVisible(false)}
            />
            </View>
        </GradientBackground>
    );
}
