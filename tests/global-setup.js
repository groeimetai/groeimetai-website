/**
 * Global test setup
 * Runs once before all tests
 */

module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_ENV = 'test';
  
  // Mock environment variables that might be needed
  process.env.FIREBASE_PROJECT_ID = 'test-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
  process.env.FIREBASE_PRIVATE_KEY = 'mock-private-key';
  
  // Setup global test database or services if needed
  console.log('🚀 Setting up test environment...');
  
  // Initialize any global test fixtures
  global.__TEST_START_TIME__ = Date.now();
};