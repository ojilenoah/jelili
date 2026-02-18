import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Note } from '@/lib/notes';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClose: () => void;
}

export default function NoteCard({ note, onClose }: NoteCardProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-card-in"
      onClick={onClose}
    >
      <Card
        className={cn(
          "frosted-glass relative w-11/12 max-w-md p-6 border-primary/10 shadow-2xl rounded-2xl soft-glow",
          note.color
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-0">
          <p className="text-xl leading-relaxed text-primary font-body">{note.text}</p>
        </CardContent>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8 rounded-full text-primary/50 hover:text-primary hover:bg-primary/10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </Card>
    </div>
  );
}
