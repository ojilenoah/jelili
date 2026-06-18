'use client';

import React from 'react';
import LoginGate from '@/components/auth/login-gate';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  return <LoginGate>{children}</LoginGate>;
}
