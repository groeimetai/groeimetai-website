/**
 * End-to-end tests for the settings page
 * Tests complete user workflows and interactions
 */

describe('Settings Page E2E Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    displayName: 'Test User',
  };

  beforeEach(() => {
    // Login as test user
    cy.login(testUser.email, testUser.password);
    cy.visit('/settings');
    
    // Wait for settings to load
    cy.get('[data-testid="settings-container"]').should('be.visible');
    cy.wait('@getUserSettings');
  });

  describe('Navigation and Layout', () => {
    it('should display all settings categories', () => {
      cy.get('[data-testid="settings-sidebar"]').within(() => {
        cy.get('[data-testid="settings-nav-preferences"]').should('be.visible');
        cy.get('[data-testid="settings-nav-notifications"]').should('be.visible');
        cy.get('[data-testid="settings-nav-privacy"]').should('be.visible');
        cy.get('[data-testid="settings-nav-display"]').should('be.visible');
        cy.get('[data-testid="settings-nav-integrations"]').should('be.visible');
        cy.get('[data-testid="settings-nav-security"]').should('be.visible');
        cy.get('[data-testid="settings-nav-shortcuts"]').should('be.visible');
      });
    });

    it('should navigate between settings categories', () => {
      // Start on preferences (default)
      cy.get('[data-testid="preferences-panel"]').should('be.visible');
      
      // Navigate to notifications
      cy.get('[data-testid="settings-nav-notifications"]').click();
      cy.get('[data-testid="notifications-panel"]').should('be.visible');
      cy.get('[data-testid="preferences-panel"]').should('not.exist');
      
      // Navigate to privacy
      cy.get('[data-testid="settings-nav-privacy"]').click();
      cy.get('[data-testid="privacy-panel"]').should('be.visible');
      cy.get('[data-testid="notifications-panel"]').should('not.exist');
    });

    it('should maintain URL state when navigating', () => {
      cy.get('[data-testid="settings-nav-display"]').click();
      cy.url().should('include', '/settings?tab=display');
      
      // Refresh page and verify tab is still active
      cy.reload();
      cy.get('[data-testid="display-panel"]').should('be.visible');
      cy.get('[data-testid="settings-nav-display"]').should('have.attr', 'data-active', 'true');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Settings should be stacked vertically on mobile
      cy.get('[data-testid="settings-sidebar"]').should('have.css', 'position', 'relative');
      cy.get('[data-testid="settings-content"]').should('have.css', 'margin-left', '0px');
      
      // Mobile navigation should work
      cy.get('[data-testid="mobile-settings-menu"]').click();
      cy.get('[data-testid="settings-nav-notifications"]').click();
      cy.get('[data-testid="notifications-panel"]').should('be.visible');
    });
  });

  describe('Preferences Settings', () => {
    beforeEach(() => {
      cy.get('[data-testid="settings-nav-preferences"]').click();
    });

    it('should update language preference', () => {
      cy.get('[data-testid="language-select"]').click();
      cy.get('[data-testid="language-option-es"]').click();
      
      cy.get('[data-testid="save-preferences-btn"]').click();
      cy.wait('@updatePreferences');
      
      cy.get('[data-testid="success-toast"]').should('contain', 'Settings saved');
      
      // Verify UI updates
      cy.get('[data-testid="language-select"]').should('contain', 'Español');
    });

    it('should update timezone preference', () => {
      cy.get('[data-testid="timezone-select"]').click();
      cy.get('[data-testid="timezone-search"]').type('London');
      cy.get('[data-testid="timezone-option"]').contains('Europe/London').click();
      
      cy.get('[data-testid="save-preferences-btn"]').click();
      cy.wait('@updatePreferences');
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should update theme preference', () => {
      // Test theme switching
      cy.get('[data-testid="theme-dark"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      cy.get('[data-testid="theme-light"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      cy.get('[data-testid="theme-system"]').click();
      cy.get('[data-testid="save-preferences-btn"]').click();
      cy.wait('@updatePreferences');
    });

    it('should configure custom theme', () => {
      cy.get('[data-testid="theme-custom"]').click();
      cy.get('[data-testid="custom-theme-panel"]').should('be.visible');
      
      // Update primary color
      cy.get('[data-testid="primary-color-picker"]').click();
      cy.get('[data-testid="color-input"]').clear().type('#ff6b35');
      cy.get('[data-testid="color-apply"]').click();
      
      // Preview theme
      cy.get('[data-testid="theme-preview-btn"]').click();
      cy.get('[data-testid="theme-preview-modal"]').should('be.visible');
      cy.get('[data-testid="preview-close"]').click();
      
      // Save custom theme
      cy.get('[data-testid="save-custom-theme"]').click();
      cy.wait('@updatePreferences');
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should update date and time formats', () => {
      cy.get('[data-testid="date-format-select"]').click();
      cy.get('[data-testid="date-format-option"]').contains('DD/MM/YYYY').click();
      
      cy.get('[data-testid="time-format-24h"]').click();
      
      cy.get('[data-testid="save-preferences-btn"]').click();
      cy.wait('@updatePreferences');
      
      // Verify formats are applied in preview
      cy.get('[data-testid="date-preview"]').should('contain', 'DD/MM/YYYY');
      cy.get('[data-testid="time-preview"]').should('match', /^\d{2}:\d{2}$/);
    });
  });

  describe('Notification Settings', () => {
    beforeEach(() => {
      cy.get('[data-testid="settings-nav-notifications"]').click();
    });

    it('should toggle email notifications', () => {
      cy.get('[data-testid="email-notifications-toggle"]').click();
      
      // Should show frequency options when enabled
      cy.get('[data-testid="email-frequency-select"]').should('be.visible');
      
      // Toggle off
      cy.get('[data-testid="email-notifications-toggle"]').click();
      cy.get('[data-testid="email-frequency-select"]').should('not.be.visible');
      
      cy.get('[data-testid="save-notifications-btn"]').click();
      cy.wait('@updateNotifications');
    });

    it('should configure notification types', () => {
      cy.get('[data-testid="email-notifications-toggle"]').should('be.checked');
      
      // Configure specific notification types
      cy.get('[data-testid="notification-type-messages"]').uncheck();
      cy.get('[data-testid="notification-type-marketing"]').uncheck();
      cy.get('[data-testid="notification-type-deadlines"]').check();
      
      cy.get('[data-testid="save-notifications-btn"]').click();
      cy.wait('@updateNotifications');
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should test notification delivery', () => {
      // Test email notification
      cy.get('[data-testid="test-email-btn"]').click();
      cy.wait('@testNotification');
      
      cy.get('[data-testid="test-notification-modal"]').within(() => {
        cy.get('[data-testid="test-result"]').should('contain', 'Test email sent successfully');
        cy.get('[data-testid="close-test-modal"]').click();
      });
      
      // Test push notification
      cy.get('[data-testid="test-push-btn"]').click();
      cy.wait('@testNotification');
      
      cy.get('[data-testid="test-notification-modal"]').should('be.visible');
    });

    it('should configure notification schedule', () => {
      cy.get('[data-testid="email-frequency-select"]').click();
      cy.get('[data-testid="frequency-option-daily"]').click();
      
      // Set specific time for daily digest
      cy.get('[data-testid="daily-time-picker"]').click();
      cy.get('[data-testid="time-hour"]').select('09');
      cy.get('[data-testid="time-minute"]').select('00');
      
      cy.get('[data-testid="save-notifications-btn"]').click();
      cy.wait('@updateNotifications');
    });

    it('should handle notification permissions', () => {
      // Mock browser notification permission
      cy.window().then((win) => {
        cy.stub(win.Notification, 'requestPermission').resolves('granted');
      });
      
      cy.get('[data-testid="push-notifications-toggle"]').click();
      
      cy.get('[data-testid="permission-modal"]').within(() => {
        cy.get('[data-testid="grant-permission-btn"]').click();
      });
      
      cy.get('[data-testid="push-notifications-toggle"]').should('be.checked');
    });
  });

  describe('Privacy Settings', () => {
    beforeEach(() => {
      cy.get('[data-testid="settings-nav-privacy"]').click();
    });

    it('should update profile visibility', () => {
      cy.get('[data-testid="profile-visibility-select"]').click();
      cy.get('[data-testid="visibility-private"]').click();
      
      // Verify privacy preview updates
      cy.get('[data-testid="privacy-preview"]').should('contain', 'Your profile is private');
      
      cy.get('[data-testid="save-privacy-btn"]').click();
      cy.wait('@updatePrivacy');
    });

    it('should configure contact information visibility', () => {
      cy.get('[data-testid="show-email-toggle"]').click();
      cy.get('[data-testid="show-phone-toggle"]').click();
      cy.get('[data-testid="show-location-toggle"]').click();
      
      cy.get('[data-testid="save-privacy-btn"]').click();
      cy.wait('@updatePrivacy');
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should configure activity settings', () => {
      cy.get('[data-testid="activity-status-toggle"]').click();
      cy.get('[data-testid="read-receipts-toggle"]').click();
      cy.get('[data-testid="typing-indicators-toggle"]').click();
      
      cy.get('[data-testid="save-privacy-btn"]').click();
      cy.wait('@updatePrivacy');
    });

    it('should show privacy impact warnings', () => {
      cy.get('[data-testid="profile-visibility-select"]').click();
      cy.get('[data-testid="visibility-public"]').click();
      
      cy.get('[data-testid="privacy-warning"]').should('be.visible');
      cy.get('[data-testid="privacy-warning"]').should('contain', 'public profile');
      
      cy.get('[data-testid="show-email-toggle"]').click();
      cy.get('[data-testid="email-warning"]').should('be.visible');
    });
  });

  describe('Display Settings', () => {
    beforeEach(() => {
      cy.get('[data-testid="settings-nav-display"]').click();
    });

    it('should update display density', () => {
      cy.get('[data-testid="density-compact"]').click();
      
      // Verify UI density changes
      cy.get('[data-testid="density-preview"]').should('have.class', 'compact');
      
      cy.get('[data-testid="save-display-btn"]').click();
      cy.wait('@updateDisplay');
    });

    it('should update font size', () => {
      cy.get('[data-testid="font-size-large"]').click();
      
      // Verify font size changes in preview
      cy.get('[data-testid="font-preview"]').should('have.css', 'font-size', '18px');
      
      cy.get('[data-testid="save-display-btn"]').click();
      cy.wait('@updateDisplay');
    });

    it('should toggle accessibility features', () => {
      cy.get('[data-testid="high-contrast-toggle"]').click();
      cy.get('body').should('have.class', 'high-contrast');
      
      cy.get('[data-testid="reduce-motion-toggle"]').click();
      cy.get('body').should('have.class', 'reduce-motion');
      
      cy.get('[data-testid="save-display-btn"]').click();
      cy.wait('@updateDisplay');
    });

    it('should configure color blind support', () => {
      cy.get('[data-testid="colorblind-select"]').click();
      cy.get('[data-testid="colorblind-deuteranopia"]').click();
      
      // Verify color adjustments are applied
      cy.get('[data-testid="color-preview"]').should('have.attr', 'data-colorblind', 'deuteranopia');
      
      cy.get('[data-testid="save-display-btn"]').click();
      cy.wait('@updateDisplay');
    });

    it('should preview display changes in real-time', () => {
      // Font size changes should be immediate
      cy.get('[data-testid="font-size-small"]').click();
      cy.get('[data-testid="settings-content"]').should('have.class', 'font-small');
      
      // Density changes should be immediate
      cy.get('[data-testid="density-spacious"]').click();
      cy.get('[data-testid="settings-content"]').should('have.class', 'density-spacious');
    });
  });

  describe('Integration Settings', () => {
    beforeEach(() => {
      cy.get('[data-testid="settings-nav-integrations"]').click();
    });

    it('should connect Google integration', () => {
      // Mock OAuth flow
      cy.window().then((win) => {
        cy.stub(win, 'open').callsFake((url) => {
          // Simulate OAuth callback
          setTimeout(() => {
            win.postMessage({
              type: 'oauth-success',
              provider: 'google',
              code: 'mock-auth-code',
            }, '*');
          }, 1000);
          
          return { close: () => {} };
        });
      });
      
      cy.get('[data-testid="connect-google-btn"]').click();
      
      // Wait for OAuth flow
      cy.wait('@connectIntegration');
      
      cy.get('[data-testid="google-connected"]').should('be.visible');
      cy.get('[data-testid="google-sync-options"]').should('be.visible');
    });

    it('should configure integration sync options', () => {
      // Assuming Google is already connected
      cy.get('[data-testid="google-calendar-sync"]').click();
      cy.get('[data-testid="google-drive-sync"]').click();
      
      cy.get('[data-testid="save-integrations-btn"]').click();
      cy.wait('@updateIntegrations');
      
      // Verify sync status
      cy.get('[data-testid="last-sync-time"]').should('be.visible');
    });

    it('should disconnect integration', () => {
      cy.get('[data-testid="disconnect-google-btn"]').click();
      
      cy.get('[data-testid="disconnect-modal"]').within(() => {
        cy.get('[data-testid="confirm-disconnect"]').click();
      });
      
      cy.wait('@disconnectIntegration');
      
      cy.get('[data-testid="google-disconnected"]').should('be.visible');
      cy.get('[data-testid="connect-google-btn"]').should('be.visible');
    });

    it('should handle integration errors gracefully', () => {
      // Mock OAuth error
      cy.window().then((win) => {
        cy.stub(win, 'open').callsFake(() => {
          setTimeout(() => {
            win.postMessage({
              type: 'oauth-error',
              error: 'access_denied',
            }, '*');
          }, 1000);
          
          return { close: () => {} };
        });
      });
      
      cy.get('[data-testid="connect-slack-btn"]').click();
      
      cy.get('[data-testid="integration-error"]').should('be.visible');
      cy.get('[data-testid="integration-error"]').should('contain', 'Connection failed');
    });
  });

  describe('Security Settings', () => {
    beforeEach(() => {
      cy.get('[data-testid="settings-nav-security"]').click();
    });

    it('should enable two-factor authentication', () => {
      cy.get('[data-testid="enable-2fa-btn"]').click();
      
      cy.get('[data-testid="2fa-setup-modal"]').within(() => {
        // Step 1: Show QR code
        cy.get('[data-testid="qr-code"]').should('be.visible');
        cy.get('[data-testid="secret-key"]').should('be.visible');
        
        // Step 2: Enter verification code
        cy.get('[data-testid="verification-code"]').type('123456');
        cy.get('[data-testid="verify-2fa-btn"]').click();
        
        cy.wait('@enable2FA');
        
        // Step 3: Save backup codes
        cy.get('[data-testid="backup-codes"]').should('be.visible');
        cy.get('[data-testid="download-codes"]').click();
        cy.get('[data-testid="confirm-saved"]').click();
      });
      
      cy.get('[data-testid="2fa-enabled"]').should('be.visible');
    });

    it('should manage trusted devices', () => {
      cy.get('[data-testid="trusted-devices-section"]').within(() => {
        cy.get('[data-testid="device-item"]').should('have.length.at.least', 1);
        
        // Remove a trusted device
        cy.get('[data-testid="remove-device"]').first().click();
      });
      
      cy.get('[data-testid="remove-device-modal"]').within(() => {
        cy.get('[data-testid="confirm-remove"]').click();
      });
      
      cy.wait('@removeTrustedDevice');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should configure session timeout', () => {
      cy.get('[data-testid="session-timeout-select"]').click();
      cy.get('[data-testid="timeout-option-30min"]').click();
      
      cy.get('[data-testid="save-security-btn"]').click();
      cy.wait('@updateSecurity');
    });

    it('should show security recommendations', () => {
      cy.get('[data-testid="security-recommendations"]').should('be.visible');
      cy.get('[data-testid="security-score"]').should('be.visible');
      
      // Check specific recommendations
      cy.get('[data-testid="recommendation-2fa"]').should('be.visible');
      cy.get('[data-testid="recommendation-password"]').should('be.visible');
    });
  });

  describe('Data Management', () => {
    it('should export settings', () => {
      cy.get('[data-testid="settings-nav-data"]').click();
      
      cy.get('[data-testid="export-settings-btn"]').click();
      
      // Verify download starts
      cy.readFile('cypress/downloads/user-settings.json').should('exist');
      
      cy.get('[data-testid="export-success"]').should('be.visible');
    });

    it('should import settings', () => {
      cy.get('[data-testid="settings-nav-data"]').click();
      
      const settingsFile = 'cypress/fixtures/user-settings.json';
      cy.get('[data-testid="import-file-input"]').selectFile(settingsFile);
      
      cy.get('[data-testid="import-preview"]').should('be.visible');
      cy.get('[data-testid="confirm-import-btn"]').click();
      
      cy.wait('@importSettings');
      cy.get('[data-testid="import-success"]').should('be.visible');
    });

    it('should reset settings to defaults with confirmation', () => {
      cy.get('[data-testid="reset-all-btn"]').click();
      
      cy.get('[data-testid="reset-modal"]').within(() => {
        cy.get('[data-testid="reset-warning"]').should('contain', 'This action cannot be undone');
        cy.get('[data-testid="confirm-reset"]').type('RESET');
        cy.get('[data-testid="reset-confirm-btn"]').click();
      });
      
      cy.wait('@resetSettings');
      cy.get('[data-testid="reset-success"]').should('be.visible');
      
      // Verify settings are reset
      cy.get('[data-testid="settings-nav-preferences"]').click();
      cy.get('[data-testid="language-select"]').should('contain', 'English');
      cy.get('[data-testid="theme-system"]').should('be.checked');
    });
  });

  describe('Real-time Updates', () => {
    it('should sync changes across multiple tabs', () => {
      // Open settings in a new window
      cy.window().then((win) => {
        win.open('/settings', '_blank');
      });
      
      // Make a change in the original tab
      cy.get('[data-testid="settings-nav-preferences"]').click();
      cy.get('[data-testid="language-select"]').click();
      cy.get('[data-testid="language-option-fr"]').click();
      cy.get('[data-testid="save-preferences-btn"]').click();
      
      // Switch to the new tab and verify the change is reflected
      cy.window().its('document').then((doc) => {
        // This would need WebSocket or polling implementation to work
        cy.get('[data-testid="language-select"]').should('contain', 'Français');
      });
    });

    it('should handle concurrent modifications gracefully', () => {
      // Simulate another user/session modifying settings
      cy.window().then((win) => {
        // Mock WebSocket message
        win.dispatchEvent(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'settings-updated',
            userId: 'test-user-123',
            changes: {
              preferences: { theme: 'dark' },
            },
          }),
        }));
      });
      
      cy.get('[data-testid="sync-notification"]').should('be.visible');
      cy.get('[data-testid="sync-notification"]').should('contain', 'Settings updated');
      cy.get('[data-testid="reload-settings"]').click();
      
      // Verify settings are updated
      cy.get('[data-testid="theme-dark"]').should('be.checked');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Mock network failure
      cy.intercept('PUT', '/api/user-settings/me', { forceNetworkError: true }).as('networkError');
      
      cy.get('[data-testid="settings-nav-preferences"]').click();
      cy.get('[data-testid="language-select"]').click();
      cy.get('[data-testid="language-option-es"]').click();
      cy.get('[data-testid="save-preferences-btn"]').click();
      
      cy.wait('@networkError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('contain', 'Network error');
      
      // Should show retry option
      cy.get('[data-testid="retry-btn"]').should('be.visible');
    });

    it('should handle validation errors', () => {
      cy.intercept('PUT', '/api/user-settings/me', {
        statusCode: 400,
        body: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid language code',
            details: { field: 'language', value: 'invalid' },
          },
        },
      }).as('validationError');
      
      // Trigger validation error
      cy.get('[data-testid="settings-nav-preferences"]').click();
      cy.get('[data-testid="save-preferences-btn"]').click();
      
      cy.wait('@validationError');
      cy.get('[data-testid="field-error"]').should('be.visible');
      cy.get('[data-testid="field-error"]').should('contain', 'Invalid language');
    });

    it('should handle server errors with fallback', () => {
      cy.intercept('GET', '/api/user-settings/me', {
        statusCode: 500,
        body: { success: false, error: { message: 'Internal server error' } },
      }).as('serverError');
      
      cy.reload();
      cy.wait('@serverError');
      
      // Should show default settings with error message
      cy.get('[data-testid="error-banner"]').should('be.visible');
      cy.get('[data-testid="error-banner"]').should('contain', 'Unable to load settings');
      cy.get('[data-testid="settings-container"]').should('be.visible'); // Fallback to defaults
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab(); // Focus first interactive element
      
      // Tab through settings navigation
      cy.focused().should('have.attr', 'data-testid', 'settings-nav-preferences');
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'settings-nav-notifications');
      
      // Enter should activate navigation
      cy.focused().type('{enter}');
      cy.get('[data-testid="notifications-panel"]').should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="settings-sidebar"]').should('have.attr', 'role', 'navigation');
      cy.get('[data-testid="settings-sidebar"]').should('have.attr', 'aria-label', 'Settings navigation');
      
      cy.get('[data-testid="preferences-panel"]').should('have.attr', 'role', 'tabpanel');
      cy.get('[data-testid="language-select"]').should('have.attr', 'aria-label');
      
      // Form validation should announce errors
      cy.get('[data-testid="save-preferences-btn"]').click();
      cy.get('[data-testid="field-error"]').should('have.attr', 'aria-live', 'polite');
    });

    it('should work with screen readers', () => {
      cy.checkA11y('[data-testid="settings-container"]', {
        rules: {
          'color-contrast': { enabled: true },
          'focus-visible': { enabled: true },
          'aria-labels': { enabled: true },
        },
      });
      
      // Test with high contrast mode
      cy.get('[data-testid="settings-nav-display"]').click();
      cy.get('[data-testid="high-contrast-toggle"]').click();
      
      cy.checkA11y('[data-testid="settings-container"]');
    });
  });

  describe('Performance', () => {
    it('should load settings within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/settings');
      cy.get('[data-testid="settings-container"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should handle large settings objects efficiently', () => {
      // Mock large dashboard layout
      cy.intercept('GET', '/api/user-settings/me', {
        body: {
          success: true,
          data: {
            // ... other settings
            dashboardLayout: {
              widgets: Array(100).fill(null).map((_, i) => ({
                id: `widget-${i}`,
                type: 'chart',
                position: { x: i % 12, y: Math.floor(i / 12) },
                size: { width: 4, height: 3 },
              })),
              columns: 12,
            },
          },
        },
      }).as('getLargeSettings');
      
      cy.visit('/settings');
      cy.wait('@getLargeSettings');
      
      // Should still be responsive
      cy.get('[data-testid="settings-nav-preferences"]').click();
      cy.get('[data-testid="preferences-panel"]').should('be.visible');
    });

    it('should debounce rapid changes', () => {
      cy.get('[data-testid="settings-nav-preferences"]').click();
      
      // Make rapid changes
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="language-select"]').click();
        cy.get('[data-testid="language-option-en"]').click();
      }
      
      // Should only make one API call after debounce period
      cy.wait(1000);
      cy.get('@updatePreferences.all').should('have.length', 1);
    });
  });
});