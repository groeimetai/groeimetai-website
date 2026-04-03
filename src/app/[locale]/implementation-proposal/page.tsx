import { redirect } from '@/i18n/routing';

export default function ImplementationProposalPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/services',
    locale: params.locale,
  });
}
