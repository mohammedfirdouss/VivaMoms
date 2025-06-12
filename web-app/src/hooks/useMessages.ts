
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'audio' | 'video' | 'system';
  content: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export const useMessages = (consultationId?: string, userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!consultationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            first_name,
            last_name,
            role
          )
        `)
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } else {
        // Type the data properly and filter out invalid entries
        const rawData = data as any[];
        const validMessages = rawData.filter(message => {
          return message.sender && 
                 typeof message.sender === 'object' &&
                 !message.sender.error;
        });
        
        setMessages(validMessages as Message[]);
        
        // Mark messages as read if user is recipient
        if (userId) {
          const unreadMessages = validMessages.filter(
            msg => msg.recipient_id === userId && !msg.is_read
          );
          
          if (unreadMessages.length > 0) {
            await supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .in('id', unreadMessages.map(msg => msg.id));
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, recipientId: string) => {
    if (!consultationId || !userId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          consultation_id: consultationId,
          sender_id: userId,
          recipient_id: recipientId,
          content,
          message_type: 'text'
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        console.error('Error sending message:', error);
      } else {
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [consultationId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!consultationId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `consultation_id=eq.${consultationId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};
