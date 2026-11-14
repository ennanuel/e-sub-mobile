'use client';

import { forwardRef, useState } from 'react';
import styles from './CodeInput.module.css';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are in. */
  onComplete?: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
}

/** One hidden input drawn as six boxes. Works with paste and with the phone's one-time-code suggestion. */
export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(function CodeInput(
  { value, onChange, onComplete, length = 6, invalid = false, disabled = false },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const cursor = Math.min(value.length, length - 1);

  return (
    <label className={`${styles.boxes} ${invalid ? styles.invalid : ''}`}>
      <input
        ref={ref}
        className={styles.input}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label={`${length}-digit code`}
        aria-invalid={invalid || undefined}
        value={value}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, length);
          onChange(digits);
          if (digits.length === length) onComplete?.(digits);
        }}
      />
      {Array.from({ length }, (_, i) => (
        <span key={i} className={`${styles.box} ${focused && i === cursor ? styles.current : ''}`}>
          {value[i] ?? ''}
        </span>
      ))}
    </label>
  );
});
