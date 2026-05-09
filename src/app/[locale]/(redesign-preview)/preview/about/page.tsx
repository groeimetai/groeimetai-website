import { AboutPageView } from '@/components/landing-v2/pages/AboutPageView';

export default function PreviewAboutPage({ params }: { params: { locale: string } }) {
  return <AboutPageView basePath={`/${params.locale}/preview`} />;
}
