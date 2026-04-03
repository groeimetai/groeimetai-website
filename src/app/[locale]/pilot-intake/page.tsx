import { redirect } from '@/i18n/routing';

export default function PilotIntakePage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/services',
    locale: params.locale,
  });
}
