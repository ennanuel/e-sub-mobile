import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

type Look = 'raised' | 'outline';

interface Common {
  label: string;
  look?: Look;
  children: ReactNode;
}

/** 42px round button for back, share and similar. `raised` floats over art; `outline` sits on white. */
export function IconButton({ label, look = 'outline', children, className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} className={`${styles.btn} ${styles[look]} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  );
}
