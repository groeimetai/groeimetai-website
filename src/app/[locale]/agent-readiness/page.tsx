import { redirect } from '@/i18n/routing';

export default function AgentReadinessPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/services',
    locale: params.locale,
  });
}
