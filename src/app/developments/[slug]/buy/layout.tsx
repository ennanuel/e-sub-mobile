import { BuyEmailProvider } from '@/features/buy/BuyEmailContext';
import type { ReactNode } from 'react';

export default function BuyLayout({ children }: { children: ReactNode }) {
  return <BuyEmailProvider>{children}</BuyEmailProvider>
}
