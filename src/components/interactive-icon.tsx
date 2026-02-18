"use client";

import { cn } from '@/lib/utils';
import { Note } from '@/lib/notes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InteractiveIconProps {
  note: Note;
  onClick: () => void;
}

export default function InteractiveIcon({ note, onClick }: InteractiveIconProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'absolute text-primary/70 hover:text-primary transition-colors duration-300 text-5xl'
            )}
            style={{
              top: note.position.top,
              left: note.position.left,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`Open note ${note.id}`}
          >
            <note.Icon />
          </button>
        </TooltipTrigger>
        <TooltipContent className="frosted-glass border-primary/10 text-primary">
            <p>A memory...</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
