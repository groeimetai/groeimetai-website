describe('Security Tests', () => {
  describe('Security Headers', () => {
    it('should have all required security headers', () => {
      cy.request('/').then((response) => {
        // Check for essential security headers
        expect(response.headers).to.have.property('strict-transport-security');
        expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
        expect(response.headers).to.have.property('x-frame-options');
        expect(response.headers).to.have.property('x-xss-protection', '1; mode=block');
        expect(response.headers).to.have.property('referrer-policy');
        expect(response.headers).to.have.property('content-security-policy');
        expect(response.headers).to.have.property('permissions-policy');

        // Should not expose server information
        expect(response.headers).to.not.have.property('x-powered-by');
        expect(response.headers).to.not.have.property('server');
      });
    });

    it('should have proper CSP directives', () => {
      cy.request('/').then((response) => {
        const csp = response.headers['content-security-policy'];

        // Check for important CSP directives
        expect(csp).to.include("default-src 'self'");
        expect(csp).to.include("object-src 'none'");
        expect(csp).to.include("base-uri 'self'");
        expect(csp).to.include('upgrade-insecure-requests');
      });
    });

    it('should enforce HTTPS', () => {
      cy.request('/').then((response) => {
        const hsts = response.headers['strict-transport-security'];
        expect(hsts).to.include('max-age=31536000');
        expect(hsts).to.include('includeSubDomains');
      });
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize user input in forms', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '"><script>alert("XSS")</script>',
      ];

      cy.visit('/contact');

      xssPayloads.forEach((payload) => {
        cy.get('input[name="message"]').clear().type(payload);
        cy.get('button[type="submit"]').click();

        // Check that script is not executed
        cy.on('window:alert', () => {
          throw new Error('XSS vulnerability detected!');
        });

        // Check that payload is properly escaped in response
        cy.get('[data-testid="preview"]').should('not.contain', '<script>');
        cy.get('[data-testid="preview"]').should('not.contain', 'onerror=');
      });
    });

    it('should sanitize URL parameters', () => {
      const xssPayload = '"><script>alert("XSS")</script>';

      cy.visit(`/search?q=${encodeURIComponent(xssPayload)}`);

      // Check that script is not executed
      cy.on('window:alert', () => {
        throw new Error('XSS vulnerability detected!');
      });

      // Check that search term is properly escaped
      cy.get('[data-testid="search-results"]').should('not.contain', '<script>');
    });

    it('should prevent DOM-based XSS', () => {
      cy.visit('/');

      // Try to inject script through hash
      cy.window().then((win) => {
        win.location.hash = '<img src=x onerror=alert("XSS")>';
      });

      cy.on('window:alert', () => {
        throw new Error('DOM XSS vulnerability detected!');
      });

      cy.wait(1000); // Wait for any potential script execution
    });
  });

  describe('SQL Injection Protection', () => {
    it('should handle SQL injection attempts in search', () => {
      const sqlPayloads = [
        "' OR '1'='1",
        "1'; DROP TABLE users--",
        "' UNION SELECT * FROM users--",
        "admin'--",
        "1' AND '1'='1",
      ];

      sqlPayloads.forEach((payload) => {
        cy.intercept('GET', '/api/search*', (req) => {
          // Check that SQL keywords are sanitized
          expect(req.query.q).to.not.include('DROP');
          expect(req.query.q).to.not.include('UNION');
          expect(req.query.q).to.not.include('--');

          req.reply({
            statusCode: 200,
            body: { results: [] },
          });
        }).as('search');

        cy.visit('/');
        cy.get('[data-testid="search-input"]').type(payload + '{enter}');
        cy.wait('@search');
      });
    });

    it('should sanitize form inputs for SQL injection', () => {
      const sqlPayload = "'; DROP TABLE users--";

      cy.intercept('POST', '/api/auth/login', (req) => {
        // Check that dangerous SQL is sanitized
        expect(req.body.email).to.not.include('DROP');
        expect(req.body.password).to.not.include('DROP');

        req.reply({
          statusCode: 401,
          body: { error: 'Invalid credentials' },
        });
      }).as('login');

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type(sqlPayload);
      cy.get('input[name="password"]').type(sqlPayload);
      cy.get('button[type="submit"]').click();
      cy.wait('@login');
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF token for state-changing requests', () => {
      cy.intercept('POST', '/api/user/profile', (req) => {
        expect(req.headers).to.have.property('x-csrf-token');
        expect(req.headers['x-csrf-token']).to.not.be.empty;

        req.reply({
          statusCode: 200,
          body: { success: true },
        });
      }).as('updateProfile');

      cy.login('test@example.com', 'password123');
      cy.visit('/dashboard/profile');
      cy.get('input[name="name"]').clear().type('Updated Name');
      cy.get('button[type="submit"]').click();
      cy.wait('@updateProfile');
    });

    it('should reject requests without CSRF token', () => {
      cy.request({
        method: 'POST',
        url: '/api/user/profile',
        body: { name: 'Test' },
        failOnStatusCode: false,
        headers: {
          Cookie: 'auth-token=valid-token',
          // Intentionally omit CSRF token
        },
      }).then((response) => {
        expect(response.status).to.equal(403);
        expect(response.body.error).to.include('CSRF');
      });
    });

    it('should validate CSRF token', () => {
      cy.request({
        method: 'POST',
        url: '/api/user/profile',
        body: { name: 'Test' },
        failOnStatusCode: false,
        headers: {
          Cookie: 'auth-token=valid-token',
          'X-CSRF-Token': 'invalid-csrf-token',
        },
      }).then((response) => {
        expect(response.status).to.equal(403);
        expect(response.body.error).to.include('Invalid CSRF token');
      });
    });
  });

  describe('Authentication Security', () => {
    it('should not expose sensitive information in errors', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          error: 'Invalid credentials',
          // Should not specify whether email or password is wrong
        },
      }).as('login');

      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.get('[data-testid="error-message"]').should('not.contain', 'User not found');
      cy.get('[data-testid="error-message"]').should('not.contain', 'Wrong password');
    });

    it('should enforce password requirements', () => {
      cy.visit('/auth/register');

      // Test weak passwords
      const weakPasswords = ['123456', 'password', 'qwerty', 'abc123'];

      weakPasswords.forEach((password) => {
        cy.get('input[name="password"]').clear().type(password);
        cy.get('[data-testid="password-strength"]').should('contain', 'Weak');
        cy.get('[data-testid="password-error"]').should('be.visible');
      });

      // Test strong password
      cy.get('input[name="password"]').clear().type('Str0ng!P@ssw0rd#2024');
      cy.get('[data-testid="password-strength"]').should('contain', 'Strong');
      cy.get('[data-testid="password-error"]').should('not.exist');
    });

    it('should limit login attempts', () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        cy.request({
          method: 'POST',
          url: '/api/auth/login',
          body: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
          failOnStatusCode: false,
        });
      }

      // Next attempt should be rate limited
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(429);
        expect(response.headers).to.have.property('retry-after');
      });
    });

    it('should properly handle JWT tokens', () => {
      // Test expired token
      cy.setCookie('auth-token', 'expired.jwt.token');
      cy.request({
        url: '/api/user/profile',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });

      // Test malformed token
      cy.setCookie('auth-token', 'malformed-token');
      cy.request({
        url: '/api/user/profile',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', () => {
      cy.login('test@example.com', 'password123');
      cy.visit('/dashboard/upload');

      // Try to upload executable file
      const dangerousFile = new File(['malicious code'], 'virus.exe', {
        type: 'application/x-msdownload',
      });

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('malicious code'),
        fileName: 'virus.exe',
        mimeType: 'application/x-msdownload',
      });

      cy.get('[data-testid="upload-error"]').should('contain', 'File type not allowed');
    });

    it('should limit file size', () => {
      cy.login('test@example.com', 'password123');
      cy.visit('/dashboard/upload');

      // Create large file (over 10MB)
      const largeFile = new Uint8Array(11 * 1024 * 1024);

      cy.get('input[type="file"]').selectFile({
        contents: largeFile,
        fileName: 'large.jpg',
        mimeType: 'image/jpeg',
      });

      cy.get('[data-testid="upload-error"]').should('contain', 'File size exceeds limit');
    });

    it('should sanitize file names', () => {
      cy.intercept('POST', '/api/upload', (req) => {
        // Check that file name is sanitized
        const formData = req.body;
        expect(formData).to.not.include('..');
        expect(formData).to.not.include('/');
        expect(formData).to.not.include('\\');

        req.reply({
          statusCode: 200,
          body: { url: '/uploads/sanitized_filename.jpg' },
        });
      }).as('upload');

      cy.login('test@example.com', 'password123');
      cy.visit('/dashboard/upload');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test'),
        fileName: '../../../etc/passwd',
        mimeType: 'image/jpeg',
      });

      cy.wait('@upload');
    });
  });

  describe('API Security', () => {
    it('should not expose internal errors', () => {
      cy.request({
        url: '/api/cause-error',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(500);
        expect(response.body).to.not.include('stack');
        expect(response.body).to.not.include('file path');
        expect(response.body.error).to.equal('Internal Server Error');
      });
    });

    it('should validate API input', () => {
      const invalidPayloads = [
        { email: 'not-an-email' },
        { email: 'test@example.com', age: 'not-a-number' },
        { email: 'test@example.com', role: 'super-admin' }, // Invalid role
        { email: 'a'.repeat(1000) + '@example.com' }, // Too long
      ];

      invalidPayloads.forEach((payload) => {
        cy.request({
          method: 'POST',
          url: '/api/user/create',
          body: payload,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body).to.have.property('error');
        });
      });
    });

    it('should implement proper access control', () => {
      // Try to access admin endpoint as regular user
      cy.login('user@example.com', 'password123');

      cy.apiRequest('GET', '/api/admin/users', { failOnStatusCode: false }).then((response) => {
        expect(response.status).to.equal(403);
      });

      // Try to modify another user's data
      cy.apiRequest('PUT', '/api/user/456/profile', {
        body: { name: 'Hacked' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(403);
      });
    });
  });

  describe('Session Security', () => {
    it('should invalidate session on logout', () => {
      cy.login('test@example.com', 'password123');

      // Get current session token
      cy.getCookie('auth-token').then((cookie) => {
        const token = cookie?.value;

        // Logout
        cy.apiRequest('POST', '/api/auth/logout');

        // Try to use old token
        cy.request({
          url: '/api/user/profile',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
        });
      });
    });

    it('should timeout inactive sessions', () => {
      cy.login('test@example.com', 'password123');

      // Simulate inactivity by setting cookie expiry in the past
      cy.setCookie('auth-token', 'valid-token', {
        expiry: Date.now() - 1000,
      });

      cy.visit('/dashboard', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login');
    });

    it('should prevent session fixation', () => {
      // Set a session ID before login
      const fixedSessionId = 'fixed-session-id';
      cy.setCookie('session-id', fixedSessionId);

      // Login
      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Check that session ID changed after login
      cy.getCookie('session-id').then((cookie) => {
        expect(cookie?.value).to.not.equal(fixedSessionId);
      });
    });
  });
});
