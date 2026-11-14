/**
 * Every call the app makes to the backend. Screens import `api` from here and nothing else.
 *
 * NEXT_PUBLIC_API_MODE=mock (default) answers from ./mock; =live calls NEXT_PUBLIC_API_BASE_URL.
 * Endpoints, bodies and errors are documented in docs/API.md.
 */
import { request } from './client';
import { mockApi } from './mock/handlers';
import type { ApplicationRequest, CodeSent, Development, Faq, Offer, Paper, Session, Terms, TransferNotice, UploadedFile } from './types';

export type FileKind = 'passport_photo' | 'id_front' | 'id_back';

const liveApi: typeof mockApi = {
  getDevelopment: (slug) => request<Development>(`/developments/${encodeURIComponent(slug)}`),
  getFaq: (slug) => request<Faq>(`/developments/${encodeURIComponent(slug)}/faq`),
  getTerms: (slug) => request<Terms>(`/developments/${encodeURIComponent(slug)}/terms`),

  requestEmailCode: (email) => request<CodeSent>('/auth/email-code', { method: 'POST', body: { email } }),
  verifyEmailCode: (email, code) => request<Session>('/auth/verify', { method: 'POST', body: { email, code } }),

  getPapers: (slug, token) => request<Paper[]>(`/developments/${encodeURIComponent(slug)}/papers`, { token }),

  uploadFile: (token, file, kind: FileKind) => {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    return request<UploadedFile>('/files', { method: 'POST', body: form, token });
  },

  createApplication: (token, req: ApplicationRequest) => request<Offer>('/applications', { method: 'POST', body: req, token }),
  notifyTransfer: (token, applicationId) =>
    request<TransferNotice>(`/applications/${encodeURIComponent(applicationId)}/transfer-notice`, { method: 'POST', token }),
};

export const api = process.env.NEXT_PUBLIC_API_MODE === 'live' ? liveApi : mockApi;

export { ApiError } from './client';
export { errorMessage, isSessionExpired } from './errors';
export type * from './types';
