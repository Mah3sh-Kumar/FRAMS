import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import { Menu, Divider, Portal, Modal, ActivityIndicator as PaperActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { fetchTeacherSubjects, fetchStudentsByClass, markAttendance } from '../../lib/database';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Button from '../../components/design-system/primitives/Button';
import Card from '../../components/design-system/primitives/Card';
import { Stack } from '../../components/design-system/layout';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import StudentProfileCard from '../../components/design-system/attendance/StudentProfileCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { exportCSV } from '../../lib/csvExport';

export default function AttendanceManager() {
    const { user } = useAuth();
    const { tokens, getTextColor, getTextSecondaryColor, getSurfaceColor, getBackgroundColor } = useTheme();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [marking, setMarking] = useState<Record<string, boolean>>({}); // Loading state for individual buttons
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });
    const [bulkConfirmVisible, setBulkConfirmVisible] = useState(false);
    const [bulkAction, setBulkAction] = useState<'present' | 'absent' | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late' | 'pending'>>({});

    useEffect(() => {
        if (user) {
            loadSubjects();
        }
    }, [user]);

    useEffect(() => {
        if (selectedSubject) {
            loadStudents(selectedSubject.class_id);
            loadAttendanceStats();
        } else {
            setStudents([]);
        }
    }, [selectedSubject, selectedDate]);

    async function loadSubjects() {
        if (!user) return;
        setLoading(true);
        const { data, error } = await fetchTeacherSubjects(user.id);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubject(data[0]); // Auto-select first subject
            }
        }
        setLoading(false);
    }

    async function loadStudents(classId: string) {
        if (!classId) return;
        setLoading(true);
        const { data, error } = await fetchStudentsByClass(classId);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setStudents(data);
            // Load existing attendance for the selected date
            await loadExistingAttendance(data);
        }
        setLoading(false);
    }

    async function loadExistingAttendance(studentList: any[]) {
        if (!selectedSubject) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('attendance')
            .select('student_id, status')
            .eq('subject_id', selectedSubject.id)
            .eq('date', dateStr);

        if (!error && data) {
            const attendanceMap: Record<string, 'present' | 'absent' | 'late'> = {};
            data.forEach(record => {
                attendanceMap[record.student_id] = record.status;
            });
            setAttendanceData(attendanceMap);
        }
    }

    async function loadAttendanceStats() {
        if (!selectedSubject) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('attendance')
            .select('status')
            .eq('subject_id', selectedSubject.id)
            .eq('date', dateStr);

        if (!error && data) {
            const present = data.filter(a => a.status === 'present').length;
            const absent = data.filter(a => a.status === 'absent').length;
            const late = data.filter(a => a.status === 'late').length;
            setStats({ present, absent, late, total: data.length });
        }
    }

    async function handleMarkAttendance(studentId: string, status: 'present' | 'absent' | 'late') {
        if (!selectedSubject) return;

        setMarking(prev => ({ ...prev, [studentId]: true }));
        const date = selectedDate.toISOString().split('T')[0];

        const { error } = await markAttendance(studentId, selectedSubject.id, status, date);

        if (error) {
            Alert.alert('Error', error);
        } else {
            setAttendanceData(prev => ({ ...prev, [studentId]: status }));
            loadAttendanceStats();
        }
        setMarking(prev => ({ ...prev, [studentId]: false }));
    }

    async function handleBulkMark(status: 'present' | 'absent') {
        if (!selectedSubject || !students.length) return;
        
        setLoading(true);
        const date = selectedDate.toISOString().split('T')[0];
        const promises = students.map(student => 
            markAttendance(student.id, selectedSubject.id, status, date)
        );

        await Promise.all(promises);
        Alert.alert('Success', `Marked all students as ${status}`);
        loadAttendanceStats();
        setLoading(false);
        setBulkConfirmVisible(false);
    }

    async function exportAttendance() {
        if (!selectedSubject) return;
        
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('*, students(full_name, enrollment_number)')
                .eq('subject_id', selectedSubject.id)
                .order('date', { ascending: false });

            if (error) throw error;

            let csv = 'Date,Student Name,Enrollment,Status\n';
            data?.forEach(record => {
                csv += `${record.date},${record.students?.full_name},${record.students?.enrollment_number},${record.status}\n`;
            });

            await exportCSV(csv, 'attendance_export.csv');
        } catch (error) {
            Alert.alert('Error', 'Failed to export attendance');
        }
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchQuery || 
            student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: getBackgroundColor(),
        },
        scrollContent: {
            padding: tokens.spacing.md,
        },
        title: {
            fontSize: tokens.typography.h1.fontSize,
            fontWeight: tokens.typography.h1.fontWeight,
            color: getTextColor(),
            marginBottom: tokens.spacing.lg,
        },
        selectorContainer: {
            marginBottom: tokens.spacing.md,
        },
        dateContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: tokens.spacing.md,
            gap: tokens.spacing.sm,
        },
        dateText: {
            fontSize: tokens.typography.body.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
            flex: 1,
            textAlign: 'center',
        },
        statsContainer: {
            flexDirection: 'row',
            gap: tokens.spacing.sm,
            marginVertical: tokens.spacing.md,
        },
        statCard: {
            flex: 1,
            padding: tokens.spacing.md,
            borderRadius: tokens.borders.radius.medium,
            alignItems: 'center',
            ...tokens.shadows.sm,
        },
        statValue: {
            fontSize: tokens.typography.h2.fontSize,
            fontWeight: tokens.typography.h2.fontWeight,
            color: getTextColor(),
        },
        statLabel: {
            fontSize: tokens.typography.caption.fontSize,
            color: getTextSecondaryColor(),
            marginTop: tokens.spacing.xs,
        },
        bulkActions: {
            flexDirection: 'row',
            gap: tokens.spacing.sm,
            marginVertical: tokens.spacing.md,
        },
        searchContainer: {
            marginBottom: tokens.spacing.md,
        },
        searchInput: {
            backgroundColor: getSurfaceColor(),
            borderRadius: tokens.borders.radius.medium,
            padding: tokens.spacing.md,
            fontSize: tokens.typography.body.fontSize,
            color: getTextColor(),
            borderWidth: 1,
            borderColor: tokens.colors.neutral.gray300,
        },
        studentCard: {
            marginBottom: tokens.spacing.md,
        },
        studentHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing.sm,
        },
        studentName: {
            fontSize: tokens.typography.h3.fontSize,
            fontWeight: tokens.typography.h3.fontWeight,
            color: getTextColor(),
        },
        enrollment: {
            color: getTextSecondaryColor(),
            fontSize: tokens.typography.caption.fontSize,
            marginTop: tokens.spacing.xs,
        },
        actionContainer: {
            flexDirection: 'row',
            gap: tokens.spacing.sm,
            marginTop: tokens.spacing.sm,
        },
        actionButton: {
            flex: 1,
        },
        emptyText: {
            textAlign: 'center',
            marginTop: tokens.spacing.xl,
            color: getTextSecondaryColor(),
            fontSize: tokens.typography.body.fontSize,
            fontStyle: 'italic',
        },
        menuButton: {
            backgroundColor: getSurfaceColor(),
            borderRadius: tokens.borders.radius.medium,
            padding: tokens.spacing.md,
            borderWidth: 1,
            borderColor: tokens.colors.neutral.gray300,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        menuButtonText: {
            fontSize: tokens.typography.body.fontSize,
            color: getTextColor(),
        },
    });

    if (loading && !students.length) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingSpinner size="large" />
                <Text style={{ marginTop: tokens.spacing.md, color: getTextColor() }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Attendance Manager</Text>

                {/* Subject Selector */}
                <View style={styles.selectorContainer}>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setMenuVisible(true)}
                            >
                                <Text style={styles.menuButtonText}>
                                    {selectedSubject ? `${selectedSubject.name} (${selectedSubject.classes?.name})` : 'Select Subject'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={getTextColor()} />
                            </TouchableOpacity>
                        }
                    >
                        {subjects.map((subject) => (
                            <Menu.Item
                                key={subject.id}
                                onPress={() => {
                                    setSelectedSubject(subject);
                                    setMenuVisible(false);
                                }}
                                title={`${subject.name} - ${subject.classes?.name}`}
                            />
                        ))}
                    </Menu>
                </View>

                {/* Date Picker */}
                {selectedSubject && (
                    <View style={styles.dateContainer}>
                        <Button 
                            variant="secondary"
                            size="small"
                            onPress={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() - 1);
                                setSelectedDate(newDate);
                            }}
                            icon={<Ionicons name="chevron-back" size={16} color={getTextColor()} />}
                        >
                            Prev
                        </Button>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </Text>
                        <Button 
                            variant="secondary"
                            size="small"
                            onPress={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() + 1);
                                setSelectedDate(newDate);
                            }}
                            icon={<Ionicons name="chevron-forward" size={16} color={getTextColor()} />}
                        >
                            Next
                        </Button>
                    </View>
                )}

                {/* Statistics */}
                {selectedSubject && stats.total > 0 && (
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: tokens.colors.success.light }]}>
                            <Text style={styles.statValue}>{stats.present}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: tokens.colors.error.light }]}>
                            <Text style={styles.statValue}>{stats.absent}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: tokens.colors.warning.light }]}>
                            <Text style={styles.statValue}>{stats.late}</Text>
                            <Text style={styles.statLabel}>Late</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: tokens.colors.info.light }]}>
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                    </View>
                )}

                {/* Bulk Actions */}
                {selectedSubject && (
                    <View style={styles.bulkActions}>
                        <View style={{ flex: 1 }}>
                            <Button 
                                variant="primary"
                                onPress={() => {
                                    setBulkAction('present');
                                    setBulkConfirmVisible(true);
                                }}
                                icon={<Ionicons name="checkmark-done" size={20} color={tokens.colors.neutral.white} />}
                            >
                                Mark All Present
                            </Button>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button 
                                variant="danger"
                                onPress={() => {
                                    setBulkAction('absent');
                                    setBulkConfirmVisible(true);
                                }}
                                icon={<Ionicons name="close-circle" size={20} color={tokens.colors.neutral.white} />}
                            >
                                Mark All Absent
                            </Button>
                        </View>
                        <Button 
                            variant="ghost"
                            onPress={exportAttendance}
                            icon={<Ionicons name="download" size={20} color={tokens.colors.primary.main} />}
                        >
                            Export
                        </Button>
                    </View>
                )}

                {/* Search */}
                {selectedSubject && (
                    <View style={styles.searchContainer}>
                        <View style={{ position: 'relative' }}>
                            <Ionicons 
                                name="search" 
                                size={20} 
                                color={getTextSecondaryColor()} 
                                style={{ position: 'absolute', left: tokens.spacing.md, top: 16, zIndex: 1 }}
                            />
                            <TextInput
                                placeholder="Search students..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={[styles.searchInput, { paddingLeft: tokens.spacing.xl + tokens.spacing.sm }]}
                                placeholderTextColor={getTextSecondaryColor()}
                            />
                        </View>
                    </View>
                )}

                {selectedSubject ? (
                    <Stack spacing="md">
                        {filteredStudents.length === 0 ? (
                            <Text style={styles.emptyText}>No students found.</Text>
                        ) : (
                            filteredStudents.map((item) => {
                                const currentStatus = attendanceData[item.id] || 'pending';
                                // Mock attendance stats - in real app, fetch from database
                                const attendanceStats = {
                                    present: 18,
                                    absent: 2,
                                    total: 20,
                                };
                                
                                return (
                                    <Card key={item.id} variant="elevated" style={styles.studentCard}>
                                        <View style={styles.studentHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.studentName}>{item.full_name}</Text>
                                                <Text style={styles.enrollment}>{item.enrollment_number}</Text>
                                            </View>
                                            {currentStatus !== 'pending' && (
                                                <View style={{
                                                    backgroundColor: currentStatus === 'present' 
                                                        ? tokens.colors.success.light 
                                                        : currentStatus === 'absent'
                                                        ? tokens.colors.error.light
                                                        : tokens.colors.warning.light,
                                                    paddingHorizontal: tokens.spacing.sm,
                                                    paddingVertical: tokens.spacing.xs,
                                                    borderRadius: tokens.borders.radius.small,
                                                }}>
                                                    <Text style={{
                                                        fontSize: tokens.typography.caption.fontSize,
                                                        fontWeight: tokens.typography.body.fontWeight,
                                                        color: currentStatus === 'present' 
                                                            ? tokens.colors.success.main 
                                                            : currentStatus === 'absent'
                                                            ? tokens.colors.error.main
                                                            : tokens.colors.warning.main,
                                                    }}>
                                                        {currentStatus.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.actionContainer}>
                                            <Button
                                                variant={currentStatus === 'present' ? 'primary' : 'secondary'}
                                                size="small"
                                                onPress={() => handleMarkAttendance(item.id, 'present')}
                                                loading={marking[item.id]}
                                                style={styles.actionButton}
                                                icon={<Ionicons name="checkmark-circle" size={16} color={currentStatus === 'present' ? tokens.colors.neutral.white : tokens.colors.success.main} />}
                                            >
                                                Present
                                            </Button>
                                            <Button
                                                variant={currentStatus === 'absent' ? 'danger' : 'secondary'}
                                                size="small"
                                                onPress={() => handleMarkAttendance(item.id, 'absent')}
                                                loading={marking[item.id]}
                                         style={styles.actionButton}
                                                icon={<Ionicons name="close-circle" size={16} color={currentStatus === 'absent' ? tokens.colors.neutral.white : tokens.colors.error.main} />}
                                            >
                                                Absent
                                    </Button>
                                            <Button
                                                variant={currentStatus === 'late' ? 'primary' : 'secondary'}
                                                size="small"
                                                onPress={() => handleMarkAttendance(item.id, 'late')}
                                                loading={marking[item.id]}
                                                style={styles.actionButton}
                                                icon={<Ionicons name="time" size={16} color={currentStatus === 'late' ? tokens.colors.neutral.white : tokens.colors.warning.main} />}
                                            >
                                                Late
                                            </Button>
                                        </View>
                                    </Card>
                                );
                            })
                        )}
                    </Stack>
                ) : (
                    <Text style={styles.emptyText}>Please select a subject to load students.</Text>
                )}
            </ScrollView>

            <ConfirmDialog
                visible={bulkConfirmVisible}
                title="Bulk Mark Attendance"
                message={`Are you sure you want to mark all students as ${bulkAction}?`}
                onConfirm={() => bulkAction && handleBulkMark(bulkAction)}
                onCancel={() => setBulkConfirmVisible(false)}
            />
        </View>
    );
}
