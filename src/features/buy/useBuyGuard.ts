'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { planLabel } from '@/lib/pricing';
import { usePurchase } from '@/lib/purchase';
import { routes } from '@/lib/routes';
import { useSession } from '@/lib/session';
import { ProjectDetails } from '@/types';

interface Needs {
  terms?: boolean;
  session?: boolean;
  offer?: boolean;
  transfer?: boolean;
}

/**
 * Each buying step needs the steps before it. If one is missing (e.g. the page was refreshed,
 * which clears the in-memory purchase), send the buyer to the first missing step.
 * Returns true when the step can show.
 */
export function useBuyGuard(slug: string, needs: Needs = {}): boolean {
  const router = useRouter();
  const purchase = usePurchase();
  const { user, token } = useSession();

  const missing = !purchase.unitId
    ? routes.listing(slug)
    : // : needs.terms && !purchase.termsVersion
      //   ? routes.buy.terms(slug)
      !user || !token
      ? routes.buy.email(slug)
      : // : !purchase.equityId
        //   ? routes.buy.details(slug)
        // : needs.transfer && !purchase.transferNoticed
        //   ? routes.buy.pay(slug)
        null;

  useEffect(() => {
    if (missing) router.replace(missing);
  }, [missing, router]);

  return !missing;
}

/** "CITYVIEW · 200 SQM · 12 MONTHS" above the buying screens. */
export function usePurchaseKicker(listing: ProjectDetails): string {
  const { unit, paymentPlan } = usePurchase();
  const unitSize = unit?.unit_size ? `${unit.unit_size}${!/[a-z]/i.test(unit.unit_size) ? ' sqm' : ''}` : '';
  const months = paymentPlan?.payment_period_in_months;

  return unit ? `${listing?.name} · ${unitSize ? ' · '  : ''}${planLabel(months)}` : listing.name;
}
