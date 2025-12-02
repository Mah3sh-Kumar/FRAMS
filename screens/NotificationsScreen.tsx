import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Title, Card, Text, IconButton, Button, Chip } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications,
    type Notification,
} from '../lib/notifications';
import { tokens } from '../lib/design-system/tokens';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
    const { session } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();

        // Subscribe to real-time updates
        const userId = session?.user?.id;
        if (!userId) return;

        const unsubscribe = subscribeToNotifications(userId, (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
        });

        return () => {
            unsubscribe();
        };
    }, [session]);

    const loadNotifications = async () => {
        setLoading(true);
        const data = await fetchNotifications();
        setNotifications(data);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleMarkAsRead = async (id: string) => {
        const success = await markAsRead(id);
        if (success) {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        const success = await markAllAsRead();
        if (success) {
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
        }
    };

    const handleDelete = async (id: string) => {
        const success = await deleteNotification(id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
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
                return tokens.colors.info.main;
            case 'grade':
                return tokens.colors.success.main;
            case 'attendance':
                return tokens.colors.warning.main;
            default:
                return tokens.colors.primary.main;
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
                !item.read && styles.unreadCard,
            ]}
            onPress={() => handleMarkAsRead(item.id)}
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
                        {!item.read && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                    <View style={styles.footer}>
                        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                        <IconButton
                            icon="delete"
                            size={20}
                            iconColor={tokens.colors.error.main}
                            onPress={() => handleDelete(item.id)}
                            style={{ minWidth: 48, minHeight: 48 }}
                        />
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading) {
        return <LoadingSpinner text="Loading notifications..." />;
    }

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
                        onPress={handleMarkAllAsRead}
                        compact
                    >
                        Mark All Read
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
        backgroundColor: tokens.colors.theme.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacing.md,
        backgroundColor: tokens.colors.theme.light.surface,
        ...tokens.shadows.sm,
    },
    listContent: {
        padding: tokens.spacing.md,
    },
    notificationCard: {
        marginBottom: tokens.spacing.md,
        borderRadius: tokens.borders.medium,
        ...tokens.shadows.sm,
    },
    unreadCard: {
        backgroundColor: tokens.colors.primary.light + '10',
        borderLeftWidth: 4,
        borderLeftColor: tokens.colors.primary.main,
    },
    cardContent: {
        flexDirection: 'row',
        padding: tokens.spacing.md,
    },
    iconContainer: {
        marginRight: tokens.spacing.sm,
        minWidth: 48,
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: tokens.spacing.xs,
    },
    title: {
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        lineHeight: tokens.typography.h3.lineHeight,
        color: tokens.colors.theme.light.text,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: tokens.borders.full,
        backgroundColor: tokens.colors.primary.main,
        marginLeft: tokens.spacing.xs,
    },
    message: {
        fontSize: tokens.typography.body.fontSize,
        lineHeight: tokens.typography.body.lineHeight,
        color: tokens.colors.theme.light.textSecondary,
        marginBottom: tokens.spacing.xs,
    },
    date: {
        fontSize: tokens.typography.caption.fontSize,
        lineHeight: tokens.typography.caption.lineHeight,
        color: tokens.colors.neutral.gray500,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 48,
    },
});
