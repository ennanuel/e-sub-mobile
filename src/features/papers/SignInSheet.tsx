'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { CodeInput } from '@/components/ui/CodeInput';
import { ResendCode } from '@/components/ui/ResendCode';
import text from '@/components/ui/text.module.css';
import { links } from '@/lib/links';
import { useSession } from '@/lib/session';
import { isEmail, isFilled } from '@/lib/validation';
import { User } from '@/types';
import { HeardAboutSource } from '@/lib/api';

import field from '../../components/ui/Field.module.css';
import styles from './SignInSheet.module.css';

type Step = 'email' | 'code' | 'name' | 'heard';

interface SignInSheetProps {
  onClose: () => void;
  onSignUp: () => void;
}

type SignUpUser = User & { ref_id: string };

export const HEARD_ABOUT_SOURCES: readonly HeardAboutSource[] = [
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Billboard or Flyer',
  'A Realtor',
  'Word of Mouth',
  'Others',
];

/** Bottom sheet before the papers open: email, the 6-digit code, then the name for the watermark. */
export function SignInSheet({ onClose, onSignUp }: SignInSheetProps) {
  const {
    user,
    isRequestingOtp,
    isValidatingOtp,
    isLoggingIn,
    isSigningUp,
    isLoadingUserDetails,
    checkEmailStatus,
    requestOtp,
    validateOtp,
    agent,
    signUp,
  } = useSession();

  const [step, setStep] = useState<Step>(user ? 'name' : 'email');
  const [error, setError] = useState<null | string>(null);

  const [code, setCode] = useState('');

  const [email, setEmail] = useState('');
  const [first, setFirst] = useState(user?.first_name ?? '');
  const [last, setLast] = useState(user?.last_name ?? '');
  const [middle, setMiddle] = useState(user?.middle_name ?? '');
  const [other, setOther] = useState('');
  const [source, setSource] = useState<string>('');

  const focusRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const pick = (s: string) => {
    setSource(s);
    if (s === 'Others') setTimeout(() => otherRef.current?.focus({ preventScroll: true }), 120);
  };

  useEffect(() => {
    const t = setTimeout(() => focusRef.current?.focus({ preventScroll: true }), 380);
    return () => clearTimeout(t);
  }, [step]);

  const isLoading = isLoggingIn || isRequestingOtp || isValidatingOtp || isSigningUp || isLoadingUserDetails;

  const valid = step === 'email' ? isEmail(email) : step === 'code' ? code.length === 6 : isFilled(first) && isFilled(last);

  const next = () => {
    setError(null);
    if (!valid || isLoading) return;
    if (step === 'email') {
      checkEmailStatus({
        email,
        onSuccess: () => {
          setStep('code');
        },
        onError: (msg) => {
          setError(msg);
        },
      });
    } else if (step === 'code') {
      handleOtpValidate(code);
    } else if (step === 'name') {
      setStep('heard');
    } else if (step === 'heard') {
      signUp({
        user: {
          first_name: first,
          last_name: last,
          middle_name: middle,
          email,
          ref_id: agent?.ref_id,
          ...(source === 'A Realtor' && agent ? { agent_name: `${agent?.first_name ?? ''} ${agent?.last_name ?? ''}`.trim() } : {}),
          ...(other ? { other_field: other } : {}),
        } as SignUpUser,
        onSuccess: () => {
          onClose();
          onSignUp();
        },
        onError: setError,
      });
    }
  };

  const handleOtpValidate = (code: string) => {
    validateOtp({
      email: email,
      otp: code,
      onSignUp: () => {
        setStep('name');
      },
      onSuccess: () => {
        onClose();
      },
      onError: (msg) => {
        setError(msg === 'invalid' ? 'OTP is invalid' : msg === 'expired' ? 'OTP has expired' : msg);
      },
    });
  };

  const submitOnEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void next();
    }
  };

  return (
    <>
      <div className={styles.dim} onClick={onClose} aria-hidden="true" />
      <section
        className={`${styles.sheet} ${step === 'name' ? styles.tall : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
      >
        <span className={styles.grab} />

        {step === 'email' && (
          <>
            <div className={styles.step}>STEP 1 OF 4</div>
            <h1 id="signin-title" className={styles.question}>
              {'What’s your email?'}
            </h1>
            <input
              ref={focusRef}
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={submitOnEnter}
            />
            <p className={styles.note}>We send a code to check it’s you.</p>
            <p className={`${styles.note} ${styles.legal}`}>
              By clicking Next you agree to the <a href={links.termsOfService}>Terms of Service</a> and{' '}
              <a href={links.privacyPolicy}>Privacy Policy</a>.
            </p>
          </>
        )}

        {step === 'code' && (
          <>
            <div className={styles.step}>STEP 2 OF 4</div>
            <h1 id="signin-title" className={styles.question}>
              Enter the code
            </h1>
            <p className={`${styles.note} ${styles.lead}`}>
              We sent 6 digits to <b>{email.trim()}</b>.{' '}
              {Boolean(!first && !last) && (
                <button type="button" className={text.inlineLink} onClick={() => setStep('email')}>
                  Change
                </button>
              )}
            </p>
            <CodeInput
              ref={focusRef}
              value={code}
              onChange={(otp) => {
                setCode(otp);
                setError(null);
              }}
              onComplete={(v) => {
                handleOtpValidate(v);
              }}
              invalid={!!error}
              disabled={isRequestingOtp || isValidatingOtp}
            />
            <ResendCode
              onResend={(onResendSuccess) => requestOtp({ email: email }, { onSuccess: onResendSuccess })}
              sending={isRequestingOtp}
            />
          </>
        )}

        {step === 'name' && (
          <>
            <div className={styles.step}>STEP 3 OF 4</div>
            <h1 id="signin-title" className={styles.question}>
              What’s your name?
            </h1>
            <p className={`${styles.note} ${styles.lead}`}>As it should appear on your papers.</p>
            <label className={styles.field}>
              <span>First name</span>
              <input
                ref={focusRef}
                className={styles.input}
                autoComplete="given-name"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                onKeyDown={submitOnEnter}
              />
            </label>
            <label className={styles.field}>
              <span>Last name</span>
              <input
                className={styles.input}
                autoComplete="family-name"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                onKeyDown={submitOnEnter}
              />
            </label>
            <label className={styles.field}>
              <span>Middle name</span>
              <input
                className={styles.input}
                autoComplete="additional-name"
                placeholder="Optional"
                value={middle}
                onChange={(e) => setMiddle(e.target.value)}
                onKeyDown={submitOnEnter}
              />
            </label>
          </>
        )}

        {step === 'heard' && (
          <>
            <div className={styles.step}>STEP 4 OF 4</div>
            <h1 id="signin-title" className={styles.question}>
              How did you hear about us?
            </h1>
            <p className={`${styles.note} ${styles.lead}`}>Pick one.</p>
            <div className={`${field.pills} ${styles.choices}`} role="radiogroup" aria-label="How did you hear about us?">
              {HEARD_ABOUT_SOURCES.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={source === s} onClick={() => pick(s)}>
                  {s}
                </button>
              ))}
            </div>
            {source === 'Others' && (
              <label className={styles.field}>
                <span>Where did you hear about us?</span>
                <input
                  ref={otherRef}
                  className={styles.input}
                  autoComplete="off"
                  placeholder="Tell us where"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  onKeyDown={submitOnEnter}
                />
              </label>
            )}
          </>
        )}

        {error && <p className={text.error}>{error}</p>}

        <div className={styles.next}>
          <Button disabled={!valid} loading={isLoading} loadingText={step === 'heard' ? 'Please wait' : 'Checking'} onClick={() => next()}>
            {step === 'heard' ? 'Proceed' : 'Next'}
          </Button>
        </div>
      </section>
    </>
  );
}
