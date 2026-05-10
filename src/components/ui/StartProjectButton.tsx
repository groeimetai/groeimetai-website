'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface StartProjectButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Public CTA button. Always points to /contact under the new positioning
 * — there is no public registration / dashboard funnel anymore.
 */
export function StartProjectButton({
  variant = 'default',
  size = 'default',
  className = '',
  children,
}: StartProjectButtonProps) {
  return (
    <Link href="/contact" className="inline-block">
      <Button variant={variant} size={size} className={className}>
        {children ?? (
          <>
            Plan een gesprek
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </Link>
  );
}
