/// <reference types="cypress" />

// Custom commands for authentication
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/auth/login');
  });
});

Cypress.Commands.add('loginWithGoogle', () => {
  // Mock Google OAuth flow
  cy.intercept('GET', '/api/auth/providers', {
    statusCode: 200,
    body: { google: true, linkedin: true },
  });

  cy.intercept('POST', '/api/auth/callback/google', {
    statusCode: 200,
    body: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'test-jwt-token',
    },
  });

  cy.visit('/auth/login');
  cy.get('[data-testid="google-login-button"]').click();
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/');
});

// Custom commands for API testing
Cypress.Commands.add('apiRequest', (method: string, url: string, options?: any) => {
  return cy.getCookie('auth-token').then((cookie) => {
    return cy.request({
      method,
      url,
      headers: {
        Authorization: cookie ? `Bearer ${cookie.value}` : undefined,
        'X-CSRF-Token': Cypress.env('CSRF_TOKEN'),
        ...options?.headers,
      },
      ...options,
    });
  });
});

// Custom commands for accessibility testing
Cypress.Commands.add('checkA11y', (context?: any, options?: any) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Custom commands for performance testing
Cypress.Commands.add('measurePerformance', (name: string) => {
  cy.window().then((win) => {
    const performance = win.performance;
    const navigationTiming = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    const metrics = {
      name,
      domContentLoaded:
        navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
      loadComplete: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint:
        performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      totalTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
    };

    cy.task('logPerformance', metrics);
  });
});

// Custom commands for visual regression testing
Cypress.Commands.add('compareSnapshot', (name: string, options?: any) => {
  cy.screenshot(name, {
    capture: 'viewport',
    overwrite: true,
    ...options,
  });
});

// Custom commands for data seeding
Cypress.Commands.add('seedDatabase', (data: any) => {
  cy.task('seedDatabase', data);
});

Cypress.Commands.add('cleanDatabase', () => {
  cy.task('cleanDatabase');
});

// Custom commands for waiting
Cypress.Commands.add('waitForApi', (alias: string, timeout = 30000) => {
  cy.intercept('GET', '/api/health', { statusCode: 200 }).as('health');
  cy.wait('@health', { timeout });
  cy.wait(alias, { timeout });
});

// Custom commands for form testing
Cypress.Commands.add('fillForm', (formData: Record<string, any>) => {
  Object.entries(formData).forEach(([field, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        cy.get(`[name="${field}"]`).check();
      } else {
        cy.get(`[name="${field}"]`).uncheck();
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      cy.get(`[name="${field}"]`).clear().type(value.toString());
    }
  });
});

// Type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginWithGoogle(): Chainable<void>;
      logout(): Chainable<void>;
      apiRequest(method: string, url: string, options?: any): Chainable<Response<any>>;
      checkA11y(context?: any, options?: any): Chainable<void>;
      measurePerformance(name: string): Chainable<void>;
      compareSnapshot(name: string, options?: any): Chainable<void>;
      seedDatabase(data: any): Chainable<void>;
      cleanDatabase(): Chainable<void>;
      waitForApi(alias: string, timeout?: number): Chainable<void>;
      fillForm(formData: Record<string, any>): Chainable<void>;
    }
  }
}

export {};
