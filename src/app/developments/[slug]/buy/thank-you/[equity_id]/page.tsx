import { ThankYouScreen } from '@/features/buy/ThankYouScreen';
import { titled } from '@/lib/load';

export const generateMetadata = titled('Thank you');

export default async function Page({ params }: { params: Promise<{ slug: string; equity_id: string }> }) {
  const { slug, equity_id } = await params;
  return <ThankYouScreen slug={slug} equityId={equity_id} />;
}
