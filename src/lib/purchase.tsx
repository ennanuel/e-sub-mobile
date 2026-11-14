'use client';

/**
 * The plot purchase in progress: which plot and plan, agreed terms, the details form and the offer.
 * In memory only. Screens that need a step that has not happened yet send the buyer back to the listing.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BundlePaymentPlan, Equity, NextOfKinUpdateValues, ProjectBundle, UserDocument, UserUpdateValues } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getPaymentPlanDetails, getUnitDetails } from './load';
import { getEquityDetails, makeEquityPayment } from '@/api/equity';
import { useSession } from './session';
import { getBusinessId, getStoreName } from '@/constants/routes';
import { isFilled, isLocalPhone } from './validation';
import { toE164 } from './format';
import { DEFAULT_USER_DATA } from '@/constants/fields';
import { routes } from './routes';
import { useRouter } from 'next/navigation';

/** Everything typed on Your details, kept so going back does not lose it. */
export interface DetailsDraft {
  user: Partial<UserUpdateValues>;
  nextOfKin: Partial<NextOfKinUpdateValues>;
}

const emptyDraft: DetailsDraft = {
  user: {},
  nextOfKin: {},
};

interface Purchase {
  listingId: number | null;
  unitId: number | null;
  paymentPlanId: number | null;
  termsVersion: string | null;
  draft: DetailsDraft;
  equityId: number | null;
  transferNoticed: boolean;
}

interface PurchaseState extends Purchase {
  unit: ProjectBundle | null;
  paymentPlan: BundlePaymentPlan | null;
  isLoadingUnit: boolean;
  isLoadingPaymentPlan: boolean;
  isSubmitting: boolean;
  isLoadingEquity: boolean;
  equity: Equity | null;
  createSubscription: () => Promise<void>;
  start: (listingId: number, unitId: number, paymentPlanId: number | null) => void;
  agreeTerms: (version: string) => void;
  saveDraft: (draft: DetailsDraft) => void;
  setEquityId: (equityId: number | null) => void;
  markTransferNoticed: () => void;
}

const initial: Purchase = {
  unitId: null,
  listingId: null,
  paymentPlanId: null,
  termsVersion: null,
  draft: emptyDraft,
  equityId: null,
  transferNoticed: false,
};

const PurchaseContext = createContext<PurchaseState | null>(null);

const optional = (v: string) => (isFilled(v) ? v.trim() : undefined);
const optionalPhone = (v: string) => (isLocalPhone(v) ? toE164(v) : undefined);

export function PurchaseProvider({ children, slug }: { children: ReactNode; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<Purchase>(initial);

  const { isUpdatingUserDetail, updateUserDetail, isSigningUp, signUp, user, token } = useSession();

  const start = useCallback((listingId: number, unitId: number, paymentPlanId: number | null) => {
    // A new plot or plan starts a new purchase, but keeps what was typed on Your details.
    setState((s) => ({ ...initial, draft: s.draft, listingId, unitId, paymentPlanId }));
  }, []);
  const agreeTerms = useCallback((termsVersion: string) => setState((s) => ({ ...s, termsVersion })), []);
  const saveDraft = useCallback((draft: DetailsDraft) => setState((s) => ({ ...s, draft })), []);
  const setEquityId = useCallback((equityId: number | null) => setState((s) => ({ ...s, equityId, transferNoticed: false })), []);
  const markTransferNoticed = useCallback(() => setState((s) => ({ ...s, transferNoticed: true })), []);

  const { isLoading: isLoadingUnit, data: unit = null } = useQuery({
    queryKey: ['unit_details', state.unitId],
    queryFn: () => getUnitDetails(state?.listingId?.toString() ?? '', state.unitId?.toString() ?? ''),
    enabled: !!state.unitId && !!state?.listingId,
  });
  const { isLoading: isLoadingPaymentPlan, data: paymentPlan = null } = useQuery({
    queryKey: ['payment_plan', state.paymentPlanId],
    queryFn: () => getPaymentPlanDetails(Number(state?.unitId), Number(state?.paymentPlanId)),
    enabled: !!state.paymentPlanId && !!state?.unitId,
  });

  const { isLoading: isLoadingEquity, data: equity = null } = useQuery({
    queryKey: ['equity_details', state.equityId, user?.id],
    queryFn: () => getEquityDetails(state.equityId?.toString() ?? '', user?.id?.toString() ?? ''),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: makeEquityPayment,
    onSuccess: (res) => {
      const offer = res.data;
      setEquityId(offer?.equity_id);
      router.push(routes.buy.offer(slug));
    },
  });

  const isSubmitting = isPending || isSigningUp || isUpdatingUserDetail;

  const createSubscription = () =>
    new Promise<void>((resolve, reject) => {
      const details = state.draft;

      const prepareValue = ([key, value]: [key: string, value: string | UserDocument[] | null]): [
        key: string,
        value: string | UserDocument[] | null,
      ] => {
        if (typeof value !== 'string') return [key, value];
        if (key === 'phone' || key === 'alternate_phone') return [key, optionalPhone(value) ?? ''];
        else return [key, optional(value) ?? ''];
      };

      const valuesToSubmit = {
        user: Object.fromEntries(Object.entries(details.user).map(prepareValue)),
        nextOfKin: Object.fromEntries(Object.entries(details.nextOfKin).map(prepareValue)),
      };

      const storeName = getStoreName();
      const businessId = getBusinessId() ?? '';

      const objToSubmit = {
        amount_to_pay: Number(paymentPlan?.initial_deposit_in_value ? paymentPlan?.initial_deposit_in_value : unit?.price),
        bundle_id: Number(unit?.id),
        business_id: businessId,
        from_store: true,
        payment_option: 'virtual_bank' as const,
        paymentplan_id: paymentPlan?.initial_deposit_in_value ? paymentPlan?.id : undefined,
        redirect_url: `https://${storeName}.6787878.com`,
        store_name: storeName,
        type: 'WHOLE' as const,
      };

      const cbWrapper =
        user && token
          ? (cb: () => void) => cb()
          : (cb: () => void) => {
              signUp({ user: { ...DEFAULT_USER_DATA, ...valuesToSubmit.user }, onSuccess: cb, onError: reject }, {});
            };

      cbWrapper(() =>
        updateUserDetail(
          [
            ['profile', details.user],
            ['next_of_kin', details.nextOfKin],
          ],
          {
            onSuccess: () => {
              mutate(objToSubmit, {
                onSuccess: () => {
                  resolve();
                },
                onError: (err) => {
                  reject(err);
                },
              });
            },
            onError: (err) => {
              reject(err);
            },
          },
        ),
      );
    });

  const value = useMemo(
    () => ({
      ...state,
      isLoadingUnit,
      unit,
      isLoadingPaymentPlan,
      paymentPlan,
      isLoadingEquity,
      equity,
      isSubmitting,
      createSubscription,
      start,
      agreeTerms,
      saveDraft,
      setEquityId,
      markTransferNoticed,
    }),
    [
      state,
      isLoadingUnit,
      unit,
      isLoadingPaymentPlan,
      paymentPlan,
      isSubmitting,
      isLoadingEquity,
      equity,
      createSubscription,
      user,
      token,
      start,
      agreeTerms,
      saveDraft,
      setEquityId,
      markTransferNoticed,
    ],
  );
  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}

export function usePurchase() {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error('usePurchase must be used inside <PurchaseProvider>');
  return ctx;
}
