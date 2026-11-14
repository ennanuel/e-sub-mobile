import type { ReactNode } from 'react';
import { PurchaseProvider } from '@/lib/purchase';

/** The purchase in progress lives here, so it survives moving between the plot page and the buying steps. */
export default async function DevelopmentLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PurchaseProvider slug={slug}>{children}</PurchaseProvider>;
}
