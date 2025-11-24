'use client';

import { formatDistanceToNow } from 'date-fns';
import { Database } from '@/types/database';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, MessageSquare, FileWarning } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const router = useRouter();

  const getIcon = () => {
    switch (notification.type) {
      case 'step_completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'document_corrupted':
        return <FileWarning className="h-5 w-5 text-red-500" />;
      case 'remark_added':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'lead_assigned':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to the lead if lead_id is present
    if (notification.lead_id) {
      router.push(`/customer/dashboard?lead=${notification.lead_id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-4 cursor-pointer hover:bg-accent transition-colors',
        !notification.read && 'bg-blue-50 dark:bg-blue-950/20'
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-medium',
                !notification.read && 'font-semibold'
              )}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
