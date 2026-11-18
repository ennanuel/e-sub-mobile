'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import { links } from '@/lib/links';
import { routes } from '@/lib/routes';
import { isEmail } from '@/lib/validation';
import { usePurchaseKicker } from './useBuyGuard';
import { useBuyEmail } from './BuyEmailContext';
import type { ProjectDetails } from '@/types';
import { useSession } from '@/lib/session';
import { useEffect, useState } from 'react';
import { usePurchase } from '@/lib/purchase';
import { Center, Spinner } from '@chakra-ui/react';

/** Buying, step 1: the email (skipped when it was confirmed earlier in this visit). */
export function EmailScreen({ listing }: { listing: ProjectDetails }) {
  const slug = listing?.id?.toString();
  const kicker = usePurchaseKicker(listing);
  const router = useRouter();

  const purchase = usePurchase();

  const [isRouting, setIsRouting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isRequestingOtp, isLoggingIn, checkEmailStatus } = useSession();

  const { email, setEmail } = useBuyEmail();

  const valid = isEmail(email);

  const next = async () => {
    if (valid) {
      checkEmailStatus({
        email,
        onSuccess: () => {
          router.push(routes.buy.verify(slug));
          setIsRouting(true);
        },
        onError(msg) {
          setErrorMessage(msg);
        },
      });
    }
  };

  useEffect(() => {
    if (!purchase?.unitId) router.push(routes.listing(slug));
    else if (!purchase.termsVersion) {
      router.push(routes.buy.terms(slug));
    }
  }, [purchase]);

  useEffect(() => {
    return () => {
      setIsRouting(false);
    };
  }, []);

  if (!purchase?.unitId || !purchase.termsVersion) {
    return (
      <Center width="100%" height="100dvh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Screen
      label="Your email"
      back={routes.buy.terms(slug)}
      footer={
        <Button disabled={!valid} loading={isRequestingOtp || isLoggingIn || isRouting} loadingText="Sending" onClick={() => void next()}>
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
