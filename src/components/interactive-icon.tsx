"use client";

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
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="absolute text-xl md:text-2xl opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-200"
            style={{
              top: note.position.top,
              left: note.position.left,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`Open note ${note.id}`}
          >
            {note.Icon}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-foreground text-background border-0 text-xs">
          <p>A memory</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
