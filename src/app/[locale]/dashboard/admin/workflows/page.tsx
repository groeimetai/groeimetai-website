import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with ReactFlow
const WorkflowAutomation = dynamic(
  () => import('@/components/admin/WorkflowAutomation'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Workflow Automation | Admin Dashboard',
  description: 'Create and manage automated workflows',
};

export default function WorkflowsPage() {
  return <WorkflowAutomation />;
}