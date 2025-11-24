import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Card, Text, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../lib/supabase';

export default function ReportsScreen() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        attendanceToday: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            setLoading(true);
            const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });

            const today = new Date().toISOString().split('T')[0];
            const { count: attendanceCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('date', today)
                .eq('status', 'present');

            setStats({
                totalStudents: studentCount || 0,
                totalTeachers: teacherCount || 0,
                attendanceToday: attendanceCount || 0,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <ActivityIndicator style={styles.loader} />;

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Institution Reports</Title>

            <View style={styles.cardsContainer}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>{stats.totalStudents}</Title>
                        <Text>Total Students</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title>{stats.totalTeachers}</Title>
                        <Text>Total Teachers</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title>{stats.attendanceToday}</Title>
                        <Text>Present Today</Text>
                    </Card.Content>
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    card: {
        width: '48%',
        marginBottom: 10,
    },
});
