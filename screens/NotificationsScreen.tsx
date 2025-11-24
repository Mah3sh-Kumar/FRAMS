import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Title, Card, Text, IconButton, Button, Chip } from 'react-native-paper';
import { colors, spacing, typography, shadows } from '../lib/theme';
import EmptyState from '../components/EmptyState';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Notifications'>;

interface Notification {
    id: string;
    type: 'assignment' | 'grade' | 'attendance' | 'general';
    title: string;
    message: string;
    date: string;
    isRead: boolean;
}

export default function NotificationsScreen({ navigation }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        // TODO: Fetch from database when notification system is implemented
        // For now, showing sample notifications
        const sampleNotifications: Notification[] = [
            {
                id: '1',
                type: 'assignment',
                title: 'New Assignment Posted',
                message: 'Mathematics: Chapter 5 Problems - Due in 3 days',
                date: new Date().toISOString(),
                isRead: false,
            },
            {
                id: '2',
                type: 'grade',
                title: 'Assignment Graded',
                message: 'Your Physics Lab Report has been graded: 85/100',
                date: new Date(Date.now() - 86400000).toISOString(),
                isRead: true,
            },
            {
                id: '3',
                type: 'attendance',
                title: 'Attendance Alert',
                message: 'Your attendance in Chemistry is below 75%',
                date: new Date(Date.now() - 172800000).toISOString(),
                isRead: false,
            },
        ];
        setNotifications(sampleNotifications);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'assignment':
                return 'file-document';
            case 'grade':
                return 'star';
            case 'attendance':
                return 'calendar-check';
            default:
                return 'bell';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'assignment':
                return colors.info.main;
            case 'grade':
                return colors.success.main;
            case 'attendance':
                return colors.warning.main;
            default:
                return colors.primary.main;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <Card
            style={[
                styles.notificationCard,
                !item.isRead && styles.unreadCard,
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <IconButton
                        icon={getIconName(item.type)}
                        iconColor={getIconColor(item.type)}
                        size={24}
                        style={styles.icon}
                    />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{item.title}</Text>
                        {!item.isRead && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    if (notifications.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Title>Notifications</Title>
                </View>
                <EmptyState
                    icon="bell-outline"
                    title="No Notifications"
                    message="You're all caught up! New notifications will appear here."
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title>Notifications</Title>
                {notifications.length > 0 && (
                    <Button
                        mode="text"
                        onPress={clearAll}
                        compact
                    >
                        Clear All
                    </Button>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.background.paper,
        ...shadows.sm,
    },
    listContent: {
        padding: spacing.md,
    },
    notificationCard: {
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    unreadCard: {
        backgroundColor: colors.primary.light + '10',
        borderLeftWidth: 4,
        borderLeftColor: colors.primary.main,
    },
    cardContent: {
        flexDirection: 'row',
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    icon: {
        margin: 0,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary.main,
        marginLeft: spacing.xs,
    },
    message: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: typography.fontSize.xs,
        color: colors.text.disabled,
    },
});
