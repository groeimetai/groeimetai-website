const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Module paths
  moduleNameMapping: {
    // Handle module aliases (if you have them in your tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!src/pages/api/**',
    '!src/types/**',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Global setup/teardown
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'test-results',
        filename: 'report.html',
        openReport: false,
      },
    ],
  ],
  
  // Projects for different test types
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jest-environment-jsdom',
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'node',
    },
    {
      displayName: 'Security Tests',
      testMatch: ['<rootDir>/tests/security/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jest-environment-jsdom',
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/tests/performance/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jest-environment-jsdom',
    },
    {
      displayName: 'Accessibility Tests',
      testMatch: ['<rootDir>/tests/accessibility/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jest-environment-jsdom',
    },
  ],
  
  // Verbose output for debugging
  verbose: process.env.CI === 'true',
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Mock handling
  unmockedModulePathPatterns: [
    'node_modules/react/',
    'node_modules/@testing-library/',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);