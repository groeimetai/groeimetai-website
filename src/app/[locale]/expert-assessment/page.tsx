import { redirect } from '@/i18n/routing';

export default function ExpertAssessmentPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/services',
    locale: params.locale,
  });
}
