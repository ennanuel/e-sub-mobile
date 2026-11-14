import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { loadDevelopment } from '@/lib/load';
import Providers from '@/lib/providers';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B0B3B',
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const projectInfo = await loadDevelopment(slug);
  const project = projectInfo?.project ?? {};

  const title = `${project?.name ?? ''}${project?.name && project?.address ? ', ' : ''}${project?.address}`;
  const description = project?.description;

  return { title, description };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
