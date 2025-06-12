import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  consultation_id?: string;
  created_at: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Placeholder for supabase fetch
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })
    //   .limit(50);

    // if (error) throw error;

    // Type the data properly and ensure type field is valid
    // const typedNotifications: Notification[] = (data || []).map(item => ({
    //   ...item,
    //   type: ['info', 'success', 'warning', 'error'].includes(item.type) 
    //     ? item.type as 'info' | 'success' | 'warning' | 'error'
    //     : 'info'
    // }));

    // setNotifications(typedNotifications);
    // setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
  };

  const markAsRead = async (notificationId: string) => {
    // Placeholder for supabase update
    // const { error } = await supabase
    //   .from('notifications')
    //   .update({ is_read: true })
    //   .eq('id', notificationId);

    // if (error) throw error;

    // setNotifications(prev => 
    //   prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    // );
    // setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    // Placeholder for supabase update
    // const { error } = await supabase
    //   .from('notifications')
    //   .update({ is_read: true })
    //   .eq('user_id', userId)
    //   .eq('is_read', false);

    // if (error) throw error;

    // setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    // setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    // Placeholder for supabase subscription
    // const channel = supabase
    //   .channel('notifications')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'INSERT',
    //       schema: 'public',
    //       table: 'notifications',
    //       filter: `user_id=eq.${userId}`
    //     },
    //     (payload) => {
    //       const newNotification = payload.new as any;
    //       const typedNotification: Notification = {
    //         ...newNotification,
    //         type: ['info', 'success', 'warning', 'error'].includes(newNotification.type) 
    //           ? newNotification.type as 'info' | 'success' | 'warning' | 'error'
    //           : 'info'
    //       };
    //       
    //       setNotifications(prev => [typedNotification, ...prev]);
    //       setUnreadCount(prev => prev + 1);
    //       
    //       // Show toast for new notification
    //       toast({
    //         title: typedNotification.title,
    //         description: typedNotification.message,
    //         variant: typedNotification.type === 'error' ? 'destructive' : 'default',
    //       });
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [userId, toast]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
