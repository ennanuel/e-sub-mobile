import { OfferScreen } from '@/features/buy/OfferScreen';
import { loadDevelopment, titled } from '@/lib/load';
import { ProjectDetails } from '@/types';

export const generateMetadata = titled('Your offer');

export default async function Page({ params }: { params: Promise<{ slug: string; equity_id: string }> }) {
  const { slug, equity_id } = await params;
  const projectInfo = await loadDevelopment(slug);

  return <OfferScreen equityId={equity_id} listing={(projectInfo?.project ?? {}) as ProjectDetails} />;
}
