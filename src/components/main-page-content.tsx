"use client";

import { useState } from 'react';
import QuestCard from '@/components/quest-card';
import InteractiveIcon from '@/components/interactive-icon';
import NoteCard from '@/components/note-card';
import { notes, Note } from '@/lib/notes';
import { cn } from '@/lib/utils';

export default function MainPageContent() {
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-16 md:py-24">
      <div
        className={cn(
          'relative w-full max-w-2xl transition-all duration-300',
          activeNote ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
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
        <NoteCard note={activeNote} onClose={() => setActiveNote(null)} />
      )}
    </div>
  );
}
