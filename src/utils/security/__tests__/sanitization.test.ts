import { describe, it, expect } from '@jest/globals';
import {
  sanitizeHtml,
  sanitizeInput,
  escapeHtml,
  sanitizeSqlInput,
  sanitizeFileName,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  sanitizeJson,
  sanitizeErrorMessage,
  userInputSchema,
} from '../sanitization';

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove dangerous HTML tags', () => {
      const dirty = '<script>alert("XSS")</script><p>Safe text</p>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Safe text</p>');
    });

    it('should remove dangerous attributes', () => {
      const dirty = '<img src="valid.jpg" onerror="alert(\'XSS\')" />';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('onerror');
    });

    it('should allow safe HTML tags', () => {
      const safe = '<p>Text with <strong>bold</strong> and <em>italic</em></p>';
      const clean = sanitizeHtml(safe);

      expect(clean).toBe(safe);
    });

    it('should sanitize href attributes', () => {
      const dirty = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('javascript:');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should remove null bytes', () => {
      expect(sanitizeInput('test\0string')).toBe('teststring');
    });

    it('should escape HTML entities', () => {
      expect(sanitizeInput('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(sanitizeInput(123 as any)).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('should escape all HTML entities', () => {
      const input = '&<>"\'/ test';
      const expected = '&amp;&lt;&gt;&quot;&#x27;&#x2F; test';

      expect(escapeHtml(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('sanitizeSqlInput', () => {
    it('should remove SQL injection attempts', () => {
      expect(sanitizeSqlInput("'; DROP TABLE users--")).toBe('TABLE users');
      expect(sanitizeSqlInput("1' OR '1'='1")).toBe('1 OR 11');
    });

    it('should remove SQL keywords', () => {
      const keywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'EXEC', 'EXECUTE'];

      keywords.forEach((keyword) => {
        expect(sanitizeSqlInput(`${keyword} something`)).toBe('something');
        expect(sanitizeSqlInput(`${keyword.toLowerCase()} something`)).toBe('something');
      });
    });

    it('should remove SQL comments', () => {
      expect(sanitizeSqlInput('valid -- comment')).toBe('valid comment');
      expect(sanitizeSqlInput('valid /* comment */ text')).toBe('valid text');
    });

    it('should handle non-string input', () => {
      expect(sanitizeSqlInput(null as any)).toBe('');
      expect(sanitizeSqlInput(undefined as any)).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove path traversal attempts', () => {
      expect(sanitizeFileName('../../../etc/passwd')).toBe('___etc_passwd');
      expect(sanitizeFileName('..\\..\\windows\\system32')).toBe('__windows_system32');
    });

    it('should replace special characters', () => {
      expect(sanitizeFileName('file name with spaces.txt')).toBe('file_name_with_spaces.txt');
      expect(sanitizeFileName('file@#$%.txt')).toBe('file____.txt');
    });

    it('should handle hidden files', () => {
      expect(sanitizeFileName('.htaccess')).toBe('_htaccess');
    });

    it('should limit file name length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const sanitized = sanitizeFileName(longName);

      expect(sanitized.length).toBeLessThanOrEqual(255);
      expect(sanitized.endsWith('.txt')).toBe(true);
    });

    it('should handle non-string input', () => {
      expect(sanitizeFileName(null as any)).toBe('');
      expect(sanitizeFileName(undefined as any)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
      expect(sanitizeEmail('  user@domain.com  ')).toBe('user@domain.com');
    });

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('notanemail')).toBeNull();
      expect(sanitizeEmail('missing@tld')).toBeNull();
      expect(sanitizeEmail('@nodomain.com')).toBeNull();
      expect(sanitizeEmail('spaces in@email.com')).toBeNull();
    });
  });

  describe('sanitizeUrl', () => {
    it('should validate and sanitize valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('  http://test.com  ')).toBe('http://test.com/');
    });

    it('should reject invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull();
      expect(sanitizeUrl('javascript:alert("XSS")')).toBeNull();
      expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
    });

    it('should reject localhost in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      expect(sanitizeUrl('http://localhost:3000')).toBeNull();
      expect(sanitizeUrl('http://127.0.0.1:8080')).toBeNull();
      expect(sanitizeUrl('http://192.168.1.1')).toBeNull();

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should allow localhost in development', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000/');

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('sanitizePhone', () => {
    it('should extract digits from phone numbers', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('15551234567');
      expect(sanitizePhone('555-123-4567')).toBe('5551234567');
    });

    it('should reject invalid phone numbers', () => {
      expect(sanitizePhone('123')).toBeNull(); // Too short
      expect(sanitizePhone('12345678901234567890123')).toBeNull(); // Too long
      expect(sanitizePhone('not a phone')).toBeNull();
    });
  });

  describe('userInputSchema', () => {
    it('should validate and sanitize user input', () => {
      const input = {
        name: '  John Doe  ',
        email: 'JOHN@EXAMPLE.COM',
        phone: '+1 (555) 123-4567',
        message: '<script>alert("XSS")</script>Hello',
        company: 'ACME Corp',
        role: 'Developer',
      };

      const result = userInputSchema.parse(input);

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('15551234567');
      expect(result.message).toContain('&lt;script&gt;');
      expect(result.company).toBe('ACME Corp');
      expect(result.role).toBe('Developer');
    });

    it('should reject invalid input', () => {
      const invalidInputs = [
        { name: '', email: 'test@example.com', message: 'test' },
        { name: 'Test', email: 'invalid-email', message: 'test' },
        { name: 'Test', email: 'test@example.com', message: 'a'.repeat(1001) },
      ];

      invalidInputs.forEach((input) => {
        expect(() => userInputSchema.parse(input)).toThrow();
      });
    });
  });

  describe('sanitizeJson', () => {
    it('should sanitize all string values in JSON', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        nested: {
          value: '  trim me  ',
          array: ['<img onerror="alert()">', 'safe'],
        },
      };

      const result = sanitizeJson(input);

      expect(result.name).toContain('&lt;script&gt;');
      expect(result.nested.value).toBe('trim me');
      expect(result.nested.array[0]).toContain('&lt;img');
      expect(result.nested.array[1]).toBe('safe');
    });

    it('should handle all JSON types', () => {
      const input = {
        string: 'test',
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { key: 'value' },
      };

      const result = sanitizeJson(input);

      expect(result.string).toBe('test');
      expect(result.number).toBe(123);
      expect(result.boolean).toBe(true);
      expect(result.null).toBe(null);
      expect(result.undefined).toBe(undefined);
      expect(result.array).toEqual([1, 2, 3]);
      expect(result.object).toEqual({ key: 'value' });
    });
  });

  describe('sanitizeErrorMessage', () => {
    it('should remove file paths', () => {
      const error = 'Error at /home/user/project/file.js:123';
      const sanitized = sanitizeErrorMessage({ message: error });

      expect(sanitized).toBe('Error at [path]:123');
    });

    it('should remove stack traces', () => {
      const error = 'Error occurred\nat function (file.js:123)\nat other (file.js:456)';
      const sanitized = sanitizeErrorMessage({ message: error });

      expect(sanitized).toBe('Error occurred');
    });

    it('should remove sensitive patterns', () => {
      const patterns = [
        { input: 'User ID: 1234567890', expected: 'User ID: [number]' },
        { input: 'Email: user@example.com failed', expected: 'Email: [email] failed' },
        { input: 'IP: 192.168.1.1 blocked', expected: 'IP: [ip] blocked' },
      ];

      patterns.forEach(({ input, expected }) => {
        expect(sanitizeErrorMessage({ message: input })).toBe(expected);
      });
    });

    it('should handle non-error objects', () => {
      expect(sanitizeErrorMessage(null)).toBe('An error occurred');
      expect(sanitizeErrorMessage(undefined)).toBe('An error occurred');
      expect(sanitizeErrorMessage('string error')).toBe('An error occurred');
    });
  });
});
