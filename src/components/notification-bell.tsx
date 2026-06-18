'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useChatUnreadCount } from '@/lib/chat-read-state';
import { cn } from '@/lib/utils';

export default function NotificationBell({ className }: { className?: string }) {
  const count = useChatUnreadCount();
  const has = count > 0;

  return (
    <Link
      href="/chat"
      aria-label={has ? `${count} unread message${count === 1 ? '' : 's'}` : 'No new messages'}
      title={has ? `${count} new message${count === 1 ? '' : 's'}` : 'No new messages'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      <Bell className="h-4 w-4" strokeWidth={1.75} />
      {has && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-code text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
