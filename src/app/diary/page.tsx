'use client';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Message } from '@/lib/types';
import ContributionGraph from '@/components/diary/contribution-graph';
import ChatView from '@/components/diary/chat-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiaryPage() {
  const { data: messages, loading } = useCollection<Message>('messages', 'createdAt');

  const processedMessages = messages?.map(m => ({
    ...m,
    createdAt: m.createdAt?.toDate()
  })) || [];

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
