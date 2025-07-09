'use client';

import { useCommandPalette } from '@/components/CommandPalette';
import { Button } from '@/components/ui/button';

export function CommandPaletteDemo() {
  const { toggle } = useCommandPalette();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Command Palette Demo</h1>
      <p className="text-gray-600">
        Press <kbd className="px-2 py-1 text-sm bg-gray-100 rounded">Cmd/Ctrl + K</kbd> to open the
        command palette
      </p>
      <Button onClick={toggle}>Open Command Palette</Button>
    </div>
  );
}
