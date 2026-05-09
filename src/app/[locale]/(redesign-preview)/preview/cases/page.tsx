import { CasesPageView } from '@/components/landing-v2/pages/CasesPageView';

export default function PreviewCasesPage({ params }: { params: { locale: string } }) {
  return <CasesPageView basePath={`/${params.locale}/preview`} />;
}
