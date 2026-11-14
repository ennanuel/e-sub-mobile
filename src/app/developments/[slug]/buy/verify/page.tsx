import { VerifyScreen } from '@/features/buy/VerifyScreen';
import { titled } from '@/lib/load';

export const generateMetadata = titled('Confirm your email');

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VerifyScreen slug={slug} />;
}
