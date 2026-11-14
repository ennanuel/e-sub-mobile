import { redirect } from 'next/navigation';
import { routes } from '@/lib/routes';

/** One development for now. A realtor's link points straight at /developments/<slug>. */
export default async function Root(params: { searchParams: Promise<{ listing_id: string }> }) {
  return redirect(routes.home(process.env.NEXT_PUBLIC_LISTING_ID!));
}
