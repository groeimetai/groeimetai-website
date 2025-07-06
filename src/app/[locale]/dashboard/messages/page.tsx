'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues
const MessagesPageFirebase = dynamic(() => import('./MessagesPageFirebase'), {
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange mx-auto" />
        <p className="mt-4 text-white/60">Loading messages...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function MessagesPage() {
  return <MessagesPageFirebase />;
}