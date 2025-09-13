// Emergency Firestore Listener Debounce Utility
// Created: Sept 13, 2025 - Production hotfix for listener loops

interface SubscriptionCache {
  [key: string]: {
    unsubscribe: () => void;
    timestamp: number;
    count: number;
  };
}

class ListenerManager {
  private static instance: ListenerManager;
  private subscriptions: SubscriptionCache = {};
  private readonly DEBOUNCE_MS = 1000; // 1 second debounce
  private readonly MAX_SUBSCRIPTIONS = 50; // Safety limit

  static getInstance(): ListenerManager {
    if (!ListenerManager.instance) {
      ListenerManager.instance = new ListenerManager();
    }
    return ListenerManager.instance;
  }

  // Debounced subscription creator
  createSubscription(
    key: string,
    subscriptionFn: () => () => void,
    dependencies: any[]
  ): () => void {
    const depKey = `${key}-${JSON.stringify(dependencies)}`;
    const now = Date.now();

    // Check if we already have this subscription
    const existing = this.subscriptions[depKey];
    if (existing && (now - existing.timestamp) < this.DEBOUNCE_MS) {
      console.warn(`🚨 Firestore listener debounced for ${key}`);
      existing.count++;
      return existing.unsubscribe;
    }

    // Clean up old subscription
    if (existing) {
      existing.unsubscribe();
    }

    // Safety check: limit total subscriptions
    if (Object.keys(this.subscriptions).length >= this.MAX_SUBSCRIPTIONS) {
      console.error('🚨 CRITICAL: Too many Firestore listeners active!');
      this.cleanup();
    }

    // Create new subscription
    const unsubscribe = subscriptionFn();
    this.subscriptions[depKey] = {
      unsubscribe,
      timestamp: now,
      count: 1
    };

    console.log(`✅ Firestore listener created: ${key} (total: ${Object.keys(this.subscriptions).length})`);

    return () => {
      unsubscribe();
      delete this.subscriptions[depKey];
      console.log(`🗑️ Firestore listener cleaned up: ${key}`);
    };
  }

  // Emergency cleanup
  cleanup(): void {
    console.log('🧹 Emergency cleanup of Firestore listeners');
    Object.values(this.subscriptions).forEach(sub => sub.unsubscribe());
    this.subscriptions = {};
  }

  // Get stats for monitoring
  getStats() {
    return {
      totalListeners: Object.keys(this.subscriptions).length,
      listeners: Object.entries(this.subscriptions).map(([key, sub]) => ({
        key,
        age: Date.now() - sub.timestamp,
        accessCount: sub.count
      }))
    };
  }
}

export const listenerManager = ListenerManager.getInstance();

// Hook to use debounced listeners
export function useDebouncedListener(
  key: string,
  subscriptionFn: () => () => void,
  dependencies: any[]
): () => void {
  return listenerManager.createSubscription(key, subscriptionFn, dependencies);
}

// Emergency listener monitoring
if (typeof window !== 'undefined') {
  (window as any).__listenerManager = listenerManager;
  console.log('🔍 Listener manager available at window.__listenerManager');
}