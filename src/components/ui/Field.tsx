'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { formatLocalPhone } from '@/lib/format';
import styles from './Field.module.css';

interface ShellProps {
  label: string;
  invalid?: boolean;
  /** Plays a short shake when it changes to true (bumped by the form on each failed try). */
  shakeKey?: number;
  children: ReactNode;
  as?: 'label' | 'div';
}

/** Label above a field, red underline when invalid. */
export function FieldShell({ label, invalid, shakeKey, children, as = 'label' }: ShellProps) {
  const Tag = as;
  return (
    <Tag key={invalid ? `bad-${shakeKey}` : 'ok'} className={`${styles.field} ${invalid ? styles.invalid : ''}`}>
      <span className={styles.label}>{label}</span>
      {children}
    </Tag>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>;

interface TextFieldProps extends InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  shakeKey?: number;
}

export function TextField({ label, value, onChange, invalid, shakeKey, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} invalid={invalid} shakeKey={shakeKey}>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </FieldShell>
  );
}

/** Nigerian number after a fixed +234. The value is the local part, spaced: "803 412 7790". */
export function PhoneField({ label, countryCode, value, onChange, invalid, shakeKey, ...rest }: TextFieldProps & { countryCode: string }) {
  return (
    <FieldShell label={label} invalid={invalid} shakeKey={shakeKey}>
      <span className={styles.phoneRow}>
        <span className={styles.code} aria-hidden="true">
          {countryCode}
        </span>
        <input
          className={styles.input}
          type="tel"
          inputMode="tel"
          placeholder="803 000 0000"
          aria-label={`${label}, after +234`}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(e) => onChange(formatLocalPhone(e.target.value))}
          {...rest}
        />
      </span>
    </FieldShell>
  );
}

type Option = string | { label: string; value: string };
interface PillGroupProps {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: Option) => void;
  invalid?: boolean;
  shakeKey?: number;
}

/** A row of pills that works like radio buttons. */
export function PillGroup({ label, options, value, onChange, invalid, shakeKey }: PillGroupProps) {
  return (
    <FieldShell label={label} invalid={invalid} shakeKey={shakeKey} as="div">
      <div className={styles.pills} role="radiogroup" aria-label={label}>
        {options.map((o, index) => (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={value === (typeof o === 'string' ? o : o.value)}
            onClick={() => onChange(o)}
          >
            {typeof o === 'object' ? o.label : o}
          </button>
        ))}
      </div>
    </FieldShell>
  );
}
