"use client";

import { X } from 'lucide-react';
import { Note } from '@/lib/notes';
import { useState, useEffect } from 'react';

interface NoteCardProps {
  note: Note;
  onClose: () => void;
}

export default function NoteCard({ note, onClose }: NoteCardProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!note) return;
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(note.text.slice(0, i));
      i++;
      if (i > note.text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [note]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/10 backdrop-blur-[2px] animate-card-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-lg p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs uppercase tracking-widest text-muted-foreground font-code mb-4">
          Note · {String(note.id).padStart(2, '0')}
        </p>

        <p className="text-base md:text-lg leading-relaxed text-foreground font-body whitespace-pre-wrap">
          {displayedText}
          {isTyping && <span className="blinking-cursor text-accent">|</span>}
        </p>
      </div>
    </div>
  );
}
