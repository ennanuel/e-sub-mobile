import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PlotScreen } from '@/features/buy/PlotScreen';
import { getUnitDetails, loadDevelopment } from '@/lib/load';

interface Props {
  params: Promise<{ slug: string; plotId: string }>;
  searchParams: Promise<{ plan?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, plotId } = await params;
  const [unit, projectInfo] = await Promise.all([getUnitDetails(slug, plotId), loadDevelopment(slug)]);
  const unitSize = unit?.unit_size ?? '';
  const projectName = projectInfo?.project?.name ?? '';

  return {
    title: unit ? `${unitSize}${!/[a-z]/i.test(unitSize) ? ' sqm' : ''} ${unit?.unit_title?.toLowerCase()} · ${projectName}` : projectName,
  };
}

export default async function PlotPage({ params }: Props) {
  const { slug, plotId } = await params;
  const [unit, projectInfo] = await Promise.all([getUnitDetails(slug, plotId), loadDevelopment(slug)]);
  const project = projectInfo?.project ?? {};

  if (!unit) notFound();
  return <PlotScreen listing={project} unit={unit} />;
}
