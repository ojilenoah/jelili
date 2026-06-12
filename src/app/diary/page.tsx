'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Message } from '@/lib/types';
import ContributionGraph from '@/components/diary/contribution-graph';
import ChatView from '@/components/diary/chat-view';
import SenderToggle from '@/components/diary/sender-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase-client';

export default function DiaryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1).toISOString();
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .is('deleted_at', null)
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
      .channel('chat-messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
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
      .map((m) => ({ ...m, createdAt: new Date(m.created_at) }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messages]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16 pb-32 flex flex-col gap-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-code">
              Diary
            </p>
            <h1 className="font-headline text-2xl md:text-3xl text-foreground mt-1">
              A quiet log of our days
            </h1>
          </div>
          <SenderToggle />
        </header>

        <section>
          {(loading && messages.length === 0) || !isClient ? (
            <Skeleton className="h-[180px] w-full rounded-md" />
          ) : (
            <ContributionGraph messages={processedMessages} />
          )}
        </section>

        <section className="flex-1">
          {loading && messages.length === 0 ? (
            <Skeleton className="h-[500px] w-full rounded-md" />
          ) : (
            <ChatView messages={processedMessages} onNewMessage={handleNewMessage} />
          )}
        </section>
      </div>
    </div>
  );
}
