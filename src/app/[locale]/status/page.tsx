import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Status - GroeimetAI',
  description: 'GroeimetAI System Status'
};

export default function StatusPage() {
  // Redirect to a relevant page
  redirect('/dashboard');
}