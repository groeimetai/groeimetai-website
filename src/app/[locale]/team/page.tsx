import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Team - GroeimetAI',
  description: 'Meet the GroeimetAI Team'
};

export default function TeamPage() {
  // Redirect to about page where team info might be
  redirect('/about');
}