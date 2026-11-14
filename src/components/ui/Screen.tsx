'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { ChevronLeft } from '@/components/icons';
import { IconButton } from './IconButton';
import styles from './Screen.module.css';

interface ScreenProps {
  /** Where back goes. A function is called instead of navigating (e.g. previous tab). */
  back?: string | (() => void);
  backLabel?: string;
  /** Shown in the middle of the top bar. */
  title?: ReactNode;
  /** Shown on the right of the top bar. */
  actions?: ReactNode;
  /** Sticky at the bottom (main button). */
  footer?: ReactNode;
  /** Slide in from the right (default), fade in, or no entrance. */
  entrance?: 'slide' | 'fade' | 'none';
  /** Tighter top bar (plot page). */
  compactBar?: boolean;
  label: string;
  children: ReactNode;
}

/** The standard page: top bar with back, scrolling body, sticky footer. */
export function Screen({ back, backLabel = 'Back', title, actions, footer, entrance = 'slide', compactBar, label, children }: ScreenProps) {
  const router = useRouter();
  const onBack = () => {
    if (typeof back === 'function') back();
    else if (back) router.push(back);
  };

  return (
    <main className={`${styles.screen} ${styles[entrance]}`} aria-label={label}>
      <div className={`${styles.bar} ${compactBar ? styles.compact : ''}`}>
        {back ? (
          <IconButton label={backLabel} onClick={onBack}>
            <ChevronLeft size={19} />
          </IconButton>
        ) : (
          <span className={styles.spacer} />
        )}
        <span className={styles.title}>{title}</span>
        {actions ?? <span className={styles.spacer} />}
      </div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </main>
  );
}
