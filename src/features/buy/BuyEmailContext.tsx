'use client';

/** Shares the email check between the "Your email" and "Enter the code" pages. */
import { createContext, useContext, useState, type ReactNode } from 'react';

const BuyEmailContext = createContext<{ email: string; setEmail: (email: string) => void } | null>(null);

export function BuyEmailProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  return <BuyEmailContext.Provider value={{ email, setEmail }}>{children}</BuyEmailContext.Provider>;
}

export function useBuyEmail() {
  const ctx = useContext(BuyEmailContext);
  if (!ctx) throw new Error('useBuyEmail must be used inside <BuyEmailProvider>');
  return ctx;
}
