'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { capitalise, currencyFull } from '@/lib/format';
import { usePurchase } from '@/lib/purchase';
import { routes } from '@/lib/routes';
import { useBuyGuard } from './useBuyGuard';
import styles from './ThankYouScreen.module.css';
import { useSession } from '@/lib/session';
import { useEffect, useState } from 'react';

/** After "I've made the transfer": LCR confirms the payment and emails the receipt. */
export function ThankYouScreen({ slug }: { slug: string }) {
  const [isRouting, setIsRouting] = useState(false);
  const ready = useBuyGuard(slug, { terms: true, session: true, offer: true, transfer: true });
  const router = useRouter();
  const { user } = useSession();

  const { equity } = usePurchase();
  const currency = equity?.currency ?? null;

  const offerPrice = Number(equity?.payment_plan?.initial_deposit_in_value ?? equity?.offer_price ?? 0);

  useEffect(() => {
    return () => {
      setIsRouting(false)
    }
  }, [])

  if (!ready || !equity) return null;

  return (
    <main className={styles.page} aria-label="Thank you">
      <div className={styles.words}>
        <div className={styles.kicker} style={{ animationDelay: '.05s' }}>
          Payment sent
        </div>
        <div className={styles.thanks} style={{ animationDelay: '.15s' }}>
          Thank you,
        </div>
        <div className={styles.name} style={{ animationDelay: '.3s' }}>
          <span>{capitalise(user?.first_name ?? '')}</span>
          <i className={styles.dot} />
        </div>
        <p className={styles.sub} style={{ animationDelay: '.5s' }}>
          <b>We’re checking for it.</b> LCR will confirm your payment of {currencyFull(offerPrice, currency)} as soon as it lands, and email
          you the receipt at {user?.email}.
        </p>
        <div className={styles.line} style={{ animationDelay: '.65s' }} aria-hidden="true">
          <span />
        </div>
      </div>
      <div className={styles.footer}>
        <Button loading={isRouting} onClick={() => {
          setIsRouting(true);
          router.push(routes.home(slug));
        }}>Back to Homepage</Button>
      </div>
    </main>
  );
}
