'use client';
import { useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Message } from '@/lib/types';
import ContributionGraph from '@/components/diary/contribution-graph';
import ChatView from '@/components/diary/chat-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiaryPage() {
  const firestore = useFirestore();

  const messagesQuery = useMemo(() => {
    if (!firestore) return null;

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    return query(
      collection(firestore, 'messages'),
      where('createdAt', '>=', Timestamp.fromDate(startOfYear)),
      where('createdAt', '<=', Timestamp.fromDate(endOfYear)),
      orderBy('createdAt', 'asc')
    );
  }, [firestore]);

  const { data: messages, loading } = useCollection<Message>(messagesQuery);

  const processedMessages = useMemo(() => {
    return messages?.map(m => ({
      ...m,
      createdAt: m.createdAt?.toDate()
    })) || [];
  }, [messages]);


  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 p-4 md:p-8 font-body text-foreground">
      <div className="w-full max-w-5xl">
        {loading ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : (
          <ContributionGraph messages={processedMessages} />
        )}
      </div>
      <div className="w-full max-w-5xl flex-1">
        {loading ? (
          <Skeleton className="h-[500px] w-full rounded-lg" />
        ) : (
          <ChatView messages={processedMessages} />
        )}
      </div>
    </div>
  );
}
