'use client';

import { FileText } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <FileText className="w-5 h-5" />
      Print deze pagina
    </button>
  );
}