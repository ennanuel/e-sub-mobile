import { PayScreen } from '@/features/buy/PayScreen';
import { loadDevelopment, titled } from '@/lib/load';
import { ProjectDetails } from '@/types';

export const generateMetadata = titled('Pay to start');

export default async function Page({ params }: { params: Promise<{ slug: string; equity_id: string }> }) {
  const { slug, equity_id } = await params;
  const projectInfo = await loadDevelopment(slug);
  return <PayScreen equityId={equity_id} listing={(projectInfo?.project ?? {}) as ProjectDetails} />;
}
