describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login', () => {
    it('should display login form', () => {
      cy.visit('/auth/login');
      cy.get('form[data-testid="login-form"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/auth/login');

      // Submit empty form
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required');

      // Invalid email format
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format');
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
          token: 'mock-jwt-token',
        },
      }).as('login');

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('contain', 'Test User');
    });

    it('should handle login errors', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          error: 'Invalid credentials',
        },
      }).as('loginError');

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginError');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
      cy.url().should('include', '/auth/login');
    });

    it('should redirect to requested page after login', () => {
      cy.visit('/dashboard', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login?redirect=%2Fdashboard');

      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: '123', email: 'test@example.com' },
          token: 'mock-jwt-token',
        },
      });

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/dashboard');
    });

    it('should handle rate limiting', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 429,
        headers: {
          'Retry-After': '60',
        },
        body: {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60,
        },
      }).as('rateLimited');

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@rateLimited');
      cy.get('[data-testid="error-message"]').should('contain', 'Rate limit exceeded');
    });
  });

  describe('OAuth Login', () => {
    it('should display OAuth login buttons', () => {
      cy.visit('/auth/login');
      cy.get('[data-testid="google-login-button"]').should('be.visible');
      cy.get('[data-testid="linkedin-login-button"]').should('be.visible');
    });

    it('should handle Google OAuth flow', () => {
      cy.intercept('GET', '/api/auth/oauth/google', {
        statusCode: 200,
        body: {
          authUrl: 'https://accounts.google.com/oauth/authorize?...',
        },
      }).as('googleAuth');

      cy.visit('/auth/login');
      cy.get('[data-testid="google-login-button"]').click();
      cy.wait('@googleAuth');

      // Verify redirect to Google (in real test, we'd mock the entire flow)
    });
  });

  describe('Registration', () => {
    it('should display registration form', () => {
      cy.visit('/auth/register');
      cy.get('form[data-testid="register-form"]').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('input[name="company"]').should('be.visible');
      cy.get('select[name="role"]').should('be.visible');
    });

    it('should validate registration form', () => {
      cy.visit('/auth/register');

      // Submit empty form
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="name-error"]').should('be.visible');
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('be.visible');

      // Password mismatch
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password456');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="confirmPassword-error"]').should('contain', 'Passwords do not match');

      // Weak password
      cy.get('input[name="password"]').clear().type('weak');
      cy.get('[data-testid="password-strength"]').should('contain', 'Weak');
    });

    it('should register successfully', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: '123',
            email: 'newuser@example.com',
            name: 'New User',
          },
          message: 'Registration successful. Please check your email to verify your account.',
        },
      }).as('register');

      cy.visit('/auth/register');
      cy.fillForm({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
        company: 'Test Company',
      });
      cy.get('select[name="role"]').select('user');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.wait('@register');
      cy.get('[data-testid="success-message"]').should('contain', 'Registration successful');
      cy.url().should('include', '/auth/verify-email');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should logout successfully', () => {
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200,
        body: { message: 'Logout successful' },
      }).as('logout');

      cy.visit('/dashboard');
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      cy.wait('@logout');
      cy.url().should('equal', Cypress.config().baseUrl + '/');
      cy.getCookie('auth-token').should('not.exist');
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', () => {
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: {
          message: 'Password reset email sent',
        },
      }).as('forgotPassword');

      cy.visit('/auth/forgot-password');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPassword');
      cy.get('[data-testid="success-message"]').should('contain', 'Password reset email sent');
    });

    it('should reset password with valid token', () => {
      const resetToken = 'valid-reset-token';

      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: {
          message: 'Password reset successful',
        },
      }).as('resetPassword');

      cy.visit(`/auth/reset-password?token=${resetToken}`);
      cy.get('input[name="password"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@resetPassword');
      cy.get('[data-testid="success-message"]').should('contain', 'Password reset successful');
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Session Management', () => {
    it('should refresh token automatically', () => {
      cy.intercept('GET', '/api/user/profile', (req) => {
        if (req.headers['authorization'] === 'Bearer old-token') {
          req.reply({
            statusCode: 401,
            body: { error: 'Token expired' },
          });
        } else {
          req.reply({
            statusCode: 200,
            body: { user: { id: '123', email: 'test@example.com' } },
          });
        }
      }).as('userProfile');

      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: {
          accessToken: 'new-token',
          refreshToken: 'new-refresh-token',
        },
      }).as('refreshToken');

      // Set expired token
      cy.setCookie('auth-token', 'old-token');
      cy.visit('/dashboard');

      cy.wait('@refreshToken');
      cy.wait('@userProfile');
      cy.getCookie('auth-token').should('have.property', 'value', 'new-token');
    });

    it('should handle concurrent requests with expired token', () => {
      let refreshCount = 0;

      cy.intercept('POST', '/api/auth/refresh', () => {
        refreshCount++;
        return {
          statusCode: 200,
          body: {
            accessToken: 'new-token',
            refreshToken: 'new-refresh-token',
          },
        };
      }).as('refreshToken');

      // Set expired token
      cy.setCookie('auth-token', 'expired-token');

      // Make multiple concurrent requests
      cy.visit('/dashboard');
      cy.apiRequest('GET', '/api/user/profile');
      cy.apiRequest('GET', '/api/user/settings');
      cy.apiRequest('GET', '/api/user/notifications');

      // Should only refresh token once
      cy.wait('@refreshToken');
      cy.wrap(null).then(() => {
        expect(refreshCount).to.equal(1);
      });
    });
  });

  describe('Security', () => {
    it('should include CSRF token in requests', () => {
      cy.intercept('POST', '/api/auth/login', (req) => {
        expect(req.headers).to.have.property('x-csrf-token');
        req.reply({
          statusCode: 200,
          body: { user: {}, token: 'mock-token' },
        });
      }).as('loginWithCsrf');

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginWithCsrf');
    });

    it('should handle invalid CSRF token', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: {
          error: 'CSRF token missing',
          message: 'CSRF token is required for this request',
        },
      }).as('csrfError');

      // Clear CSRF token
      Cypress.env('CSRF_TOKEN', null);

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@csrfError');
      cy.get('[data-testid="error-message"]').should('contain', 'CSRF');
    });
  });
});
