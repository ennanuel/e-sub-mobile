'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Toast.module.css';

/** A short message under the top bar ("Account number copied"). */
export function useToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string) => {
    setMessage(text);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 1600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const element = (
    <div className={`${styles.toast} ${visible ? styles.on : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
  return { show, element };
}
