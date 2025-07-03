// Extend Window interface for custom properties
export {};

declare global {
  interface Window {
    performanceObserver?: PerformanceObserver;
    largestContentfulPaint?: number;
    React?: any;
  }
}

describe('Performance Tests', () => {
  const performanceThresholds = {
    firstContentfulPaint: 2000, // 2 seconds
    largestContentfulPaint: 3000, // 3 seconds
    timeToInteractive: 4000, // 4 seconds
    totalBlockingTime: 300, // 300ms
    cumulativeLayoutShift: 0.1 // 0.1
  };

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Enable performance observer
        win.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              win.largestContentfulPaint = entry.startTime;
            }
          }
        });
        win.performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    });
  });

  describe('Core Web Vitals', () => {
    it('should meet First Contentful Paint threshold', () => {
      cy.window().then((win) => {
        const fcp = win.performance.getEntriesByName('first-contentful-paint')[0];
        expect(fcp.startTime).to.be.lessThan(performanceThresholds.firstContentfulPaint);
      });
    });

    it('should meet Largest Contentful Paint threshold', () => {
      cy.window().then((win) => {
        cy.wait(5000); // Wait for LCP to stabilize
        expect(win.largestContentfulPaint).to.be.lessThan(performanceThresholds.largestContentfulPaint);
      });
    });

    it('should have minimal Cumulative Layout Shift', () => {
      let cumulativeShift = 0;
      
      cy.window().then((win) => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            cumulativeShift += (entry as any).value;
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Trigger potential layout shifts
        cy.scrollTo('bottom', { duration: 1000 });
        cy.wait(2000);
        
        expect(cumulativeShift).to.be.lessThan(performanceThresholds.cumulativeLayoutShift);
      });
    });
  });

  describe('Page Load Performance', () => {
    it('should load homepage within acceptable time', () => {
      cy.visit('/');
      cy.measurePerformance('homepage');
      
      cy.window().then((win) => {
        const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        expect(navigation.loadEventEnd - navigation.fetchStart).to.be.lessThan(3000);
      });
    });

    it('should load dashboard within acceptable time', () => {
      cy.login('test@example.com', 'password123');
      cy.visit('/dashboard');
      cy.measurePerformance('dashboard');
      
      cy.window().then((win) => {
        const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        expect(navigation.loadEventEnd - navigation.fetchStart).to.be.lessThan(4000);
      });
    });
  });

  describe('API Performance', () => {
    it('should respond to health check quickly', () => {
      const start = Date.now();
      
      cy.request('/api/health').then(() => {
        const duration = Date.now() - start;
        expect(duration).to.be.lessThan(100);
      });
    });

    it('should handle concurrent API requests efficiently', () => {
      const requests = [];
      const start = Date.now();
      
      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        requests.push(cy.apiRequest('GET', '/api/public/services'));
      }
      
      Promise.all(requests).then(() => {
        const duration = Date.now() - start;
        expect(duration).to.be.lessThan(1000); // All requests should complete within 1 second
      });
    });
  });

  describe('Resource Loading', () => {
    it('should lazy load images', () => {
      cy.visit('/');
      
      // Check that below-fold images are not loaded initially
      cy.get('img[loading="lazy"]').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy');
      });
      
      // Scroll to trigger lazy loading
      cy.scrollTo('bottom');
      
      // Verify images are loaded after scrolling
      cy.get('img[loading="lazy"]').each(($img) => {
        cy.wrap($img).should('have.prop', 'complete', true);
      });
    });

    it('should use optimized image formats', () => {
      cy.visit('/');
      
      cy.get('img').each(($img) => {
        const src = $img.attr('src');
        if (src) {
          // Check for modern image formats
          expect(src).to.match(/\.(webp|avif)$|_next\/image/);
        }
      });
    });
  });

  describe('Bundle Size', () => {
    it('should have reasonable JavaScript bundle size', () => {
      cy.intercept('**/*.js', (req) => {
        req.continue((res) => {
          const contentLength = res.headers['content-length'];
          const size = parseInt(Array.isArray(contentLength) ? contentLength[0] : contentLength || '0');
          
          // Main bundle should be under 250KB
          if (req.url.includes('main') || req.url.includes('app')) {
            expect(size).to.be.lessThan(250 * 1024);
          }
          
          // Individual chunks should be under 100KB
          expect(size).to.be.lessThan(100 * 1024);
        });
      });
      
      cy.visit('/');
    });

    it('should use code splitting effectively', () => {
      const loadedChunks = new Set();
      
      cy.intercept('**/*.js', (req) => {
        const url = new URL(req.url);
        loadedChunks.add(url.pathname);
        req.continue();
      });
      
      // Visit homepage
      cy.visit('/');
      const homepageChunks = new Set(loadedChunks);
      
      // Navigate to dashboard
      cy.login('test@example.com', 'password123');
      cy.visit('/dashboard');
      
      // Should load additional chunks for dashboard
      expect(loadedChunks.size).to.be.greaterThan(homepageChunks.size);
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks on navigation', () => {
      cy.window().then((win) => {
        const initialMemory = (win.performance as any).memory?.usedJSHeapSize;
        
        // Navigate through multiple pages
        cy.visit('/');
        cy.visit('/about');
        cy.visit('/services');
        cy.visit('/contact');
        cy.visit('/');
        
        // Force garbage collection if available
        if ((win as any).gc) {
          (win as any).gc();
        }
        
        cy.wait(2000);
        
        const finalMemory = (win.performance as any).memory?.usedJSHeapSize;
        
        if (initialMemory && finalMemory) {
          // Memory should not increase by more than 10MB
          expect(finalMemory - initialMemory).to.be.lessThan(10 * 1024 * 1024);
        }
      });
    });
  });

  describe('Caching', () => {
    it('should cache static assets', () => {
      const cachedResources = new Map();
      
      cy.intercept('**/*', (req) => {
        req.continue((res) => {
          const cacheControl = res.headers['cache-control'];
          const cacheValue = Array.isArray(cacheControl) ? cacheControl[0] : cacheControl;
          if (cacheValue) {
            cachedResources.set(req.url, cacheValue);
          }
        });
      });
      
      cy.visit('/');
      
      cy.wrap(null).then(() => {
        // Check that static assets have appropriate cache headers
        cachedResources.forEach((cacheControl, url) => {
          if (url.includes('_next/static') || url.includes('/images/')) {
            expect(cacheControl).to.include('max-age=31536000'); // 1 year
          }
        });
      });
    });

    it('should use service worker for offline support', () => {
      cy.visit('/');
      
      cy.window().then((win) => {
        if ('serviceWorker' in win.navigator) {
          cy.wrap(win.navigator.serviceWorker.ready).then((registration) => {
            expect(registration).to.exist;
            expect((registration as ServiceWorkerRegistration).active).to.exist;
          });
        }
      });
    });
  });

  describe('Rendering Performance', () => {
    it('should minimize re-renders', () => {
      let renderCount = 0;
      
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // Monkey patch React to count renders
          const originalCreateElement = win.React?.createElement;
          if (originalCreateElement) {
            win.React.createElement = function(...args: any[]) {
              renderCount++;
              return originalCreateElement.apply(this, args);
            };
          }
        }
      });
      
      // Perform some interactions
      cy.get('[data-testid="nav-menu"]').click();
      cy.get('[data-testid="search-input"]').type('test');
      
      // Should have reasonable number of renders
      cy.wrap(null).then(() => {
        expect(renderCount).to.be.lessThan(1000);
      });
    });
  });

  after(() => {
    // Generate performance report
    cy.task('generatePerformanceReport');
  });
});