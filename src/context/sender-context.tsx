'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Sender = 'Noah' | 'Jelili';

const STORAGE_KEY = 'senderName';

const PASSPHRASES: Record<string, Sender> = {
  ebelebo: 'Jelili',
  noah: 'Noah',
};

interface AuthContextValue {
  sender: Sender | null;
  hydrated: boolean;
  login: (passphrase: string) => Sender | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function SenderProvider({ children }: { children: ReactNode }) {
  const [sender, setSenderState] = useState<Sender | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Sender | null;
    if (stored === 'Noah' || stored === 'Jelili') {
      setSenderState(stored);
    }
    setHydrated(true);
  }, []);

  const login = (passphrase: string): Sender | null => {
    const matched = PASSPHRASES[passphrase.trim().toLowerCase()];
    if (!matched) return null;
    setSenderState(matched);
    localStorage.setItem(STORAGE_KEY, matched);
    return matched;
  };

  const logout = () => {
    setSenderState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ sender, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within a SenderProvider');
  return ctx;
}

/**
 * Inside the LoginGate, sender is guaranteed non-null. This hook narrows
 * the type for downstream components so they don't need to null-check.
 */
export function useSender(): { sender: Sender; logout: () => void } {
  const { sender, logout } = useAuth();
  if (!sender) {
    throw new Error('useSender called outside of LoginGate — render inside the gate');
  }
  return { sender, logout };
}
