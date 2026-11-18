import type { Metadata } from 'next';
import { HomeExperience } from '@/features/home/HomeExperience';
import { loadDevelopment, loadFaq } from '@/lib/load';
import { notFound } from 'next/navigation';
import { ProjectDetails } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await loadDevelopment(slug);
  const project = (res?.project ?? {}) as ProjectDetails;
  return {
    title: `${project.name ?? ''}${project && project?.address ? ', ' : ''}${project.address ?? ''}`,
    description: project.description,
  };
}

export default async function DevelopmentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { view } = await searchParams;
  const [projectInfo, faq] = await Promise.all([loadDevelopment(slug), loadFaq(slug)]);
  const project = (projectInfo?.project ?? {}) as ProjectDetails;

  if (!project) notFound();

  return <HomeExperience listing={project} faq={faq} startOnListing={view === 'listing'} />;
}
