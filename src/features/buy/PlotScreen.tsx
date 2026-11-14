'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Share } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { useShareLink } from '@/components/ui/useShareLink';
import { monthYear, currencyShort } from '@/lib/format';
import { usePurchase } from '@/lib/purchase';
import { routes } from '@/lib/routes';
import styles from './PlotScreen.module.css';
import { BundlePaymentPlan, ProjectBundle, ProjectDetails } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { loadUnitPaymentPaymentPlans } from '@/lib/load';
import { Center, Spinner } from '@chakra-ui/react';
import { useSession } from '@/lib/session';

interface PlotScreenProps {
  listing: ProjectDetails;
  unit: ProjectBundle;
}

export function calculatePlan(unit: ProjectBundle, selectedPlan: BundlePaymentPlan | null) {
  const isOutright = !selectedPlan;
  const fees = selectedPlan ? selectedPlan?.bundle?.fees : unit?.fees;
  const totalFees = fees?.reduce((sum, item) => sum + Number(item.amount), 0);
  const total = selectedPlan ? Number(selectedPlan?.purchase_price) + totalFees : Number(unit?.price) + totalFees;
  const dueToday = isOutright ? total : Number(selectedPlan?.initial_deposit_in_value);
  const periodicPayment = Number(selectedPlan?.periodic_payment);
  const planType = selectedPlan?.plan_type;
  const payFreq = selectedPlan?.payment_frequency;
  const percentage = isOutright ? 100 : Math.round((total / total - dueToday) * 100);
  const balance = total - dueToday;

  const endDate = new Date();
  if (selectedPlan?.payment_period_in_months) {
    endDate.setMonth(endDate.getMonth() + Number(selectedPlan?.payment_period_in_months));
  }
  return {
    isOutright,
    periodicPayment,
    planType,
    payFreq,
    total,
    dueToday,
    fees,
    endDate,
    percentage,
    balance,
  };
}

/** One plot: choose outright or a plan, see the deposit, the plan and the closing costs. */
export function PlotScreen({ listing, unit }: PlotScreenProps) {
  const router = useRouter();
  const purchase = usePurchase();

  const { user, token } = useSession();

  const { isLoading: isLoadingPaymentPlans, data: paymentPlansData } = useQuery({
    queryKey: ['unit_payment_plans', unit?.id],
    queryFn: () => loadUnitPaymentPaymentPlans(unit.id),
  });

  const paymentPlans = useMemo(() => paymentPlansData?.results?.filter((plan) => !!plan.id) ?? [], [paymentPlansData]);

  const unitSize = `${unit?.unit_size}${!/[a-z]/i.test(unit?.unit_size) ? ' sqm' : ''}`;
  const unitPrice = Number(unit?.price);
  const currency = unit?.currency ?? listing?.currency ?? listing?.starting_from_currency;

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const selectedPlan = useMemo(() => paymentPlans?.find((p) => p.id === selectedPlanId) ?? null, [selectedPlanId, paymentPlans]);
  const selectedPlanSummary = useMemo(() => calculatePlan(unit, selectedPlan), [selectedPlan, unit]);

  const isOutright = !selectedPlanId;

  const { share, toast } = useShareLink();

  const choices = [
    { label: 'Outright', value: null },
    ...paymentPlans.map((plan) => ({ label: `${plan.payment_period_in_months} months`, value: plan.id })),
  ];

  const choose = (m: number | null) => {
    setSelectedPlanId(m);
    window.history.replaceState(null, '', m ? `?plan=${m ?? 'outright'}` : window.location.pathname);
  };

  const start = () => {
    purchase.start(listing.id, unit.id, selectedPlanId);

    if (user && token) {
      router.push(routes.buy.details(listing?.id?.toString()));
    } else {
      router.push(routes.buy.email(listing?.id?.toString()));
    }
  };

  if (isLoadingPaymentPlans)
    return (
      <Center flex="1" minHeight="75dvh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Screen
      label={`${unitSize} ${unit?.unit_title?.toLowerCase()}`}
      back={routes.listing(listing?.id?.toString())}
      compactBar
      actions={
        <IconButton label="Share" onClick={() => void share(`${unit?.unit_title}, ${unitSize}`)}>
          <Share size={19} />
        </IconButton>
      }
      footer={<Button onClick={start}>{isOutright ? `Pay ${currencyShort(unitPrice, currency)}` : 'Start this plan'}</Button>}
    >
      <div className={styles.kicker}>
        {listing?.name} · {unitSize}
      </div>
      <h1 className={styles.title}>{unit?.unit_title}</h1>

      <div className={styles.pills} role="radiogroup" aria-label="How to pay">
        {choices.map((c) => (
          <button key={c.value} type="button" role="radio" aria-checked={selectedPlanId === c.value} onClick={() => choose(c.value)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.hero}>
        <div className={styles.heroLabel}>{isOutright ? 'Purchase price' : 'Initial deposit'}</div>
        <div className={styles.heroAmount}>{currencyShort(selectedPlanSummary?.dueToday, currency)}</div>
        <div className={styles.heroSub}>{isOutright ? 'One payment, plot fully yours' : 'Paid to start your plan'}</div>
      </div>

      {!isOutright && (
        <div>
          <div className={styles.planLabels}>
            <span>Your plan</span>
            <span className={styles.muted}>{currencyShort(selectedPlanSummary?.total, currency)}</span>
          </div>
          <div className={styles.bar} aria-hidden="true">
            <span className={styles.barDeposit} style={{ flex: selectedPlanSummary?.percentage }} />
            <span className={styles.barRest} style={{ flex: 100 - selectedPlanSummary?.percentage }} />
          </div>
          <div className={styles.barKey}>
            <span style={{ minWidth: '12px' }}>
              <b className={styles.red}>{currencyShort(selectedPlanSummary?.dueToday, currency)}</b> <i>deposit</i>
            </span>
            <span>
              <b>{currencyShort(selectedPlanSummary?.balance, currency)}</b> <i>to pay by {monthYear(selectedPlanSummary.endDate)}</i>
            </span>
          </div>
        </div>
      )}

      {selectedPlanSummary?.fees?.length > 1 && (
        <>
          <div className={styles.costsLabel}>Closing costs</div>
          {selectedPlanSummary?.fees?.map((fee) => (
            <div className={styles.row} key={fee?.name}>
              <span>{fee?.name}</span>
              <b>{currencyShort(Number(fee?.amount), currency)}</b>
            </div>
          ))}
        </>
      )}
      {toast}
    </Screen>
  );
}
