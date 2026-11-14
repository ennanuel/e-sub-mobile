import { OfferScreen } from '@/features/buy/OfferScreen';
import { loadDevelopment, titled } from '@/lib/load';

export const generateMetadata = titled('Your offer');

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectInfo = await loadDevelopment(slug);

  return <OfferScreen listing={projectInfo?.project ?? {}} />;
}
