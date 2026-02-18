"use client";

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import QuestCard from '@/components/quest-card';
import InteractiveIcon from '@/components/interactive-icon';
import NoteCard from '@/components/note-card';
import { notes, Note } from '@/lib/notes';
import { cn } from '@/lib/utils';

export default function MainPageContent() {
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  return (
    <div className="relative h-screen w-screen flex items-center justify-center p-4">
      <div
        className={cn(
          "transition-all duration-500 w-full h-full",
          activeNote ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'
        )}
      >
        <QuestCard />
        {notes.map((note) => (
          <InteractiveIcon
            key={note.id}
            note={note}
            onClick={() => setActiveNote(note)}
          />
        ))}
      </div>

      {activeNote && (
        <NoteCard
          note={activeNote}
          onClose={() => setActiveNote(null)}
        />
      )}
    </div>
  );
}
