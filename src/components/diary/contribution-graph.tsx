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
  const { contributionData, totalMessages, activeDays } = useMemo(() => {
    const today = new Date();
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);
    const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const contributions = new Map<string, number>();

    for (const message of messages) {
      if (message.createdAt) {
        const dateKey = format(message.createdAt, 'yyyy-MM-dd');
        contributions.set(dateKey, (contributions.get(dateKey) ?? 0) + 1);
      }
    }

    const firstDayOfYear = getDay(yearStart);
    const emptyDays = Array.from({ length: firstDayOfYear }, (_, i) => ({
      date: `empty-${i}`,
      level: -1 as const,
      messageCount: 0,
    }));

    const days = daysInYear.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const count = contributions.get(dateKey) ?? 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0) level = 1;
      if (count >= 3) level = 2;
      if (count >= 6) level = 3;
      if (count >= 10) level = 4;
      return { date: dateKey, level, messageCount: count };
    });

    const activeDays = days.filter((d) => d.messageCount > 0).length;
    const totalMessages = messages.length;

    return {
      contributionData: [...emptyDays, ...days],
      totalMessages,
      activeDays,
    };
  }, [messages]);

  const getTooltipText = (day: { level: number; messageCount: number; date: string }) => {
    if (day.level === -1) return '';
    const dateStr = format(new Date(day.date), 'MMMM d, yyyy');
    if (day.messageCount === 0) return `${dateStr} — no messages`;
    return `${dateStr} — ${day.messageCount} ${day.messageCount === 1 ? 'message' : 'messages'}`;
  };

  const levelClass = (level: number) =>
    cn(
      'aspect-square w-full rounded-[2px] transition-colors',
      level === -1 && 'bg-transparent',
      level === 0 && 'bg-muted',
      level === 1 && 'bg-accent/25',
      level === 2 && 'bg-accent/50',
      level === 3 && 'bg-accent/75',
      level === 4 && 'bg-accent'
    );

  return (
    <div className="w-full rounded-md border border-border bg-card p-5 md:p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-code">
            {new Date().getFullYear()}
          </p>
          <p className="text-sm text-foreground mt-1">
            {totalMessages} {totalMessages === 1 ? 'message' : 'messages'} ·{' '}
            {activeDays} {activeDays === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="grid grid-cols-53 grid-rows-7 grid-flow-col gap-[3px] min-w-[640px] sm:min-w-0">
          <TooltipProvider>
            {contributionData.map((day, index) => (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className={levelClass(day.level)} />
                </TooltipTrigger>
                {day.level !== -1 && (
                  <TooltipContent className="bg-foreground text-background border-0 text-xs">
                    <p>{getTooltipText(day)}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-code uppercase tracking-wider">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded-[2px] bg-muted" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-accent/25" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-accent/50" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-accent/75" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-accent" />
        <span>More</span>
      </div>
    </div>
  );
}

