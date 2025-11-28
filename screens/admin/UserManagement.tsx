import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, ScrollView } from 'react-native';
import { Title, TextInput, Button, SegmentedButtons, Card, Text, IconButton, Portal, Modal, ActivityIndicator, Surface, Chip, Badge } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { verifyUser, unverifyUser, updateUserRole, deleteUser } from '../../lib/admin';
import FilterBar from '../../components/FilterBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { Picker } from '@react-native-picker/picker';
import { DEPARTMENTS, CLASS_LEVELS, BRANCHES } from '../../lib/constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

            const fileUri = `${FileSystem.documentDirectory}users_export.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csv);
            await Sharing.shareAsync(fileUri);
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
            case 'admin': return '#6200ee';
            case 'teacher': return '#03dac6';
            case 'student': return '#ff0266';
            default: return '#888';
        }
    };

    const renderUserItem = ({ item }: { item: UserData }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.userInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text variant="titleMedium">{item.full_name || 'No Name'}</Text>
                        {!item.is_verified && (
                            <Badge size={20} style={{ backgroundColor: '#ff9800' }}>!</Badge>
                        )}
                    </View>
                    <Text variant="bodyMedium" style={styles.email}>{item.email}</Text>
                    <View style={styles.badges}>
                        <Chip style={{ backgroundColor: getRoleColor(item.role) }} textStyle={{ color: 'white', fontSize: 11 }}>
                            {item.role.toUpperCase()}
                        </Chip>
                        {item.is_verified ? (
                            <Chip icon="check-circle" style={{ backgroundColor: '#4caf50' }} textStyle={{ color: 'white', fontSize: 11 }}>
                                Verified
                            </Chip>
                        ) : (
                            <Chip icon="alert-circle" style={{ backgroundColor: '#ff9800' }} textStyle={{ color: 'white', fontSize: 11 }}>
                                Pending
                            </Chip>
                        )}
                        {item.role === 'teacher' && item.department && (
                            <Chip style={{ backgroundColor: '#e0e0e0' }} textStyle={{ fontSize: 11 }}>
                                {item.department}
                            </Chip>
                        )}
                        {item.role === 'student' && item.enrollment_number && (
                            <Chip style={{ backgroundColor: '#e0e0e0' }} textStyle={{ fontSize: 11 }}>
                                {item.enrollment_number}
                            </Chip>
                        )}
                    </View>
                </View>
                <View style={styles.actions}>
                    {!item.is_verified ? (
                        <IconButton 
                            icon="check-circle" 
                            size={20} 
                            iconColor="#4caf50"
                            onPress={() => handleVerifyUser(item.id)} 
                        />
                    ) : item.role !== 'admin' && (
                        <IconButton 
                            icon="close-circle" 
                            size={20} 
                            iconColor="#ff9800"
                            onPress={() => handleUnverifyUser(item.id)} 
                        />
                    )}
                    <IconButton icon="pencil" size={20} onPress={() => openEditModal(item)} />
                    {item.role !== 'admin' && (
                        <IconButton icon="delete" size={20} iconColor="red" onPress={() => {
                            setUserToDelete(item);
                            setDeleteConfirmVisible(true);
                        }} />
                    )}
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title>User Management</Title>
                <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="export" onPress={handleExportUsers} />
                    <Button mode="contained" icon="plus" onPress={() => setCreateModalVisible(true)}>
                        Create
                    </Button>
                </View>
            </View>

            {/* Statistics */}
            <View style={styles.statsContainer}>
                <Surface style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                    <Text style={styles.statValue}>{userStats.total}</Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
                    <Text style={styles.statValue}>{userStats.admins}</Text>
                    <Text style={styles.statLabel}>Admins</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                    <Text style={styles.statValue}>{userStats.teachers}</Text>
                    <Text style={styles.statLabel}>Teachers</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                    <Text style={styles.statValue}>{userStats.students}</Text>
                    <Text style={styles.statLabel}>Students</Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
                    <Text style={styles.statValue}>{userStats.unverified}</Text>
                    <Text style={styles.statLabel}>Unverified</Text>
                </Surface>
            </View>

            <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search users..." />

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
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
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
            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
                    <ScrollView>
                        <Title style={{ marginBottom: 15 }}>Edit User</Title>
                        
                        <TextInput 
                            label="Full Name *" 
                            value={editName} 
                            onChangeText={setEditName} 
                            style={styles.input} 
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
                                <TextInput 
                                    label="Enrollment Number *" 
                                    value={editEnrollment} 
                                    onChangeText={setEditEnrollment} 
                                    style={styles.input} 
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
                            <Button onPress={() => setVisible(false)} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleSave} loading={saving}>Save</Button>
                        </View>
                    </ScrollView>
                </Modal>

                {/* Create User Modal */}
                <Modal visible={createModalVisible} onDismiss={() => setCreateModalVisible(false)} contentContainerStyle={styles.modal}>
                    <ScrollView>
                        <Title style={{ marginBottom: 15 }}>Create New User</Title>

                        <SegmentedButtons
                            value={newUserRole}
                            onValueChange={(value) => setNewUserRole(value as any)}
                            buttons={[
                                { value: 'student', label: 'Student' },
                                { value: 'teacher', label: 'Teacher' },
                            ]}
                            style={{ marginBottom: 15 }}
                        />

                        <TextInput label="Full Name *" value={newUserName} onChangeText={setNewUserName} style={styles.input} />
                        <TextInput label="Email *" value={newUserEmail} onChangeText={setNewUserEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
                        <TextInput label="Password *" value={newUserPassword} onChangeText={setNewUserPassword} secureTextEntry style={styles.input} />

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
                                <TextInput label="Enrollment Number *" value={newUserEnrollment} onChangeText={setNewUserEnrollment} style={styles.input} />
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
                            <Button onPress={() => setCreateModalVisible(false)} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleCreateUser} loading={creating}>Create</Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>

            <ConfirmDialog
                visible={deleteConfirmVisible}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', elevation: 2 },
    statsContainer: { flexDirection: 'row', gap: 8, padding: 15, flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: 100, padding: 12, borderRadius: 8, alignItems: 'center', elevation: 2 },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
    filterButtons: { marginHorizontal: 15, marginBottom: 10 },
    list: { padding: 15 },
    card: { marginBottom: 10, backgroundColor: 'white' },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userInfo: { flex: 1 },
    email: { color: '#666', marginBottom: 5, marginTop: 2 },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
    actions: { flexDirection: 'row' },
    modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8, maxHeight: '80%' },
    input: { marginBottom: 15, backgroundColor: 'white' },
    pickerContainer: { backgroundColor: 'white', borderRadius: 4, borderWidth: 1, borderColor: '#ccc', marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8, color: '#333', paddingHorizontal: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});
