'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import styles from './status.module.css';

/** Shown when a page can't load, e.g. the API is down. */
export default function ErrorPage({ reset, error }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  console.warn(error);
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <main className={styles.page}>
      <p className="label">Something went wrong</p>
      <h1 className={styles.title}>We couldn’t load this page.</h1>
      <p className={styles.text}>Check your connection, then try again.</p>
      <button type="button" className={styles.link} onClick={retry}>
        Try again
      </button>
    </main>
  );
}
