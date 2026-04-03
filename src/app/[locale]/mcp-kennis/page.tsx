import { redirect } from '@/i18n/routing';

export default function McpKennisPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/snow-flow',
    locale: params.locale,
  });
}
