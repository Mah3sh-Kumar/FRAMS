import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Title, TextInput, Button, SegmentedButtons, Card, Text, IconButton, Portal, Modal, ActivityIndicator, Searchbar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';

type UserData = {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'teacher' | 'student';
    department?: string;
    enrollment_number?: string;
};

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Modal State
    const [visible, setVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editName, setEditName] = useState('');
    const [editDepartment, setEditDepartment] = useState('');
    const [editEnrollment, setEditEnrollment] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;

            // Fetch teacher details
            const { data: teachersData, error: teachersError } = await supabase
                .from('teachers')
                .select('id, department');

            if (teachersError) console.error('Error fetching teachers:', teachersError);

            // Fetch student details
            const { data: studentsData, error: studentsError } = await supabase
                .from('students')
                .select('id, enrollment_number');

            if (studentsError) console.error('Error fetching students:', studentsError);

            // Merge data
            const mergedUsers = usersData.map((user: any) => {
                const teacher = teachersData?.find((t: any) => t.id === user.id);
                const student = studentsData?.find((s: any) => s.id === user.id);
                return {
                    ...user,
                    department: teacher?.department,
                    enrollment_number: student?.enrollment_number,
                };
            });

            setUsers(mergedUsers);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (user: UserData) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${user.full_name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete from public.users (Cascade should handle linked tables)
                            // Note: This won't delete from auth.users due to Supabase restrictions on client-side
                            // But it will remove them from the app's view.
                            const { error } = await supabase
                                .from('users')
                                .delete()
                                .eq('id', user.id);

                            if (error) throw error;

                            Alert.alert('Success', 'User profile deleted');
                            fetchUsers();
                        } catch (error: any) {
                            console.error('Error deleting user:', error);
                            Alert.alert('Error', 'Failed to delete user profile');
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (user: UserData) => {
        setSelectedUser(user);
        setEditName(user.full_name || '');
        setEditDepartment(user.department || '');
        setEditEnrollment(user.enrollment_number || '');
        setVisible(true);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        setSaving(true);
        try {
            // 1. Update basic info
            const { error: userError } = await supabase
                .from('users')
                .update({ full_name: editName })
                .eq('id', selectedUser.id);

            if (userError) throw userError;

            // 2. Update role-specific info
            if (selectedUser.role === 'teacher') {
                const { error: teacherError } = await supabase
                    .from('teachers')
                    .upsert({ id: selectedUser.id, department: editDepartment });

                if (teacherError) throw teacherError;
            } else if (selectedUser.role === 'student') {
                const { error: studentError } = await supabase
                    .from('students')
                    .upsert({ id: selectedUser.id, enrollment_number: editEnrollment });

                if (studentError) throw studentError;
            }

            Alert.alert('Success', 'User updated successfully');
            setVisible(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error updating user:', error);
            Alert.alert('Error', 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUserItem = ({ item }: { item: UserData }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.userInfo}>
                    <Text variant="titleMedium">{item.full_name || 'No Name'}</Text>
                    <Text variant="bodyMedium" style={styles.email}>{item.email}</Text>
                    <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: getRoleColor(item.role) }]}>
                            <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
                        </View>
                        {item.role === 'teacher' && item.department && (
                            <View style={[styles.badge, { backgroundColor: '#e0e0e0' }]}>
                                <Text style={[styles.badgeText, { color: '#333' }]}>{item.department}</Text>
                            </View>
                        )}
                        {item.role === 'student' && item.enrollment_number && (
                            <View style={[styles.badge, { backgroundColor: '#e0e0e0' }]}>
                                <Text style={[styles.badgeText, { color: '#333' }]}>{item.enrollment_number}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.actions}>
                    <IconButton icon="pencil" size={20} onPress={() => openEditModal(item)} />
                    <IconButton icon="delete" size={20} iconColor="red" onPress={() => handleDelete(item)} />
                </View>
            </Card.Content>
        </Card>
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return '#6200ee';
            case 'teacher': return '#03dac6';
            case 'student': return '#ff0266';
            default: return '#888';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title>User Management</Title>
                <Button mode="outlined" onPress={fetchUsers} loading={loading}>Refresh</Button>
            </View>

            <Searchbar
                placeholder="Search users..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No users found</Text>}
                />
            )}

            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
                    <Title style={{ marginBottom: 15 }}>Edit User</Title>
                    <TextInput
                        label="Full Name"
                        value={editName}
                        onChangeText={setEditName}
                        style={styles.input}
                    />

                    {selectedUser?.role === 'teacher' && (
                        <TextInput
                            label="Department"
                            value={editDepartment}
                            onChangeText={setEditDepartment}
                            style={styles.input}
                        />
                    )}

                    {selectedUser?.role === 'student' && (
                        <TextInput
                            label="Enrollment Number"
                            value={editEnrollment}
                            onChangeText={setEditEnrollment}
                            style={styles.input}
                        />
                    )}

                    <View style={styles.modalActions}>
                        <Button onPress={() => setVisible(false)} style={{ marginRight: 10 }}>Cancel</Button>
                        <Button mode="contained" onPress={handleSave} loading={saving}>Save</Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        elevation: 2,
    },
    searchBar: {
        margin: 15,
        elevation: 1,
    },
    list: {
        padding: 15,
    },
    card: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    email: {
        color: '#666',
        marginBottom: 5,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
});
