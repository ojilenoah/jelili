"use client";

import React, { useState, useEffect } from 'react';
import EntryGate from '@/components/entry-gate';
import FloatingFooter from '@/components/floating-footer';
import { cn } from '@/lib/utils';
import { useSender } from '@/context/sender-context';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { sender, setSender } = useSender();
  const [isLoaded, setIsLoaded] = useState(false);
  const [gateHidden, setGateHidden] = useState(false);
  
  const unlocked = !!sender;

  useEffect(() => {
    const storedSender = sessionStorage.getItem('senderName') as 'Noah' | 'Jelili' | null;
    if (storedSender) {
      setSender(storedSender);
      setTimeout(() => setGateHidden(true), 1000);
    }
    setIsLoaded(true);
  }, [setSender]);

  const handleUnlock = (unlockedSender: 'Noah' | 'Jelili') => {
    sessionStorage.setItem('senderName', unlockedSender);
    setSender(unlockedSender);
    setTimeout(() => setGateHidden(true), 1000);
  };
  
  if (!isLoaded) {
    return null; // Prevent flash of content during server render
  }

  return (
    <>
      <EntryGate unlocked={unlocked} onUnlock={handleUnlock} hidden={gateHidden} />
      <div className={cn("transition-opacity duration-500", unlocked ? "opacity-100" : "opacity-0 invisible")}>
        {children}
        <FloatingFooter />
      </div>
    </>
  );
}
