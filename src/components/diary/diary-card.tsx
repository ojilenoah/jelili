'use client';

import { Pin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSender } from '@/context/sender-context';
import type { DiaryEntry } from '@/lib/types';

interface DiaryCardProps {
  entry: DiaryEntry;
  onOpen: () => void;
}

export default function DiaryCard({ entry, onOpen }: DiaryCardProps) {
  const { sender } = useSender();
  const plainOnly = sender === 'Jelili';
  const isNoah = entry.author === 'Noah';
  const ringClass = isNoah
    ? 'border-foreground/60 hover:border-foreground'
    : 'border-rose-500/60 hover:border-rose-500';
  const dot = isNoah ? 'bg-foreground' : 'bg-rose-500';
  const styleOverride = entry.card_color ? { borderColor: entry.card_color } : undefined;

  const preview = entry.body.split('\n').slice(0, 4).join('\n');

  return (
    <button
      onClick={onOpen}
      style={styleOverride}
      className={cn(
        'group w-full text-left flex flex-col gap-2 rounded-md border-2 bg-card p-4 transition-all',
        ringClass
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', dot)} />
          <span className="text-[10px] font-code uppercase tracking-wider text-muted-foreground">
            {entry.author}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {entry.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
          <span className="text-[10px] font-code text-muted-foreground">
            {format(new Date(entry.created_at), 'p')}
          </span>
        </div>
      </div>

      {entry.title && (
        <h3 className="font-headline text-base md:text-lg text-foreground">
          {entry.title}
        </h3>
      )}

      <p className="text-sm text-foreground/85 whitespace-pre-wrap break-words">
        {preview}
      </p>

      {!plainOnly && entry.format !== 'plain' && (
        <span className="text-[10px] font-code uppercase tracking-wider text-muted-foreground">
          {entry.format}
        </span>
      )}
    </button>
  );
}
