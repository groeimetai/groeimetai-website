/**
 * Global test teardown
 * Runs once after all tests
 */

module.exports = async () => {
  // Cleanup global resources
  console.log('🧹 Cleaning up test environment...');
  
  // Calculate test duration
  if (global.__TEST_START_TIME__) {
    const duration = Date.now() - global.__TEST_START_TIME__;
    console.log(`✅ Test suite completed in ${duration}ms`);
  }
  
  // Close any open connections
  // await database.close();
  // await server.close();
};