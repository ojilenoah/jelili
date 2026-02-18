'use client';
import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSender } from '@/context/sender-context';

interface ChatViewProps {
  messages: (Omit<Message, 'createdAt'> & { createdAt: Date })[];
}

export default function ChatView({ messages }: ChatViewProps) {
  const firestore = useFirestore();
  const { sender } = useSender();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !firestore || !sender) return;

    const messagesCollection = collection(firestore, 'messages');
    try {
      await addDoc(messagesCollection, {
        text: newMessage,
        sender: sender,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="flex h-[60vh] w-full flex-col rounded-lg border border-border/50 bg-white/30 frosted-glass">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex flex-col', {
                'items-end': message.sender === 'Noah',
                'items-start': message.sender === 'Jelili',
              })}
            >
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 shadow-sm frosted-glass',
                  {
                    'bg-deep-red/5 text-primary-foreground shadow-[0_0_10px] shadow-deep-red/10': message.sender === 'Noah',
                    'bg-mint-green/5 text-accent-foreground shadow-[0_0_10px] shadow-mint-green/10': message.sender === 'Jelili',
                  }
                )}
              >
                <p className={cn("text-sm", {
                    "text-red-900": message.sender === "Noah",
                    "text-green-900": message.sender === "Jelili"
                })}>{message.text}</p>
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {message.createdAt ? format(message.createdAt, 'p') : ''}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border/50 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write something for today..."
            className="flex-1 rounded-full bg-white/50 focus:ring-mint-green/50 focus:ring-2 transition-shadow"
            disabled={!sender}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-mint-green text-white shadow-lg hover:scale-105 hover:shadow-mint-green/30 transition-all"
            disabled={!sender}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
