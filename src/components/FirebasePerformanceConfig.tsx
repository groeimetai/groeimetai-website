'use client';

import { useEffect } from 'react';
import { configurePerformanceMonitoring } from '@/utils/performance/firebasePerformance';

export function FirebasePerformanceConfig() {
  useEffect(() => {
    // Configure Firebase Performance on mount
    configurePerformanceMonitoring();
  }, []);

  return null;
}