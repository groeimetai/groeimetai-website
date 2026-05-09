import { TrainingenPageView } from '@/components/landing-v2/pages/TrainingenPageView';

export default function PreviewTrainingenPage({ params }: { params: { locale: string } }) {
  return <TrainingenPageView basePath={`/${params.locale}/preview`} />;
}
