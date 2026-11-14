import { EmailScreen } from '@/features/buy/EmailScreen';
import { loadDevelopment, titled } from '@/lib/load';

export const generateMetadata = titled('Your email');

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectInfo = await loadDevelopment(slug);

  return <EmailScreen listing={projectInfo?.project ?? {}} />;
}
