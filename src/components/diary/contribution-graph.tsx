'use client';
import { useMemo } from 'react';
import {
  startOfYear,
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
} from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Message = {
  createdAt: Date;
  sender: 'Noah' | 'Jelili';
};

interface ContributionGraphProps {
  messages: Message[];
}

export default function ContributionGraph({ messages }: ContributionGraphProps) {
  const contributionData = useMemo(() => {
    const today = new Date();
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);
    const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const contributions = new Map<string, { noah: number; jelili: number }>();

    for (const message of messages) {
      if (message.createdAt) {
        const dateKey = format(message.createdAt, 'yyyy-MM-dd');
        const contribution = contributions.get(dateKey) || { noah: 0, jelili: 0 };
        if (message.sender === 'Noah') {
          contribution.noah++;
        } else {
          contribution.jelili++;
        }
        contributions.set(dateKey, contribution);
      }
    }

    const firstDayOfYear = getDay(yearStart);
    const emptyDays = Array.from({ length: firstDayOfYear }, (_, i) => ({
      date: `empty-${i}`,
      state: 'empty',
      messageCount: 0,
    }));

    const contributionDays = daysInYear.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dailyData = contributions.get(dateKey);
      let state: 'none' | 'Noah' | 'Jelili' | 'both' = 'none';
      let messageCount = 0;
      if (dailyData) {
        if (dailyData.noah > 0 && dailyData.jelili > 0) {
          state = 'both';
        } else if (dailyData.noah > 0) {
          state = 'Noah';
        } else {
          state = 'Jelili';
        }
        messageCount = dailyData.noah + dailyData.jelili;
      }
      return {
        date: format(day, 'yyyy-MM-dd'),
        state,
        messageCount,
      };
    });

    return [...emptyDays, ...contributionDays];
  }, [messages]);

  const getTooltipText = (day: {
    state: string;
    messageCount: number;
    date: string;
  }) => {
    if (day.state === 'none') return `${format(new Date(day.date), 'MMMM d, yyyy')} - No messages`;
    if (day.state === 'empty') return '';

    const contributor = day.state === 'both' ? 'Both contributed' : `${day.state} only`;
    const messageText = day.messageCount === 1 ? '1 message' : `${day.messageCount} messages`;
    return `${format(new Date(day.date), 'MMMM d, yyyy')} - ${messageText} - ${contributor}`;
  };

  return (
    <div className="w-full rounded-lg border border-border/50 bg-white/30 p-4 frosted-glass">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-53 grid-rows-7 grid-flow-col gap-1 min-w-[700px]">
          <TooltipProvider>
            {contributionData.map((day, index) => (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'aspect-square w-full rounded-sm',
                      { 'bg-neutral-200/50': day.state === 'none' || day.state === 'empty' },
                      { 'bg-deep-red/60': day.state === 'Noah' },
                      { 'bg-mint-green/60': day.state === 'Jelili' },
                      { 'bg-soft-purple': day.state === 'both' }
                    )}
                  />
                </TooltipTrigger>
                {day.state !== 'empty' && (
                  <TooltipContent className="frosted-glass border-primary/10 text-primary transition-all duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
                    <p>{getTooltipText(day)}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-start gap-4 px-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-neutral-200/50" />
          <span>No activity</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-deep-red/60" />
          <span>Noah</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-mint-green/60" />
          <span>Jelili</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-soft-purple" />
          <span>Both</span>
        </div>
      </div>
    </div>
  );
}

declare module 'tailwindcss/defaultTheme' {
  interface TailwindTheme {
    gridTemplateColumns: {
      '53': 'repeat(53, minmax(0, 1fr))',
    },
  }
}
