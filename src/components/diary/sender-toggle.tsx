'use client';

import { useSender } from '@/context/sender-context';
import { cn } from '@/lib/utils';

export default function SenderToggle() {
  const { sender, setSender } = useSender();

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-md border border-border bg-card text-xs font-code">
      <span className="px-2 text-muted-foreground uppercase tracking-wider">You</span>
      {(['Noah', 'Jelili'] as const).map((name) => (
        <button
          key={name}
          onClick={() => setSender(name)}
          className={cn(
            'px-3 py-1 rounded transition-colors',
            sender === name
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
