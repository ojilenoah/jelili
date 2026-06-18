'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const { mode, cycle } = useTheme();

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;
  const label =
    mode === 'system' ? 'Theme: system' : mode === 'light' ? 'Theme: light' : 'Theme: dark';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
