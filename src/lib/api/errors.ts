import { ApiError } from './client';

/** The message to show for a failed call: the API's own, or a plain fallback for network trouble. */
export function errorMessage(e: unknown, fallback = 'Something went wrong. Check your connection and try again.'): string {
  return e instanceof ApiError && e.message ? e.message : fallback;
}

/** True when the API says the session token is missing or expired. */
export const isSessionExpired = (e: unknown) => e instanceof ApiError && e.status === 401;
