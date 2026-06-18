'use client';

import { Pin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import MarkdownView from '@/components/markdown-view';
import type { ContentFormat, DiaryEntry } from '@/lib/types';

interface DiaryCardProps {
  entry: DiaryEntry;
  onOpen: () => void;
}

export default function DiaryCard({ entry, onOpen }: DiaryCardProps) {
  const isNoah = entry.author === 'Noah';
  const ringClass = isNoah
    ? 'border-foreground/60 hover:border-foreground'
    : 'border-rose-500/60 hover:border-rose-500';
  const dot = isNoah ? 'bg-foreground' : 'bg-rose-500';
  const styleOverride = entry.card_color ? { borderColor: entry.card_color } : undefined;
  const renderFormat: ContentFormat =
    entry.format === 'plain' ? 'markdown' : entry.format;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={styleOverride}
      className={cn(
        'group w-full min-w-0 overflow-hidden text-left flex flex-col gap-2 rounded-md border-2 bg-card p-4 cursor-pointer transition-all [overflow-wrap:anywhere]',
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

      <MarkdownView
        body={entry.body}
        format={renderFormat}
        className="text-sm md:text-[15px]"
      />
    </div>
  );
}
