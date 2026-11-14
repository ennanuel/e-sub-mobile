'use client';

import { useToast } from './Toast';

/**
 * Share this page: the phone's share sheet when there is one, otherwise copy the link
 * and say so. Render `toast` somewhere on the screen.
 */
export function useShareLink() {
  const toast = useToast();

  const share = async (title: string) => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.show('Link copied');
    } catch (e) {
      // Closing the share sheet is not an error.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      toast.show('Could not share this page');
    }
  };

  return { share, toast: toast.element };
}
