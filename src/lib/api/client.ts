/**
 * Live API client: thin fetch wrapper. Every call the app makes is in ./index.ts.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Machine-readable reason from the API, e.g. "invalid_code". */
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

interface RequestOptions {
  method?: 'GET' | 'POST';
  /** JSON body, or FormData for file uploads. */
  body?: unknown;
  /** Session token from verifyEmailCode. */
  token?: string;
}

export async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not set', 0, 'not_configured');

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    // Expected error body: { "message": "...", "code": "..." }
    const err = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Request failed (${res.status})`, res.status, err.code);
  }
  return (await res.json()) as T;
}
