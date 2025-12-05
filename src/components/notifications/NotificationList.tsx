'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import NotificationItem from './NotificationItem';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationListProps {
  onNotificationRead?: () => void;
}

export default function NotificationList({ onNotificationRead }: NotificationListProps) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (status !== 'loading') {
      fetchNotifications();
    }
  }, [status, session]);

  const fetchNotifications = async () => {
    setLoading(true);

    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      onNotificationRead?.();
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Notifications</h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        <div className="divide-y divide-border">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
