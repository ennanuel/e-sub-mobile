import type { ClosingCosts, Plot } from './api/types';

export type Months = 0 | 6 | 12 | 18;

export const PLAN_CHOICES: { months: Months; label: string }[] = [
  { months: 0, label: 'Outright' },
  { months: 6, label: '6 months' },
  { months: 12, label: '12 months' },
  { months: 18, label: '18 months' },
];

export function planLabel(months?: number): string {
  return months ? `${months} months` : 'Outright';
}

export interface PlanBreakdown {
  months: Months;
  /** Plan: the initial deposit. Outright: the price. */
  firstPayment: number;
  /** Everything for the plot, without closing costs. */
  total: number;
  /** Plan: what is left after the deposit. */
  balance: number;
  closingCosts: number;
  /** Total plus closing costs. */
  grandTotal: number;
  /** Deposit as a share of the plan total, 0 to 100 (for the bar). */
  depositShare: number;
}

/** What the plot page shows for a plot and a plan length. Final amounts come from the API's offer. */
export function breakdown(plot: Plot, months: Months, costs: ClosingCosts): PlanBreakdown {
  const closingCosts = costs.surveyFee + costs.legalFee;
  const plan = months ? plot.plans.find((p) => p.months === months) : undefined;

  if (!months || !plan) {
    const total = plot.outrightPrice;
    return { months: 0, firstPayment: total, total, balance: 0, closingCosts, grandTotal: total + closingCosts, depositShare: 100 };
  }
  return {
    months,
    firstPayment: plot.deposit,
    total: plan.total,
    balance: plan.total - plot.deposit,
    closingCosts,
    grandTotal: plan.total + closingCosts,
    depositShare: Math.round((plot.deposit / plan.total) * 100),
  };
}

/** The 1st of the month, `months` from now: when a plan ends. */
export function planEnd(months: number, from = new Date()): Date {
  const d = new Date(from);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function parseMonths(value: string | null | undefined): Months {
  const n = Number(value);
  return n === 6 || n === 12 || n === 18 ? n : 0;
}
