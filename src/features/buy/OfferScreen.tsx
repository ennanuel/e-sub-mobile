'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import { capitalise, dayMonth, currencyShort } from '@/lib/format';
import { usePurchase } from '@/lib/purchase';
import { routes } from '@/lib/routes';
import styles from './OfferScreen.module.css';
import { useSession } from '@/lib/session';
import { dateOrTimeAgo } from '@/lib/date';
import { ProjectDetails } from '@/types';
import { useEffect, useState } from 'react';
import { Center, Spinner } from '@chakra-ui/react';

/** Buying, step 4: the offer LCR emailed, then "Proceed to payment". */
export function OfferScreen({ listing, equityId: initialEquityId }: { listing: ProjectDetails; equityId: string }) {
  const slug = listing?.id?.toString();
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  const { user } = useSession();
  const { isLoadingEquity, equityId, setEquityId, equity } = usePurchase();

  const first = capitalise(user?.first_name ?? '');

  const currency = equity?.currency ?? null;
  const offerPrice = equity?.offer_price;

  const isPaymentPlan = !!equity?.payment_plan;
  const isFractional = equity?.type === 'FRACTIONAL';

  const amountToPay = Number(
    isFractional
      ? equity?.unit?.price_per_fraction
      : isPaymentPlan
        ? equity?.payment_plan?.initial_deposit_in_value
        : offerPrice || equity?.total_unit_price,
  );

  const purchasePrice = Number(
    isFractional ? equity?.price_per_fraction : (equity?.payment_plan?.purchase_price ?? equity?.total_unit_price),
  );

  const initialDeposit = Number(
    isPaymentPlan && equity?.payment_plan?.initial_deposit_in_value ? equity?.payment_plan?.initial_deposit_in_value : 0,
  );

  const unitSize = `${equity?.unit?.unit_size}${!/[a-z]/i.test(equity?.unit?.unit_size ?? '') ? ' sqm' : ''}`;
  const closingCost = (equity?.equity_fees?.length ? equity?.equity_fees : equity?.custom_payments)?.reduce(
    (sum, fee) => sum + Number(fee.amount),
    0,
  );

  const paymentPlanBalance = purchasePrice - initialDeposit;

  useEffect(() => {
    if (!equityId?.toString() && !!initialEquityId?.toString() && !isNaN(Number(initialEquityId))) {
      setEquityId(Number(initialEquityId))
    }
  }, [initialEquityId, equityId])

  useEffect(() => {
    return () => {
      setIsRouting(false);
    }
  }, [])

  if (isLoadingEquity || !equityId) return (<Center width="100%" height="100dvh">
    <Spinner size="xl" />
  </Center>)

  return (
    <Screen
      label="Your offer"
      back={routes.buy.details(slug)}
      entrance="fade"
      footer={
        <div className={styles.footer}>
          <Button loading={isRouting} onClick={() => {
            setIsRouting(true);
            router.push(routes.buy.pay(slug, equityId?.toString()))
          }}>Proceed to payment</Button>
        </div>
      }
    >
      <div className={`${text.eyebrow} ${styles.in1}`}>Your offer is ready</div>
      <h1 className={`${text.heading} ${styles.in2}`}>We’ve emailed it to you</h1>

      <div className={`${styles.mail} ${styles.in3}`}>
        <div className={styles.mailHead}>
          <span className={styles.avatar}>LCR</span>
          <span className={styles.from}>
            <b>LCR</b>
            <i>
              to {user?.email} · {dateOrTimeAgo(equity?.created_at ?? '')}
            </i>
          </span>
        </div>
        <div className={styles.mailBody}>
          <b className={styles.subject}>
            Your offer for {listing?.name}, {listing?.address.split(',')[0]}
          </b>
          <p>
            Dear {first}, thank you for choosing a {unitSize} {equity?.unit?.unit_type.toLowerCase()}. Please make your payment by{' '}
            {dayMonth(equity?.offer_expires ?? '')}…
          </p>
          <div className={styles.row}>
            <span>{isPaymentPlan ? 'Initial deposit' : 'Purchase price'}</span>
            <b className={styles.red}>{currencyShort(amountToPay, currency)}</b>
          </div>
          {((isPaymentPlan && (!isNaN(paymentPlanBalance) && paymentPlanBalance > 0)) || closingCost) ? (
            <div className={styles.row}>
              <span>{isPaymentPlan ? 'Balance' : 'With closing costs'}</span>
              <b>
                {isPaymentPlan
                  ? `${currencyShort(paymentPlanBalance ?? 0, currency)} in ${equity?.payment_plan?.payment_period_in_months} ${equity?.payment_plan?.payment_period_in_months === 1 ? 'month' : 'months'}`
                  : currencyShort(closingCost ?? 0, currency)}
              </b>
            </div>
          ) : null}
        </div>
      </div>
    </Screen>
  );
}
