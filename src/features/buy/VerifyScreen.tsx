'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CodeInput } from '@/components/ui/CodeInput';
import { ResendCode } from '@/components/ui/ResendCode';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import { routes } from '@/lib/routes';
import { useSession } from '@/lib/session';
import { useBuyEmail } from './BuyEmailContext';
import { usePurchase } from '@/lib/purchase';

export function VerifyScreen({ slug }: { slug: string }) {
  const router = useRouter();
  const { email } = useBuyEmail();

  const purchase = usePurchase();

  const [isRouting, setIsRouting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const { isRequestingOtp, isValidatingOtp, isLoadingUserDetails, validateOtp, requestOtp, user } = useSession();

  const [code, setCode] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!purchase?.unitId) router.replace(routes.listing(slug));
    else if (!user && !email) router.replace(routes.buy.email(slug));
  }, [user, email, purchase]);

  const confirm = async (value = code) => {
    if (value.length === 6) {
      validateOtp({
        email: email,
        otp: value,
        onSuccess: () => {
          setIsRouting(true);
          router.push(routes.buy.details(slug));
        },
        onSignUp: () => {
          router.push(routes.buy.details(slug));
          setIsRouting(true);
        },
        onError: (msg) => {
          setOtpError(msg == 'invalid' ? 'OTP is invalid' : msg === 'expired' ? 'OTP has expired' : msg);
        },
      });
    }
  };

  useEffect(() => {
    return () => {
      setIsRouting(false);
    };
  }, []);

  return (
    <Screen
      label="Confirm your email"
      back={routes.buy.email(slug)}
      footer={
        <Button
          disabled={code.length !== 6}
          loading={isValidatingOtp || isLoadingUserDetails || isRouting}
          loadingText="Checking"
          onClick={() => void confirm()}
        >
          Confirm
        </Button>
      }
    >
      <div className={text.kicker}>Confirm your email</div>
      <h1 className={text.heading}>Enter the code</h1>
      <p className={text.sub}>
        We sent 6 digits to <b>{email.trim()}</b>.{' '}
        <button type="button" className={text.inlineLink} onClick={() => router.push(routes.buy.email(slug))}>
          Change
        </button>
      </p>
      <CodeInput
        ref={input}
        value={code}
        onChange={(otp) => {
          setCode(otp);
          setOtpError(null);
        }}
        onComplete={(v) => confirm(v)}
        invalid={!!otpError}
        disabled={isRequestingOtp || isValidatingOtp}
      />
      {otpError && <p className={text.error}>{otpError}</p>}
      <ResendCode onResend={(onSuccess) => requestOtp({ email: email }, { onSuccess })} sending={isRequestingOtp} />
    </Screen>
  );
}
