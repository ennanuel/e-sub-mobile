import { DetailsScreen } from '@/features/buy/DetailsScreen';
import { loadDevelopment, titled } from '@/lib/load';
import { ProjectDetails } from '@/types';

export const generateMetadata = titled('Your details');

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectInfo = await loadDevelopment(slug);
  const project = (projectInfo?.project ?? {}) as ProjectDetails;
  return <DetailsScreen listing={project} />;
}
