'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Sender = 'Noah' | 'Jelili' | null;

interface SenderContextType {
  sender: Sender;
  setSender: (sender: Sender) => void;
}

const SenderContext = createContext<SenderContextType | undefined>(undefined);

export function SenderProvider({ children }: { children: ReactNode }) {
  const [sender, setSender] = useState<Sender>(null);
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
