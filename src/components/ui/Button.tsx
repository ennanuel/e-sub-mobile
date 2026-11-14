import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** While true, the button shows `loadingText` with moving dots and can't be pressed. */
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'link';
}

export function Button({ loading = false, loadingText, variant = 'primary', disabled, children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={[variant === 'primary' ? styles.primary : styles.link, loading ? styles.loading : '', className ?? ''].join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          {loadingText ?? children}
          <LoadingDots />
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function LoadingDots() {
  return (
    <span className={styles.dots} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
