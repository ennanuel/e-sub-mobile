import { PapersFlow } from '@/features/papers/PapersFlow';
import type { PaperId } from '@/lib/api/types';
import { loadDevelopment, loadListingPaperwork, titled } from '@/lib/load';

export const generateMetadata = titled('Paperwork');

const PAPER_IDS: PaperId[] = ['rofo', 'survey', 'cofo'];

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ doc?: string }>;
}

export default async function PapersPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { doc } = await searchParams;
  const [projectInfo, paperworkInfo] = await Promise.all([loadDevelopment(slug), loadListingPaperwork(slug)]);
  const project = projectInfo?.project ?? {};
  const paperwork = paperworkInfo?.paperwork;

  return <PapersFlow listing={project} paperwork={paperwork ?? null} openPaper={PAPER_IDS.find((id) => id === doc)} />;
}
