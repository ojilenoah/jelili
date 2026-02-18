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

const animationStyles: { [key: string]: string } = {
  pulse: 'animate-[pulse-glow_4s_ease-in-out_infinite]',
  jitter: 'animate-[jitter_5s_ease-in-out_infinite]',
  glow: 'animate-[soft-glow-anim_3s_ease-in-out_infinite]',
};

export default function InteractiveIcon({ note, onClick }: InteractiveIconProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'absolute text-primary/70 hover:text-primary transition-colors duration-300',
              animationStyles[note.animation],
            )}
            style={{
              top: note.position.top,
              left: note.position.left,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${note.id * 0.2}s`,
            }}
            aria-label={`Open note ${note.id}`}
          >
            <note.Icon style={{ width: note.size, height: note.size }} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="frosted-glass border-primary/10 text-primary">
            <p>A memory...</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
