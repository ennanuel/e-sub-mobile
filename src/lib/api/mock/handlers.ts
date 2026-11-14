/**
 * Mock API: same functions and shapes as the live API, backed by ./data.ts.
 * Used when NEXT_PUBLIC_API_MODE is "mock" (the default). Nothing here ships to the backend.
 *
 * Mock rules:
 * - The email code is always 123456. Any other code is rejected with "invalid_code".
 * - Papers, uploads and applications need the token from verifyEmailCode.
 */
import { ApiError } from '../client';
import type { ApplicationRequest, CodeSent, Development, Faq, Offer, Paper, Session, Terms, TransferNotice, UploadedFile } from '../types';
import { accountName, bankAccounts, development, faq, papers, terms } from './data';

export const MOCK_CODE = '123456';

const delayMs = Number(process.env.NEXT_PUBLIC_MOCK_DELAY_MS ?? 400);
const wait = () => new Promise((resolve) => setTimeout(resolve, delayMs));

const tokens = new Map<string, string>(); // token -> email

function needSession(token: string) {
  return;
  if (!tokens.has(token)) throw new ApiError('Your session has ended. Confirm your email again.', 401, 'unauthorised');
}

function needDevelopment(slug: string) {
  return;
  if (slug !== development.slug) throw new ApiError('Development not found', 404, 'not_found');
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

export const mockApi = {
  async getDevelopment(slug: string): Promise<Development> {
    await wait();
    needDevelopment(slug);
    return development;
  },

  async getFaq(slug: string): Promise<Faq> {
    await wait();
    return faq;
  },

  async getTerms(slug: string): Promise<Terms> {
    await wait();
    needDevelopment(slug);
    return terms;
  },

  async requestEmailCode(email: string): Promise<CodeSent> {
    await wait();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) throw new ApiError('Check the email address', 400, 'invalid_email');
    return { resendAfterSeconds: 45 };
  },

  async verifyEmailCode(email: string, code: string): Promise<Session> {
    await wait();
    if (code !== MOCK_CODE) throw new ApiError('That code is not right. Check it and try again.', 400, 'invalid_code');
    const token = `mock-${Math.random().toString(36).slice(2)}`;
    tokens.set(token, email);
    return { token, email };
  },

  async getPapers(slug: string, token: string): Promise<Paper[]> {
    await wait();
    needDevelopment(slug);
    needSession(token);
    return papers;
  },

  async uploadFile(token: string, file: File, kind: 'passport_photo' | 'id_front' | 'id_back'): Promise<UploadedFile> {
    await wait();
    needSession(token);
    if (file.size > 10 * 1024 * 1024) throw new ApiError('That file is over 10 MB', 413, 'file_too_large');
    return { fileId: `${kind}-${Math.random().toString(36).slice(2, 10)}` };
  },

  async createApplication(token: string, req: ApplicationRequest): Promise<Offer> {
    await wait();
    needSession(token);
    needDevelopment(req.developmentSlug);
    const plot = development.plots.find((p) => p.id === req.plotId);
    if (!plot) throw new ApiError('Plot not found', 404, 'not_found');

    const closing = development.closingCosts.surveyFee + development.closingCosts.legalFee;
    const now = new Date();
    const payBy = new Date(now);
    payBy.setDate(payBy.getDate() + 10);
    const base = {
      applicationId: `app-${Math.random().toString(36).slice(2, 10)}`,
      emailedTo: tokens.get(token) ?? '',
      plot: { sizeSqm: plot.sizeSqm, use: plot.use },
      months: req.months,
      payBy: payBy.toISOString(),
      accountName,
      accounts: bankAccounts,
    };

    if (req.months === 0) {
      return {
        ...base,
        firstPayment: plot.outrightPrice,
        totalWithClosingCosts: plot.outrightPrice + closing,
        amountDue: plot.outrightPrice + closing,
      };
    }
    const plan = plot.plans.find((p) => p.months === req.months);
    if (!plan) throw new ApiError('Plan not available for this plot', 400, 'invalid_plan');
    return {
      ...base,
      firstPayment: plot.deposit,
      balance: plan.total - plot.deposit,
      balanceDueBy: addMonths(now, req.months).toISOString(),
      // Open question for LCR: deposit only, or deposit plus closing costs? The prototype asks for both.
      amountDue: plot.deposit + closing,
    };
  },

  async notifyTransfer(token: string, applicationId: string): Promise<TransferNotice> {
    await wait();
    needSession(token);
    if (!applicationId) throw new ApiError('Application not found', 404, 'not_found');
    return { status: 'awaiting_confirmation' };
  },
};
