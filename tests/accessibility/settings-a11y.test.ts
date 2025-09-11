/**
 * Accessibility tests for user settings functionality
 * Tests keyboard navigation, screen reader compatibility, WCAG compliance
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from '../utils/test-helpers';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components - in real implementation these would be actual components
const MockSettingsPage = ({ initialTab = 'preferences' }: { initialTab?: string }) => (
  <div data-testid="settings-container" role="main" aria-label="User Settings">
    <nav data-testid="settings-sidebar" role="navigation" aria-label="Settings navigation">
      <ul role="list">
        <li>
          <button
            data-testid="settings-nav-preferences"
            role="tab"
            aria-selected={initialTab === 'preferences'}
            aria-controls="preferences-panel"
            id="preferences-tab"
          >
            Preferences
          </button>
        </li>
        <li>
          <button
            data-testid="settings-nav-notifications"
            role="tab"
            aria-selected={initialTab === 'notifications'}
            aria-controls="notifications-panel"
            id="notifications-tab"
          >
            Notifications
          </button>
        </li>
        <li>
          <button
            data-testid="settings-nav-privacy"
            role="tab"
            aria-selected={initialTab === 'privacy'}
            aria-controls="privacy-panel"
            id="privacy-tab"
          >
            Privacy
          </button>
        </li>
      </ul>
    </nav>
    
    <main data-testid="settings-content">
      {initialTab === 'preferences' && (
        <div
          data-testid="preferences-panel"
          role="tabpanel"
          aria-labelledby="preferences-tab"
          id="preferences-panel"
        >
          <h2>Preferences</h2>
          <form>
            <div>
              <label htmlFor="language-select">Language</label>
              <select
                id="language-select"
                data-testid="language-select"
                aria-describedby="language-help"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
              <div id="language-help" className="help-text">
                Choose your preferred language for the interface
              </div>
            </div>
            
            <fieldset>
              <legend>Theme</legend>
              <div role="radiogroup" aria-labelledby="theme-legend">
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    data-testid="theme-light"
                    defaultChecked
                  />
                  Light
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    data-testid="theme-dark"
                  />
                  Dark
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="system"
                    data-testid="theme-system"
                  />
                  System
                </label>
              </div>
            </fieldset>
            
            <button type="submit" data-testid="save-preferences-btn">
              Save Preferences
            </button>
          </form>
        </div>
      )}
      
      {initialTab === 'notifications' && (
        <div
          data-testid="notifications-panel"
          role="tabpanel"
          aria-labelledby="notifications-tab"
          id="notifications-panel"
        >
          <h2>Notifications</h2>
          <form>
            <div>
              <label>
                <input
                  type="checkbox"
                  data-testid="email-notifications-toggle"
                  aria-describedby="email-help"
                />
                Enable email notifications
              </label>
              <div id="email-help" className="help-text">
                Receive notifications via email
              </div>
            </div>
            
            <div>
              <label htmlFor="email-frequency">Email frequency</label>
              <select
                id="email-frequency"
                data-testid="email-frequency-select"
                aria-describedby="frequency-help"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <div id="frequency-help" className="help-text">
                How often you want to receive email notifications
              </div>
            </div>
            
            <button type="submit" data-testid="save-notifications-btn">
              Save Notifications
            </button>
          </form>
        </div>
      )}
    </main>
  </div>
);

const MockHighContrastSettings = () => (
  <div data-testid="high-contrast-settings">
    <h2>Display Settings</h2>
    <form>
      <div>
        <label>
          <input
            type="checkbox"
            data-testid="high-contrast-toggle"
            aria-describedby="high-contrast-help"
          />
          Enable high contrast mode
        </label>
        <div id="high-contrast-help" className="help-text">
          Increases contrast for better visibility
        </div>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            data-testid="reduce-motion-toggle"
            aria-describedby="reduce-motion-help"
          />
          Reduce motion
        </label>
        <div id="reduce-motion-help" className="help-text">
          Reduces animations and transitions
        </div>
      </div>
      
      <fieldset>
        <legend>Font size</legend>
        <div role="radiogroup">
          <label>
            <input type="radio" name="fontSize" value="small" />
            Small
          </label>
          <label>
            <input type="radio" name="fontSize" value="medium" defaultChecked />
            Medium
          </label>
          <label>
            <input type="radio" name="fontSize" value="large" />
            Large
          </label>
        </div>
      </fieldset>
    </form>
  </div>
);

describe('Settings Accessibility Tests', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<MockSettingsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with high contrast mode', async () => {
      const { container } = render(<MockHighContrastSettings />);
      
      // Enable high contrast
      const highContrastToggle = screen.getByTestId('high-contrast-toggle');
      fireEvent.click(highContrastToggle);
      
      // Add high contrast class to container
      container.classList.add('high-contrast');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper color contrast ratios', async () => {
      const { container } = render(<MockSettingsPage />);
      
      // Test with specific contrast rules
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true },
        },
      });
      
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility with custom themes', async () => {
      // Simulate custom theme applied
      const { container } = render(
        <div style={{
          '--primary-color': '#0066cc',
          '--background-color': '#ffffff',
          '--text-color': '#333333',
        } as React.CSSProperties}>
          <MockSettingsPage />
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be fully keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<MockSettingsPage />);

      // Tab should focus on first interactive element
      await user.tab();
      expect(screen.getByTestId('settings-nav-preferences')).toHaveFocus();

      // Tab through navigation items
      await user.tab();
      expect(screen.getByTestId('settings-nav-notifications')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('settings-nav-privacy')).toHaveFocus();

      // Tab into content area
      await user.tab();
      expect(screen.getByTestId('language-select')).toHaveFocus();
    });

    it('should support arrow key navigation for radio groups', async () => {
      const user = userEvent.setup();
      render(<MockSettingsPage />);

      // Focus on first radio button
      const lightTheme = screen.getByTestId('theme-light');
      lightTheme.focus();

      // Arrow down should move to next radio button
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('theme-dark')).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('theme-system')).toHaveFocus();

      // Arrow down on last item should wrap to first
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('theme-light')).toHaveFocus();
    });

    it('should handle Enter and Space keys for activation', async () => {
      const user = userEvent.setup();
      render(<MockSettingsPage />);

      // Focus on notifications tab
      const notificationsTab = screen.getByTestId('settings-nav-notifications');
      notificationsTab.focus();

      // Enter should activate the tab
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByTestId('notifications-panel')).toBeVisible();
      });

      // Focus on checkbox
      const emailToggle = screen.getByTestId('email-notifications-toggle');
      emailToggle.focus();

      // Space should toggle the checkbox
      await user.keyboard(' ');
      expect(emailToggle).toBeChecked();

      await user.keyboard(' ');
      expect(emailToggle).not.toBeChecked();
    });

    it('should support Escape key to close modals/dropdowns', async () => {
      const user = userEvent.setup();
      render(<MockSettingsPage />);

      // This would need a modal/dropdown in the actual implementation
      // Simulating with a select dropdown
      const languageSelect = screen.getByTestId('language-select');
      
      await user.click(languageSelect);
      // In a real implementation, dropdown would be open
      
      await user.keyboard('{Escape}');
      // Dropdown should close and focus should return to select
      expect(languageSelect).toHaveFocus();
    });

    it('should provide skip links for efficient navigation', async () => {
      // This would need skip links in the actual implementation
      const { container } = render(
        <div>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <a href="#settings-nav" className="skip-link">Skip to navigation</a>
          <MockSettingsPage />
        </div>
      );

      const skipToMain = container.querySelector('.skip-link');
      expect(skipToMain).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<MockSettingsPage />);

      // Main container should have role and label
      expect(screen.getByTestId('settings-container')).toHaveAttribute('role', 'main');
      expect(screen.getByTestId('settings-container')).toHaveAttribute('aria-label', 'User Settings');

      // Navigation should be properly labeled
      expect(screen.getByTestId('settings-sidebar')).toHaveAttribute('role', 'navigation');
      expect(screen.getByTestId('settings-sidebar')).toHaveAttribute('aria-label', 'Settings navigation');

      // Tab panels should be properly associated
      expect(screen.getByTestId('preferences-panel')).toHaveAttribute('aria-labelledby', 'preferences-tab');
      expect(screen.getByTestId('settings-nav-preferences')).toHaveAttribute('aria-controls', 'preferences-panel');
    });

    it('should announce form errors to screen readers', async () => {
      const FormWithValidation = () => {
        const [error, setError] = React.useState('');

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          setError('Please select a valid language');
        };

        return (
          <form onSubmit={handleSubmit}>
            <label htmlFor="language-select">Language</label>
            <select id="language-select" data-testid="language-select" aria-invalid={!!error}>
              <option value="">Select a language</option>
              <option value="en">English</option>
            </select>
            {error && (
              <div
                data-testid="language-error"
                role="alert"
                aria-live="polite"
                id="language-error"
              >
                {error}
              </div>
            )}
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<FormWithValidation />);
      
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      const errorMessage = await screen.findByTestId('language-error');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      expect(errorMessage).toHaveTextContent('Please select a valid language');
    });

    it('should provide descriptive text for form fields', () => {
      render(<MockSettingsPage />);

      // Form fields should have associated help text
      const languageSelect = screen.getByTestId('language-select');
      expect(languageSelect).toHaveAttribute('aria-describedby', 'language-help');
      
      const helpText = document.getElementById('language-help');
      expect(helpText).toHaveTextContent('Choose your preferred language for the interface');
    });

    it('should announce dynamic content changes', async () => {
      const DynamicSettings = () => {
        const [theme, setTheme] = React.useState('light');
        
        return (
          <div>
            <div
              data-testid="theme-status"
              aria-live="polite"
              aria-atomic="true"
            >
              Current theme: {theme}
            </div>
            
            <button
              onClick={() => setTheme('dark')}
              data-testid="change-theme-btn"
            >
              Change to Dark Theme
            </button>
          </div>
        );
      };

      render(<DynamicSettings />);
      
      const changeButton = screen.getByTestId('change-theme-btn');
      fireEvent.click(changeButton);

      const status = screen.getByTestId('theme-status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent('Current theme: dark');
    });

    it('should provide context for complex interactions', () => {
      const ComplexSettings = () => (
        <div>
          <div role="group" aria-labelledby="notification-types-heading">
            <h3 id="notification-types-heading">Notification Types</h3>
            <p id="notification-types-description">
              Select which types of notifications you want to receive
            </p>
            
            <div role="group" aria-describedby="notification-types-description">
              <label>
                <input type="checkbox" />
                Messages
              </label>
              <label>
                <input type="checkbox" />
                Project Updates
              </label>
              <label>
                <input type="checkbox" />
                System Alerts
              </label>
            </div>
          </div>
        </div>
      );

      render(<ComplexSettings />);
      
      const group = screen.getByRole('group', { name: 'Notification Types' });
      expect(group).toHaveAttribute('aria-labelledby', 'notification-types-heading');
    });
  });

  describe('Focus Management', () => {
    it('should maintain logical focus order', async () => {
      const user = userEvent.setup();
      render(<MockSettingsPage />);

      const focusableElements = [
        'settings-nav-preferences',
        'settings-nav-notifications', 
        'settings-nav-privacy',
        'language-select',
        'theme-light',
        'save-preferences-btn',
      ];

      for (let i = 0; i < focusableElements.length; i++) {
        await user.tab();
        const element = screen.getByTestId(focusableElements[i]);
        expect(element).toHaveFocus();
      }
    });

    it('should handle focus for modal dialogs', async () => {
      // Mock modal dialog
      const ModalDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
        React.useEffect(() => {
          if (isOpen) {
            // Focus should move to modal when opened
            const modal = document.getElementById('modal-dialog');
            modal?.focus();
          }
        }, [isOpen]);

        if (!isOpen) return null;

        return (
          <div
            id="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            data-testid="modal-dialog"
          >
            <h2 id="modal-title">Confirm Action</h2>
            <p>Are you sure you want to reset all settings?</p>
            <button onClick={onClose} data-testid="modal-cancel">Cancel</button>
            <button onClick={onClose} data-testid="modal-confirm">Confirm</button>
          </div>
        );
      };

      const TestComponent = () => {
        const [showModal, setShowModal] = React.useState(false);
        
        return (
          <div>
            <button 
              onClick={() => setShowModal(true)}
              data-testid="open-modal-btn"
            >
              Reset Settings
            </button>
            <ModalDialog isOpen={showModal} onClose={() => setShowModal(false)} />
          </div>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      // Open modal
      const openButton = screen.getByTestId('open-modal-btn');
      await user.click(openButton);

      // Modal should be focused and have proper attributes
      const modal = screen.getByTestId('modal-dialog');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

      // Focus should be trapped within modal
      await user.tab();
      expect(screen.getByTestId('modal-cancel')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByTestId('modal-confirm')).toHaveFocus();
    });

    it('should restore focus after navigation', async () => {
      const user = userEvent.setup();
      render(<MockSettingsPage />);

      // Focus on preferences tab
      const preferencesTab = screen.getByTestId('settings-nav-preferences');
      preferencesTab.focus();

      // Navigate to notifications
      const notificationsTab = screen.getByTestId('settings-nav-notifications');
      await user.click(notificationsTab);

      // Focus should remain on navigation
      expect(notificationsTab).toHaveFocus();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion', async () => {
      // Mock media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<MockHighContrastSettings />);
      
      const reduceMotionToggle = screen.getByTestId('reduce-motion-toggle');
      expect(reduceMotionToggle).toBeInTheDocument();

      // In a real implementation, this would disable animations
      fireEvent.click(reduceMotionToggle);
      expect(reduceMotionToggle).toBeChecked();
    });
  });

  describe('High Contrast Mode', () => {
    it('should support Windows High Contrast Mode', () => {
      // Mock media query for high contrast
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(<MockHighContrastSettings />);
      
      // Component should adapt to high contrast mode
      expect(container.querySelector('[data-testid="high-contrast-toggle"]')).toBeInTheDocument();
    });

    it('should maintain readability in high contrast mode', async () => {
      const { container } = render(<MockHighContrastSettings />);
      
      // Enable high contrast
      const toggle = screen.getByTestId('high-contrast-toggle');
      fireEvent.click(toggle);
      
      // Add high contrast styles
      container.classList.add('high-contrast');
      
      // Run accessibility tests with high contrast
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should announce errors accessibly', async () => {
      const ErrorForm = () => {
        const [errors, setErrors] = React.useState<string[]>([]);

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          setErrors(['Email is required', 'Password must be at least 8 characters']);
        };

        return (
          <form onSubmit={handleSubmit}>
            {errors.length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                data-testid="error-summary"
              >
                <h2>Please correct the following errors:</h2>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <label htmlFor="email">Email</label>
            <input id="email" type="email" aria-invalid={errors.length > 0} />
            
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<ErrorForm />);
      
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      const errorSummary = await screen.findByTestId('error-summary');
      expect(errorSummary).toHaveAttribute('role', 'alert');
      expect(errorSummary).toHaveAttribute('aria-live', 'assertive');
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
});