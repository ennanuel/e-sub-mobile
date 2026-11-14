'use client';

import text from './text.module.css';
import styles from './ResendCode.module.css';
import useTimer from '@/lib/hooks/useTimer';

interface ResendCodeProps {
  onResend: (cb: () => void) => void;
  sending?: boolean;
}

export function ResendCode({ onResend, sending = false }: ResendCodeProps) {
  const { count, reset: resetTimer } = useTimer();

  if (count > 0) {
    return (
      <p className={styles.line}>
        Didn’t get it? Resend in{' '}
        <b className={styles.time}>
          {Math.floor(count / 60)}:{String(count % 60).padStart(2, '0')}
        </b>
      </p>
    );
  }
  return (
    <p className={styles.line}>
      <button type="button" className={text.inlineLink} onClick={() => onResend(resetTimer)} disabled={sending}>
        {sending ? 'Sending…' : 'Resend code'}
      </button>
    </p>
  );
}
