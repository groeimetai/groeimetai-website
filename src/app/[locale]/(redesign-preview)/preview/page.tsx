import { HomePageView } from '@/components/landing-v2/pages/HomePageView';

export default function PreviewHomePage({ params }: { params: { locale: string } }) {
  return <HomePageView basePath={`/${params.locale}/preview`} />;
}
