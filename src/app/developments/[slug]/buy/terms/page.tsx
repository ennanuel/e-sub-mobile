import { TermsScreen } from '@/features/buy/TermsScreen';
import { loadDevelopment, loadTerms, titled } from '@/lib/load';

export const generateMetadata = titled('Terms of the deal');

export default async function TermsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [projectInfo, terms] = await Promise.all([loadDevelopment(slug), loadTerms(slug)]);
  const project = projectInfo?.project ?? {};
  return <TermsScreen slug={slug} developmentName={project.name} terms={terms} />;
}
