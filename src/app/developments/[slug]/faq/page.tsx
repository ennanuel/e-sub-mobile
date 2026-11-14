import { FaqScreen } from '@/features/faq/FaqScreen';
import { loadDevelopment, loadFaq, titled } from '@/lib/load';

export const generateMetadata = titled('Questions people ask');

export default async function FaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [projectInfo, faq] = await Promise.all([loadDevelopment(slug), loadFaq(slug)]);
  const project = projectInfo?.project ?? {};
  return <FaqScreen project={project} faq={faq} />;
}
