import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
};

// Analytics endpoint for performance data
const ANALYTICS_ENDPOINT = '/api/analytics/performance';

/**
 * Get performance rating based on value and thresholds
 */
function getPerformanceRating(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
  
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send performance metrics to analytics
 */
async function sendToAnalytics(metric: Metric) {
  const body = {
    metric: metric.name,
    value: metric.value,
    rating: getPerformanceRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    timestamp: new Date().toISOString(),
  };

  // Use sendBeacon if available, otherwise use fetch
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
  } else {
    try {
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
}

/**
 * Log performance metrics to console in development
 */
function logMetric(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    const rating = getPerformanceRating(metric.name, metric.value);
    const color = rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red';
    
    console.group(`%c⚡ Web Vitals: ${metric.name}`, `color: ${color}`);
    console.log('Value:', metric.value);
    console.log('Rating:', rating);
    console.log('Delta:', metric.delta);
    console.log('ID:', metric.id);
    console.log('Navigation Type:', metric.navigationType);
    console.groupEnd();
  }
}

/**
 * Initialize Web Vitals reporting
 */
export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  const handleMetric = (metric: Metric) => {
    // Log in development
    logMetric(metric);
    
    // Send to analytics
    sendToAnalytics(metric);
    
    // Call custom handler if provided
    if (onPerfEntry) {
      onPerfEntry(metric);
    }
  };

  // Core Web Vitals
  onCLS(handleMetric);
  onFCP(handleMetric);
  onINP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * Get current performance metrics
 */
export function getCurrentMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    // Navigation timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    domProcessing: navigation.domComplete - navigation.domInteractive,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Paint timing
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // Resource timing
    resources: performance.getEntriesByType('resource').length,
    totalResourceSize: performance.getEntriesByType('resource').reduce(
      (total, resource: any) => total + (resource.transferSize || 0),
      0
    ),
  };
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(callback: (entries: PerformanceEntry[]) => void) {
  if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      callback(entries);
      
      // Log long tasks in development
      if (process.env.NODE_ENV === 'development') {
        entries.forEach((entry) => {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
        });
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  }
  
  return null;
}

/**
 * Resource timing analysis
 */
export function analyzeResourceTiming() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const analysis = {
    total: resources.length,
    byType: {} as Record<string, number>,
    slowest: [] as Array<{ name: string; duration: number; size: number }>,
    largestTransfer: [] as Array<{ name: string; size: number }>,
    cacheMisses: 0,
    totalTransferSize: 0,
    totalDecodedSize: 0,
  };
  
  resources.forEach((resource) => {
    // Count by type
    const type = resource.initiatorType;
    analysis.byType[type] = (analysis.byType[type] || 0) + 1;
    
    // Track sizes
    analysis.totalTransferSize += resource.transferSize || 0;
    analysis.totalDecodedSize += resource.decodedBodySize || 0;
    
    // Check cache hits
    if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
      analysis.cacheMisses++;
    }
    
    // Track slowest resources
    const duration = resource.responseEnd - resource.startTime;
    analysis.slowest.push({
      name: resource.name,
      duration,
      size: resource.transferSize || 0,
    });
    
    // Track largest transfers
    analysis.largestTransfer.push({
      name: resource.name,
      size: resource.transferSize || 0,
    });
  });
  
  // Sort and limit results
  analysis.slowest.sort((a, b) => b.duration - a.duration);
  analysis.slowest = analysis.slowest.slice(0, 10);
  
  analysis.largestTransfer.sort((a, b) => b.size - a.size);
  analysis.largestTransfer = analysis.largestTransfer.slice(0, 10);
  
  return analysis;
}

/**
 * Memory usage monitoring (if available)
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  
  return null;
}

/**
 * Network information (if available)
 */
export function getNetworkInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }
  
  return null;
}

/**
 * Create performance mark
 */
export function mark(name: string) {
  if ('performance' in window) {
    performance.mark(name);
  }
}

/**
 * Measure between marks
 */
export function measure(name: string, startMark: string, endMark?: string) {
  if ('performance' in window) {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      const latestMeasure = measures[measures.length - 1];
      
      if (process.env.NODE_ENV === 'development' && latestMeasure) {
        console.log(`Performance measure "${name}":`, latestMeasure.duration.toFixed(2), 'ms');
      }
      
      return latestMeasure?.duration || 0;
    } catch (error) {
      console.error('Performance measurement error:', error);
      return 0;
    }
  }
  
  return 0;
}