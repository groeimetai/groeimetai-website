import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Documentation - GroeimetAI',
  description: 'GroeimetAI Documentation and Resources'
};

export default function DocsPage() {
  // Redirect to a relevant page or return a simple page
  redirect('/agent-readiness');
}