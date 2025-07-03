import { redirect } from 'next/navigation';

// This page only exists to redirect users to the locale-specific page
export default function RootPage() {
  redirect('/nl');
}