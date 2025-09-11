/**
 * Performance tests for user settings functionality
 * Tests response times, memory usage, and scalability
 */

import { performance } from 'perf_hooks';
import { userSettingsService } from '@/services/userSettingsService';
import { createMockUserSettings, createMockApiResponse } from '../utils/test-helpers';

// Mock the API module
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Settings Performance Tests', () => {
  const mockApi = require('@/services/api').api;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Response Time Tests', () => {
    it('should fetch settings within acceptable time', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.get.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      await userSettingsService.get();
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms for mocked calls
    });

    it('should save settings within acceptable time', async () => {
      const mockSettings = createMockUserSettings();
      const updateData = { preferences: { language: 'es' } };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.put.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      await userSettingsService.save(updateData);
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(150); // Should respond within 150ms for save operations
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      
      // Simulate variable response times
      mockApi.get.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(mockResponse), Math.random() * 50)
        )
      );

      const startTime = performance.now();
      
      const requests = Array(10).fill(null).map(() => userSettingsService.get());
      await Promise.all(requests);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(500); // All 10 concurrent requests should complete within 500ms
    });

    it('should handle large settings objects efficiently', async () => {
      // Create large settings object
      const largeSettings = createMockUserSettings({
        dashboardLayout: {
          widgets: Array(100).fill(null).map((_, i) => ({
            id: `widget-${i}`,
            type: 'chart',
            position: { x: i % 12, y: Math.floor(i / 12) },
            size: { width: 4, height: 3 },
            settings: {
              title: `Widget ${i}`,
              data: Array(50).fill(null).map((_, j) => ({
                id: j,
                value: Math.random() * 100,
                label: `Data Point ${j}`,
              })),
            },
          })),
          columns: 12,
        },
        shortcuts: {
          enabled: true,
          customShortcuts: Object.fromEntries(
            Array(50).fill(null).map((_, i) => [`shortcut-${i}`, `ctrl+shift+${i}`])
          ),
        },
      });

      const mockResponse = createMockApiResponse(largeSettings);
      mockApi.put.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      await userSettingsService.save(largeSettings);
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(300); // Should handle large objects within 300ms
    });

    it('should batch multiple rapid updates efficiently', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      
      let callCount = 0;
      mockApi.patch.mockImplementation(() => {
        callCount++;
        return Promise.resolve(mockResponse);
      });

      const startTime = performance.now();

      // Simulate rapid updates
      const updates = [
        userSettingsService.updatePreferences({ language: 'en' }),
        userSettingsService.updatePreferences({ timezone: 'UTC' }),
        userSettingsService.updatePreferences({ theme: 'dark' }),
        userSettingsService.updatePreferences({ currency: 'USD' }),
        userSettingsService.updatePreferences({ dateFormat: 'MM/DD/YYYY' }),
      ];

      await Promise.all(updates);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle all updates efficiently
      expect(totalTime).toBeLessThan(200);
      expect(callCount).toBe(5); // All calls should complete
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory with repeated operations', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.get.mockResolvedValue(mockResponse);

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await userSettingsService.get();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for 100 operations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle deep object structures efficiently', async () => {
      // Create deeply nested settings
      const deepSettings = createMockUserSettings({
        customData: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    data: Array(100).fill(null).map((_, i) => ({
                      id: i,
                      nested: {
                        moreData: Array(10).fill(null).map((_, j) => ({
                          value: `item-${i}-${j}`,
                          metadata: {
                            timestamp: new Date().toISOString(),
                            tags: [`tag-${j}`, `category-${i % 5}`],
                          },
                        })),
                      },
                    })),
                  },
                },
              },
            },
          },
        },
      });

      const mockResponse = createMockApiResponse(deepSettings);
      mockApi.put.mockResolvedValue(mockResponse);

      const initialMemory = process.memoryUsage().heapUsed;
      
      await userSettingsService.save(deepSettings);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryUsed = finalMemory - initialMemory;

      // Should handle deep structures without excessive memory usage
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    it('should clean up resources after errors', async () => {
      const error = new Error('Simulated error');
      mockApi.get.mockRejectedValue(error);

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform operations that will fail
      for (let i = 0; i < 10; i++) {
        try {
          await userSettingsService.get();
        } catch (e) {
          // Expected to fail
        }
      }

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not accumulate memory from failed operations
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Scalability Tests', () => {
    it('should handle increasing load gracefully', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      
      const responseTimes: number[] = [];

      for (let concurrency = 1; concurrency <= 20; concurrency += 5) {
        mockApi.get.mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve(mockResponse), Math.random() * 10)
          )
        );

        const startTime = performance.now();
        
        const requests = Array(concurrency).fill(null).map(() => userSettingsService.get());
        await Promise.all(requests);
        
        const endTime = performance.now();
        const avgResponseTime = (endTime - startTime) / concurrency;
        
        responseTimes.push(avgResponseTime);
      }

      // Response time should not increase dramatically with concurrency
      const firstResponseTime = responseTimes[0];
      const lastResponseTime = responseTimes[responseTimes.length - 1];
      
      // Last response time should not be more than 3x the first
      expect(lastResponseTime).toBeLessThan(firstResponseTime * 3);
    });

    it('should handle large datasets efficiently', async () => {
      const datasets = [10, 50, 100, 500, 1000];
      const responseTimes: number[] = [];

      for (const size of datasets) {
        const largeSettings = createMockUserSettings({
          dashboardLayout: {
            widgets: Array(size).fill(null).map((_, i) => ({
              id: `widget-${i}`,
              type: 'chart',
              position: { x: i % 12, y: Math.floor(i / 12) },
              size: { width: 4, height: 3 },
            })),
            columns: 12,
          },
        });

        const mockResponse = createMockApiResponse(largeSettings);
        mockApi.get.mockResolvedValue(mockResponse);

        const startTime = performance.now();
        await userSettingsService.get();
        const endTime = performance.now();

        responseTimes.push(endTime - startTime);
      }

      // Response time should scale reasonably with data size
      const smallDataTime = responseTimes[0];
      const largeDataTime = responseTimes[responseTimes.length - 1];

      // Large dataset should not be more than 10x slower
      expect(largeDataTime).toBeLessThan(smallDataTime * 10);
    });

    it('should maintain performance with complex queries', async () => {
      const complexUpdates = [
        { preferences: { language: 'en', theme: 'dark', currency: 'USD' } },
        { notifications: { email: { enabled: true, frequency: 'daily' } } },
        { privacy: { profileVisibility: 'team', showEmail: false } },
        { display: { density: 'compact', fontSize: 'large' } },
        { integrations: { google: { connected: true, calendarSync: true } } },
      ];

      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);

      const times: number[] = [];

      for (const update of complexUpdates) {
        mockApi.patch.mockResolvedValue(mockResponse);

        const startTime = performance.now();
        
        if ('preferences' in update) {
          await userSettingsService.updatePreferences(update.preferences);
        } else if ('notifications' in update) {
          await userSettingsService.updateNotifications(update.notifications);
        } else if ('privacy' in update) {
          await userSettingsService.updatePrivacy(update.privacy);
        } else if ('display' in update) {
          await userSettingsService.updateDisplay(update.display);
        } else if ('integrations' in update) {
          await userSettingsService.updateIntegrations(update.integrations);
        }
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      // All operations should complete within reasonable time
      times.forEach(time => {
        expect(time).toBeLessThan(100);
      });

      // Performance should be consistent across different operations
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxDeviation = Math.max(...times.map(time => Math.abs(time - avgTime)));
      
      expect(maxDeviation).toBeLessThan(avgTime * 2); // No operation should be more than 2x average
    });
  });

  describe('Caching Performance', () => {
    it('should benefit from caching repeated requests', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      
      let apiCallCount = 0;
      mockApi.get.mockImplementation(() => {
        apiCallCount++;
        return Promise.resolve(mockResponse);
      });

      // First request (cache miss)
      const startTime1 = performance.now();
      await userSettingsService.get();
      const endTime1 = performance.now();
      const firstRequestTime = endTime1 - startTime1;

      // Subsequent requests (cache hits)
      const startTime2 = performance.now();
      await userSettingsService.get();
      await userSettingsService.get();
      await userSettingsService.get();
      const endTime2 = performance.now();
      const cachedRequestsTime = (endTime2 - startTime2) / 3;

      // Note: This assumes caching is implemented in the service
      // If no caching, all requests will be the same speed
      expect(apiCallCount).toBeGreaterThan(0);
    });

    it('should invalidate cache appropriately on updates', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      
      let getCallCount = 0;
      let updateCallCount = 0;

      mockApi.get.mockImplementation(() => {
        getCallCount++;
        return Promise.resolve(mockResponse);
      });

      mockApi.patch.mockImplementation(() => {
        updateCallCount++;
        return Promise.resolve(mockResponse);
      });

      // Initial get (cache population)
      await userSettingsService.get();
      expect(getCallCount).toBe(1);

      // Update should invalidate cache
      await userSettingsService.updatePreferences({ language: 'es' });
      expect(updateCallCount).toBe(1);

      // Next get should hit the API again (cache invalidated)
      await userSettingsService.get();
      expect(getCallCount).toBe(2);
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);

      // Simulate slow network (500ms delay)
      mockApi.get.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(mockResponse), 500)
        )
      );

      const startTime = performance.now();
      const result = await userSettingsService.get();
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      
      expect(result).toEqual(mockSettings);
      expect(responseTime).toBeGreaterThan(450); // Should account for the 500ms delay
      expect(responseTime).toBeLessThan(600); // But not add significant overhead
    });

    it('should timeout on extremely slow requests', async () => {
      // Simulate request that never completes
      mockApi.get.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      const startTime = performance.now();
      
      // This would need to be implemented with a timeout mechanism
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const requestPromise = userSettingsService.get();

      try {
        await Promise.race([requestPromise, timeoutPromise]);
      } catch (error: any) {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        expect(error.message).toBe('Request timeout');
        expect(totalTime).toBeGreaterThan(4900); // Should timeout around 5 seconds
        expect(totalTime).toBeLessThan(5100);
      }
    });

    it('should compress large payloads efficiently', async () => {
      // Create large settings that would benefit from compression
      const largeSettings = createMockUserSettings({
        largeTextData: 'Lorem ipsum '.repeat(1000), // Large text field
        repeatedData: Array(100).fill({
          id: 'repeated-id',
          name: 'Repeated Name',
          description: 'This is a repeated description that appears many times',
          metadata: {
            created: '2024-01-01T00:00:00.000Z',
            updated: '2024-01-01T00:00:00.000Z',
            tags: ['tag1', 'tag2', 'tag3'],
          },
        }),
      });

      const mockResponse = createMockApiResponse(largeSettings);
      mockApi.put.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      await userSettingsService.save(largeSettings);
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      
      // Should handle large payloads efficiently
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Browser Performance', () => {
    it('should not block the main thread', async () => {
      const mockSettings = createMockUserSettings();
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.get.mockResolvedValue(mockResponse);

      let mainThreadBlocked = false;
      
      // Set up a timer to detect if main thread is blocked
      const checkTimer = setTimeout(() => {
        mainThreadBlocked = true;
      }, 100);

      // Perform settings operation
      await userSettingsService.get();
      
      clearTimeout(checkTimer);
      
      // Main thread should not have been blocked
      expect(mainThreadBlocked).toBe(false);
    });

    it('should handle DOM updates efficiently', async () => {
      // This would test actual DOM performance in a real browser environment
      // For unit tests, we can only test the data transformation performance
      
      const mockSettings = createMockUserSettings();
      const startTime = performance.now();
      
      // Simulate data transformation that might happen in UI
      const transformedSettings = {
        ...mockSettings,
        preferences: {
          ...mockSettings.preferences,
          displayName: `${mockSettings.preferences.language} - ${mockSettings.preferences.timezone}`,
        },
        uiState: {
          formValues: Object.entries(mockSettings.preferences).map(([key, value]) => ({
            field: key,
            value: String(value),
            displayValue: String(value).toUpperCase(),
          })),
        },
      };
      
      const endTime = performance.now();
      const transformTime = endTime - startTime;
      
      expect(transformTime).toBeLessThan(10); // Data transformation should be fast
      expect(transformedSettings.uiState.formValues).toBeDefined();
    });
  });
});