import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Roadmap - GroeimetAI',
  description: 'GroeimetAI Product Roadmap'
};

export default function RoadmapPage() {
  // Redirect to a relevant page
  redirect('/about');
}