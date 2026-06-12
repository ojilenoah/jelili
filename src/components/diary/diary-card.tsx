'use client';

import { Pin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DiaryEntry } from '@/lib/types';

interface DiaryCardProps {
  entry: DiaryEntry;
  onOpen: () => void;
}

export default function DiaryCard({ entry, onOpen }: DiaryCardProps) {
  const isNoah = entry.author === 'Noah';
  const accent = isNoah
    ? 'border-emerald-500/40 hover:border-emerald-500 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
    : 'border-rose-500/40 hover:border-rose-500 hover:shadow-[0_0_0_1px_rgba(244,63,94,0.2)]';
  const dot = isNoah ? 'bg-emerald-500' : 'bg-rose-500';
  const styleOverride = entry.card_color
    ? { borderColor: entry.card_color }
    : undefined;

  const preview = entry.body.split('\n').slice(0, 4).join('\n');

  return (
    <button
      onClick={onOpen}
      style={styleOverride}
      className={cn(
        'group text-left flex flex-col gap-2 rounded-md border bg-card p-4 transition-all',
        accent
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
          {entry.pinned && (
            <Pin className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-[10px] font-code text-muted-foreground">
            {format(new Date(entry.created_at), 'p')}
          </span>
        </div>
      </div>

      {entry.title && (
        <h3 className="font-headline text-sm md:text-base text-foreground line-clamp-2">
          {entry.title}
        </h3>
      )}

      <p className="text-xs md:text-sm text-foreground/80 line-clamp-4 whitespace-pre-wrap break-words">
        {preview}
      </p>

      {entry.format !== 'plain' && (
        <span className="text-[10px] font-code uppercase tracking-wider text-muted-foreground">
          {entry.format}
        </span>
      )}
    </button>
  );
}
