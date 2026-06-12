'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Sender = 'Noah' | 'Jelili';

interface SenderContextType {
  sender: Sender;
  setSender: (sender: Sender) => void;
}

const SenderContext = createContext<SenderContextType | undefined>(undefined);

const STORAGE_KEY = 'senderName';

export function SenderProvider({ children }: { children: ReactNode }) {
  const [sender, setSenderState] = useState<Sender>('Noah');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Sender | null;
    if (stored === 'Noah' || stored === 'Jelili') {
      setSenderState(stored);
    }
  }, []);

  const setSender = (next: Sender) => {
    setSenderState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <SenderContext.Provider value={{ sender, setSender }}>
      {children}
    </SenderContext.Provider>
  );
}

export function useSender() {
  const context = useContext(SenderContext);
  if (context === undefined) {
    throw new Error('useSender must be used within a SenderProvider');
  }
  return context;
}
