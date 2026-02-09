import { useCallback, useEffect, useRef, useState } from 'react';

interface NotificationData {
    id: number;
    user_id: number | null;
    type: string;
    title: string;
    message: string | null;
    data: {
        order_id: number;
        customer_name: string;
        table_number?: string;
        order_type: string;
        total_amount: number;
        items_count: number;
    } | null;
    read_at: string | null;
    created_at: string;
}

interface OrderNotification {
    id: number;
    customer_name: string;
    table_number?: string;
    type: string;
    total_amount: number;
    items_count: number;
    created_at: string;
    read: boolean;
}

interface UseOrderNotificationsReturn {
    newOrdersCount: number;
    notifications: OrderNotification[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useOrderNotifications(
    enabled: boolean,
    onNewOrder?: (order: OrderNotification) => void,
): UseOrderNotificationsReturn {
    const [notifications, setNotifications] = useState<OrderNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastNotificationIdRef = useRef<number>(0);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/bell.mp3');
        return () => {
            if (audioRef.current) {
                audioRef.current = null;
            }
        };
    }, []);

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                console.debug('Could not play notification sound');
            });
        }
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!enabled) return;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(
                route('notifications.index', { unread_only: false }),
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    credentials: 'same-origin',
                },
            );

            if (response.ok) {
                const data = await response.json();

                const transformedNotifications: OrderNotification[] =
                    data.notifications.map((notif: NotificationData) => ({
                        id: notif.id,
                        customer_name: notif.data?.customer_name || '',
                        table_number: notif.data?.table_number,
                        type: notif.data?.order_type || notif.type,
                        total_amount: notif.data?.total_amount || 0,
                        items_count: notif.data?.items_count || 0,
                        created_at: notif.created_at,
                        read: notif.read_at !== null,
                    }));

                // Check for new notifications
                const newNotifs = transformedNotifications.filter(
                    (n) => !n.read && n.id > lastNotificationIdRef.current,
                );

                if (newNotifs.length > 0) {
                    // Play sound for each new notification
                    newNotifs.forEach(() => playNotificationSound());

                    // Trigger callback for new orders
                    if (onNewOrder) {
                        newNotifs.forEach((notif) => onNewOrder(notif));
                    }

                    // Update last notification ID
                    const maxId = Math.max(...newNotifs.map((n) => n.id));
                    lastNotificationIdRef.current = maxId;
                }

                setNotifications(transformedNotifications);
                setUnreadCount(data.unread_count);
                setIsConnected(true);
            } else {
                console.error('Failed to fetch notifications:', response.status, await response.text());
                setIsConnected(false);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setIsConnected(false);
        }
    }, [enabled, playNotificationSound, onNewOrder]);

    // Refresh notifications (manual trigger)
    const refresh = useCallback(async () => {
        setIsLoading(true);
        await fetchNotifications();
        setIsLoading(false);
    }, [fetchNotifications]);

    // Initial fetch and polling
    useEffect(() => {
        if (!enabled) {
            // Clear polling interval if disabled
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            return;
        }

        // Initial fetch
        refresh();

        // Set up polling every 10 seconds
        pollingIntervalRef.current = setInterval(() => {
            fetchNotifications();
        }, 10000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [enabled, refresh, fetchNotifications]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            console.log('Marking notification as read:', notificationId);
            const url = route('notifications.mark-read', notificationId);
            console.log('URL:', url);

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                console.error('Failed to mark as read:', response.status, responseText);
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log('Mark as read response:', data);

            // Update local state
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            console.log('Marking all notifications as read');
            const url = route('notifications.mark-all-read');
            console.log('URL:', url);

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                console.error('Failed to mark all as read:', response.status, responseText);
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log('Mark all as read response:', data);

            // Update local state
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, read: true })),
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, []);

    // Clear (delete) read notifications
    const clearRead = useCallback(async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            await fetch(route('notifications.delete-read'), {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
            });

            // Update local state - remove read notifications
            setNotifications((prev) => prev.filter((n) => !n.read));
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    }, []);

    const newOrdersCount = unreadCount;

    return {
        newOrdersCount,
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        markAsRead,
        markAllAsRead,
        clearRead,
        refresh,
    };
}
