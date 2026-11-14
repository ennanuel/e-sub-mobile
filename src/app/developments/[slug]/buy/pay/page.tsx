import { PayScreen } from '@/features/buy/PayScreen';
import { loadDevelopment, titled } from '@/lib/load';

export const generateMetadata = titled('Pay to start');

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectInfo = await loadDevelopment(slug);
  return <PayScreen listing={projectInfo?.project ?? {}} />;
}
