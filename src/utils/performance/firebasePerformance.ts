import { performance } from '@/lib/firebase/config';
import { trace as firebaseTrace, PerformanceTrace } from 'firebase/performance';

/**
 * Creates a performance trace with attribute value sanitization
 * to prevent Firebase Performance errors with long Tailwind CSS classes
 */
export function createTrace(name: string): PerformanceTrace | null {
  if (!performance) return null;

  try {
    const trace = firebaseTrace(performance, name);

    // Override putAttribute to sanitize long values
    const originalPutAttribute = trace.putAttribute.bind(trace);
    trace.putAttribute = (attrName: string, value: string) => {
      try {
        // Truncate long attribute values to prevent errors (Firebase limit is 100 chars)
        const sanitizedValue = value.length > 100 ? value.substring(0, 97) + '...' : value;
        originalPutAttribute(attrName, sanitizedValue);
      } catch (error) {
        // Silently ignore attribute errors to prevent disrupting the app
        console.debug('Firebase Performance attribute error:', error);
      }
    };

    return trace;
  } catch (error) {
    console.warn('Failed to create Firebase Performance trace:', error);
    return null;
  }
}

/**
 * Disable automatic page load traces to prevent CSS class attribute errors
 */
export function configurePerformanceMonitoring() {
  // Check if Firebase Performance should be completely disabled
  if (process.env.NEXT_PUBLIC_DISABLE_FIREBASE_PERFORMANCE === 'true') {
    console.log('Firebase Performance completely disabled via env variable');
    return;
  }

  if (performance && typeof window !== 'undefined') {
    try {
      // Disable automatic instrumentation to prevent long CSS class errors
      (performance as any).dataCollectionEnabled = false;
      (performance as any).instrumentationEnabled = false;

      // Log that we've disabled automatic instrumentation
      console.debug('Firebase Performance automatic instrumentation disabled');
    } catch (error) {
      console.warn('Failed to configure Firebase Performance:', error);
    }
  }
}

/**
 * Measure a function's performance
 */
export async function measurePerformance<T>(traceName: string, fn: () => Promise<T>): Promise<T> {
  const trace = createTrace(traceName);
  if (!trace) return fn();

  try {
    trace.start();
    const result = await fn();
    trace.stop();
    return result;
  } catch (error) {
    trace.stop();
    throw error;
  }
}
