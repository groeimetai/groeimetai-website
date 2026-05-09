import { AboutPageView } from '@/components/landing-v2/pages/AboutPageView';

export default function AboutPage({ params }: { params: { locale: string } }) {
  return (
    <div className="ds">
      <AboutPageView basePath={`/${params.locale}`} />
    </div>
  );
}
