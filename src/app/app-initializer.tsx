"use client";

import React from 'react';
import FloatingFooter from '@/components/floating-footer';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingFooter />
    </>
  );
}
