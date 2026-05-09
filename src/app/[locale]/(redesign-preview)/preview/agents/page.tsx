import { AgentsPageView } from '@/components/landing-v2/pages/AgentsPageView';

export default function PreviewAgentsPage({ params }: { params: { locale: string } }) {
  return <AgentsPageView basePath={`/${params.locale}/preview`} />;
}
