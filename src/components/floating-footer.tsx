"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/diary', icon: BookHeart, label: 'Diary' },
];

export default function FloatingFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <TooltipProvider>
        <div className="flex items-center gap-2 p-2 rounded-full border border-black/10 frosted-glass shadow-lg">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-in-out',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                        : 'text-primary/70 hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="sr-only">{item.label}</span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </footer>
  );
}
