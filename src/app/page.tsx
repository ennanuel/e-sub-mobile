import { redirect } from 'next/navigation';
import { routes } from '@/lib/routes';

/** One development for now. A realtor's link points straight at /developments/<slug>. */
export default async function Root(props: { searchParams: Promise<{ agent_ref_id: string; listing_id: string }> }) {
  const { listing_id, agent_ref_id } = await props.searchParams;

  return redirect(
    routes.home(listing_id ?? process.env.NEXT_PUBLIC_LISTING_ID!, agent_ref_id ? { agent_referral_id: agent_ref_id } : undefined),
  );
}
