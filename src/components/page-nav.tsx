'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookHeart, MessageCircleHeart, LogOut } from 'lucide-react';
import { useAuth } from '@/context/sender-context';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/theme-toggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ITEMS = [
  { href: '/', icon: BookHeart, label: 'Diary' },
  { href: '/chat', icon: MessageCircleHeart, label: 'Chat' },
] as const;

export default function PageNav() {
  const pathname = usePathname();
  const { sender, logout } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <nav className="flex items-center gap-1 p-1 rounded-md border border-border bg-card">
        {ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-code uppercase tracking-wider transition-colors',
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <ThemeToggle />

      {sender && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label="Log out"
              title={`Logged in as ${sender}`}
              className="inline-flex h-9 items-center gap-1.5 px-2 rounded-md border border-border bg-card text-[10px] font-code uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  sender === 'Noah' ? 'bg-foreground' : 'bg-rose-500'
                )}
              />
              {sender}
              <LogOut className="h-3 w-3 ml-0.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out, {sender}?</AlertDialogTitle>
              <AlertDialogDescription>
                You'll need to enter the passphrase again to come back in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Log out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
