'use client';

import { useEffect, useRef } from 'react';
import styles from './ViewOnlyNotice.module.css';

/** Full red screen before the papers: who they are opened for, and when. */
export function ViewOnlyNotice({ name, email, stamp, onAccept }: { name: string; email: string; stamp: string; onAccept: () => void }) {
  const ok = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const t = setTimeout(() => ok.current?.focus({ preventScroll: true }), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={styles.notice} role="dialog" aria-modal="true" aria-labelledby="notice-title">
      <div className={styles.kicker}>CITYVIEW · TITLE PAPERS</div>
      <h1 id="notice-title" className={styles.title}>
        View
        <br />
        only.
      </h1>
      <p className={styles.text}>These papers are confidential. Read them here, but don’t copy, download or share them.</p>
      <div className={styles.meta}>
        Opened for {name}
        <br />
        {email}
        <br />
        {stamp}
      </div>
      <button ref={ok} type="button" className={styles.ok} onClick={onAccept}>
        I understand
      </button>
    </section>
  );
}
