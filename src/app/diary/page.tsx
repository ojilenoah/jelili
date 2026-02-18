'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Message } from '@/lib/types';
import ContributionGraph from '@/components/diary/contribution-graph';
import ChatView from '@/components/diary/chat-view';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase-client';

export default function DiaryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures that any client-side-only logic runs after the component has mounted.
    setIsClient(true);
  }, []);

  // This function adds a new message, preventing duplicates.
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages((prevMessages) => {
      if (prevMessages.some((m) => m.id === newMessage.id)) {
        return prevMessages;
      }
      return [...prevMessages, newMessage];
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1).toISOString();
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          handleNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNewMessage]);

  const processedMessages = useMemo(() => {
    return messages
      .map((m) => ({
        ...m,
        createdAt: new Date(m.created_at),
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messages]);


  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 p-4 md:p-8 font-body text-foreground">
      <div className="w-full max-w-5xl">
        {(loading && messages.length === 0) || !isClient ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : (
          <ContributionGraph messages={processedMessages} />
        )}
      </div>
      <div className="w-full max-w-5xl flex-1">
        {loading && messages.length === 0 ? (
          <Skeleton className="h-[500px] w-full rounded-lg" />
        ) : (
          <ChatView messages={processedMessages} onNewMessage={handleNewMessage} />
        )}
      </div>
    </div>
  );
}
