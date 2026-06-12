'use client';
import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSender } from '@/context/sender-context';
import { supabase } from '@/lib/supabase-client';

interface ChatViewProps {
  messages: (Message & { createdAt: Date })[];
  onNewMessage: (message: Message) => void;
}

export default function ChatView({ messages, onNewMessage }: ChatViewProps) {
  const { sender } = useSender();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !sender) return;

    const body = newMessage;
    setNewMessage('');

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{ body, sender, format: 'plain' }])
        .select()
        .single();

      if (error) throw error;
      if (data) onNewMessage(data as Message);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(body);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="flex h-[60vh] w-full flex-col rounded-md border border-border bg-card">
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nothing here yet. Write the first line.
            </p>
          )}
          {messages.map((message) => {
            const isMine = message.sender === sender;
            return (
              <div
                key={message.id}
                className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}
              >
                <span className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-code">
                  {message.sender}
                </span>
                <div
                  className={cn(
                    'max-w-md rounded-md px-4 py-2.5 text-sm leading-relaxed border',
                    isMine
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border'
                  )}
                >
                  {message.body}
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground font-code">
                  {message.createdAt ? format(message.createdAt, 'p') : ''}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write something for today..."
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground focus:outline-none px-2"
            disabled={!sender}
          />
          <button
            type="submit"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
            disabled={!sender || newMessage.trim() === ''}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
