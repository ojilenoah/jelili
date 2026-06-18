"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookHeart, MessageCircleHeart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: BookHeart, label: 'Diary' },
  { href: '/chat', icon: MessageCircleHeart, label: 'Chat' },
];

export default function FloatingFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <nav className="flex items-center gap-1 p-1 rounded-full border border-border bg-card shadow-sm">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
