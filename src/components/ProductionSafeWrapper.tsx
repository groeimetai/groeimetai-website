'use client';

import { useEffect, useState } from 'react';

interface ProductionSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function ProductionSafeWrapper({ 
  children, 
  fallback = null,
  delay = 100 
}: ProductionSafeWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);
    
    // Add small delay for production hydration
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Show fallback during hydration
  if (!isClient || !isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}