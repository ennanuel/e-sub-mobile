'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import { links } from '@/lib/links';
import { routes } from '@/lib/routes';
import { isEmail } from '@/lib/validation';
import { useBuyGuard, usePurchaseKicker } from './useBuyGuard';
import { useBuyEmail } from './BuyEmailContext';
import type { ProjectDetails } from '@/types';
import { useSession } from '@/lib/session';
import { useState } from 'react';

/** Buying, step 1: the email (skipped when it was confirmed earlier in this visit). */
export function EmailScreen({ listing }: { listing: ProjectDetails }) {
  const slug = listing?.id?.toString();
  const ready = useBuyGuard(slug, { terms: true });
  const kicker = usePurchaseKicker(listing);
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isRequestingOtp, isLoggingIn, checkEmailStatus } = useSession();

  const { email, setEmail } = useBuyEmail();

  if (!ready) return null;

  const valid = isEmail(email);
  const next = async () => {
    if (valid) {
      checkEmailStatus({
        email,
        onChecked({ userExists }) {
          if (userExists) router.push(routes.buy.verify(slug));
          else router.push(routes.buy.details(slug));
        },
        onError(msg) {
          setErrorMessage(msg);
        },
      });
    }
  };

  return (
    <Screen
      label="Your email"
      back={routes.buy.terms(slug)}
      footer={
        <Button disabled={!valid} loading={isRequestingOtp || isLoggingIn} loadingText="Sending" onClick={() => void next()}>
          Next
        </Button>
      }
    >
      <div className={text.kicker}>{kicker}</div>
      <h1 className={text.heading}>What’s your email?</h1>
      <TextField
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        autoFocus
        value={email}
        onChange={setEmail}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void next();
        }}
      />
      {errorMessage && <p className={text.error}>{errorMessage}</p>}
      <p className={text.smallPrint}>
        By clicking Next you agree to the <a href={links.termsOfService}>Terms of Service</a> and{' '}
        <a href={links.privacyPolicy}>Privacy Policy</a>.
      </p>
    </Screen>
  );
}
