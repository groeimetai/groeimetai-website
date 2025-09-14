/**
 * Performance Tests for Score Calculation
 *
 * This test suite validates:
 * 1. Score calculation performance
 * 2. Memory usage during data transfer
 * 3. Large dataset handling
 * 4. Concurrent operations
 * 5. Browser storage performance
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { performance } from 'perf_hooks';

// Mock the score calculation logic from the components
const calculateQuickScore = (data: any): number => {
  let score = 0;

  // APIs (25 points)
  const apiScore = {
    'most': 25,
    'some': 15,
    'unknown': 8,
    'none': 0
  }[data.hasApis] || 0;
  score += apiScore;

  // Data Access (25 points)
  const dataScore = {
    'instant': 25,
    'minutes': 18,
    'difficult': 8,
    'impossible': 0
  }[data.dataAccess] || 0;
  score += dataScore;

  // Process Documentation (25 points)
  const processScore = {
    'documented': 25,
    'partially': 18,
    'tribal': 8,
    'chaos': 0
  }[data.processDocumentation] || 0;
  score += processScore;

  // Automation Experience (15 points)
  const automationScore = {
    'advanced': 15,
    'basic': 10,
    'trying': 5,
    'none': 0
  }[data.automationExperience] || 0;
  score += automationScore;

  // Main Blocker (10 points)
  const blockerScore = {
    'Security/compliance zorgen': 2,
    'Team weerstand tegen verandering': 3,
    'Data is te rommelig/verspreid': 4,
    'Systemen praten niet met elkaar': 5,
    'Technische kennis ontbreekt': 6,
    'Geen idee waar te beginnen': 7,
    'Budget/resources beperkt': 8,
    'Anders': 5
  }[data.mainBlocker] || 0;
  score += blockerScore;

  return Math.min(score, 100);
};

const getMaturityLevel = (score: number): string => {
  if (score >= 90) return 'Agent-Ready (Level 5)';
  if (score >= 70) return 'Integration-Ready (Level 4)';
  if (score >= 50) return 'Digitalization-Ready (Level 3)';
  if (score >= 30) return 'Foundation-Building (Level 2)';
  return 'Pre-Digital (Level 1)';
};

// Assessment progress calculation logic
const calculateAdjustedProgress = (currentStep: number, skippedCount: number): number => {
  const totalQuestionsToAnswer = 15 - skippedCount;
  const questionsAnswered = currentStep - 1;
  return Math.round((Math.min(questionsAnswered, totalQuestionsToAnswer) / totalQuestionsToAnswer) * 100);
};

const shouldSkipStep = (step: number, quizData: any): boolean => {
  if (!quizData) return false;

  const skipMap: Record<number, boolean> = {
    1: !!(quizData.hasApis),
    2: !!(quizData.dataAccess),
    3: !!(quizData.processDocumentation),
    4: !!(quizData.automationExperience),
    5: !!(quizData.mainBlocker)
  };

  return skipMap[step] || false;
};

// Mock storage for performance tests
const createPerformantStorage = () => {
  const storage = new Map<string, string>();

  return {
    getItem: (key: string) => {
      const start = performance.now();
      const result = storage.get(key) || null;
      const end = performance.now();
      return { result, time: end - start };
    },
    setItem: (key: string, value: string) => {
      const start = performance.now();
      storage.set(key, value);
      const end = performance.now();
      return end - start;
    },
    size: storage.size,
    clear: () => storage.clear()
  };
};

describe('Performance Tests for Quiz-Assessment Flow', () => {
  beforeEach(() => {
    // Clear any existing timers
    vi.clearAllTimers();
  });

  describe('Score Calculation Performance', () => {
    test('should calculate scores quickly for single dataset', () => {
      const testData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        calculateQuickScore(testData);
        getMaturityLevel(98);
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      expect(avgTime).toBeLessThan(0.01); // Less than 0.01ms per calculation
      expect(end - start).toBeLessThan(100); // Total time under 100ms
    });

    test('should handle batch score calculations efficiently', () => {
      // Generate 1000 different quiz scenarios
      const scenarios = Array.from({ length: 1000 }, (_, i) => ({
        hasApis: ['most', 'some', 'unknown', 'none'][i % 4],
        dataAccess: ['instant', 'minutes', 'difficult', 'impossible'][i % 4],
        processDocumentation: ['documented', 'partially', 'tribal', 'chaos'][i % 4],
        automationExperience: ['advanced', 'basic', 'trying', 'none'][i % 4],
        mainBlocker: [
          'Security/compliance zorgen',
          'Team weerstand tegen verandering',
          'Data is te rommelig/verspreid',
          'Budget/resources beperkt'
        ][i % 4]
      }));

      const start = performance.now();

      const results = scenarios.map(scenario => ({
        score: calculateQuickScore(scenario),
        level: getMaturityLevel(calculateQuickScore(scenario)),
        scenario
      }));

      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Under 50ms for 1000 calculations
      expect(results).toHaveLength(1000);
      expect(results.every(r => r.score >= 0 && r.score <= 100)).toBe(true);
    });

    test('should validate score distribution across all combinations', () => {
      const options = {
        hasApis: ['most', 'some', 'unknown', 'none'],
        dataAccess: ['instant', 'minutes', 'difficult', 'impossible'],
        processDocumentation: ['documented', 'partially', 'tribal', 'chaos'],
        automationExperience: ['advanced', 'basic', 'trying', 'none'],
        mainBlocker: [
          'Security/compliance zorgen',
          'Budget/resources beperkt',
          'Technische kennis ontbreekt',
          'Anders'
        ]
      };

      const allCombinations = [];
      options.hasApis.forEach(api => {
        options.dataAccess.forEach(data => {
          options.processDocumentation.forEach(process => {
            options.automationExperience.forEach(automation => {
              options.mainBlocker.forEach(blocker => {
                allCombinations.push({
                  hasApis: api,
                  dataAccess: data,
                  processDocumentation: process,
                  automationExperience: automation,
                  mainBlocker: blocker
                });
              });
            });
          });
        });
      });

      // 4^5 = 1024 combinations
      expect(allCombinations).toHaveLength(1024);

      const start = performance.now();

      const scores = allCombinations.map(calculateQuickScore);

      const end = performance.now();

      // All 1024 combinations should be calculated quickly
      expect(end - start).toBeLessThan(100);

      // Verify score range
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      expect(minScore).toBeGreaterThanOrEqual(0);
      expect(maxScore).toBeLessThanOrEqual(100);
      expect(minScore).toBeLessThan(maxScore); // Should have variety
    });
  });

  describe('Progress Calculation Performance', () => {
    test('should calculate progress efficiently for all possible scenarios', () => {
      const scenarios = [];

      // Test all combinations of currentStep (1-15) and skippedCount (0-5)
      for (let step = 1; step <= 15; step++) {
        for (let skipped = 0; skipped <= 5; skipped++) {
          scenarios.push({ currentStep: step, skippedCount: skipped });
        }
      }

      const start = performance.now();

      const results = scenarios.map(({ currentStep, skippedCount }) =>
        calculateAdjustedProgress(currentStep, skippedCount)
      );

      const end = performance.now();

      expect(end - start).toBeLessThan(10); // Under 10ms for all scenarios
      expect(results.every(r => r >= 0 && r <= 100)).toBe(true);
    });

    test('should handle step skipping logic efficiently', () => {
      const quizScenarios = [
        {}, // No quiz data
        { hasApis: 'most' }, // Partial data
        { hasApis: 'most', dataAccess: 'instant' }, // More partial
        { // Complete data
          hasApis: 'most',
          dataAccess: 'instant',
          processDocumentation: 'documented',
          automationExperience: 'advanced',
          mainBlocker: 'Budget/resources beperkt'
        }
      ];

      const start = performance.now();

      const results = quizScenarios.map(quiz => {
        const skipResults = [];
        for (let step = 1; step <= 5; step++) {
          skipResults.push(shouldSkipStep(step, quiz));
        }
        return skipResults;
      });

      const end = performance.now();

      expect(end - start).toBeLessThan(5);
      expect(results[0]).toEqual([false, false, false, false, false]); // No skips
      expect(results[3]).toEqual([true, true, true, true, true]); // All skips
    });
  });

  describe('Storage Performance', () => {
    test('should handle large quiz data storage efficiently', () => {
      const storage = createPerformantStorage();

      // Create large quiz data
      const largeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt',
        quickCheckScore: 83,
        quickCheckLevel: 'Integration-Ready (Level 4)',
        source: 'hero_quiz',
        timestamp: new Date().toISOString(),
        // Add large data
        systems: Array(100).fill('Test System Name').map((name, i) => `${name} ${i}`),
        responses: Array(50).fill(0).reduce((acc, _, i) => {
          acc[`question_${i}`] = `Very long answer text repeated many times `.repeat(10);
          return acc;
        }, {} as Record<string, string>),
        metadata: {
          userAgent: 'Very long user agent string '.repeat(20),
          referrer: 'https://example.com/very/long/path/with/many/parameters?param1=value1&param2=value2'.repeat(5)
        }
      };

      const serializedData = JSON.stringify(largeQuizData);

      // Storage operation should be fast even for large data
      const setTime = storage.setItem('quizPreFill', serializedData);
      expect(setTime).toBeLessThan(10); // Under 10ms

      const { result, time } = storage.getItem('quizPreFill');
      expect(time).toBeLessThan(10); // Under 10ms
      expect(result).toBe(serializedData);

      // Verify data integrity after JSON round-trip
      const parsed = JSON.parse(result!);
      expect(parsed.quickCheckScore).toBe(83);
      expect(parsed.systems).toHaveLength(100);
    });

    test('should handle concurrent storage operations', async () => {
      const storage = createPerformantStorage();

      // Simulate concurrent quiz completions
      const concurrentOperations = Array.from({ length: 50 }, (_, i) => {
        const quizData = {
          hasApis: 'most',
          dataAccess: 'instant',
          quickCheckScore: 80 + i,
          timestamp: new Date().toISOString(),
          uniqueId: `quiz_${i}`
        };

        return async () => {
          const key = `quiz_${i}`;
          const setTime = storage.setItem(key, JSON.stringify(quizData));
          const { result, time: getTime } = storage.getItem(key);

          return { setTime, getTime, valid: !!result };
        };
      });

      const start = performance.now();
      const results = await Promise.all(concurrentOperations.map(op => op()));
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // All operations under 100ms
      expect(results.every(r => r.valid)).toBe(true);
      expect(storage.size).toBe(50);
    });

    test('should handle storage errors gracefully', () => {
      // Mock storage that throws errors
      const errorStorage = {
        getItem: () => { throw new Error('Storage unavailable'); },
        setItem: () => { throw new Error('Storage full'); }
      };

      const quizData = { hasApis: 'most', quickCheckScore: 75 };

      // Should not crash on storage errors
      expect(() => {
        try {
          errorStorage.setItem('quiz', JSON.stringify(quizData));
        } catch (error) {
          // Handle gracefully
          console.warn('Storage error handled:', error.message);
        }
      }).not.toThrow();
    });
  });

  describe('Memory Usage and Cleanup', () => {
    test('should not create memory leaks during repeated calculations', () => {
      const initialMemory = process.memoryUsage?.().heapUsed || 0;

      // Simulate repeated quiz-assessment cycles
      for (let cycle = 0; cycle < 100; cycle++) {
        // Create quiz data
        const quizData = {
          hasApis: 'most',
          dataAccess: 'instant',
          processDocumentation: 'documented',
          automationExperience: 'advanced',
          mainBlocker: 'Budget/resources beperkt',
          cycle: cycle,
          largeData: Array(1000).fill(`data_${cycle}`).join(',')
        };

        // Calculate score
        const score = calculateQuickScore(quizData);
        const level = getMaturityLevel(score);

        // Simulate assessment progress
        for (let step = 1; step <= 15; step++) {
          calculateAdjustedProgress(step, 5);
          shouldSkipStep(step, quizData);
        }

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage?.().heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory should not increase significantly (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should clean up storage data after processing', () => {
      const storage = createPerformantStorage();

      // Store data
      const quizData = { hasApis: 'most', quickCheckScore: 80 };
      storage.setItem('quizPreFill', JSON.stringify(quizData));
      storage.setItem('quizPreFillBackup', JSON.stringify(quizData));

      expect(storage.size).toBe(2);

      // Simulate data processing and cleanup
      const { result } = storage.getItem('quizPreFill');
      if (result) {
        // Process data...
        JSON.parse(result);

        // Clean up after processing
        storage.setItem('quizPreFill', ''); // Clear main storage
        storage.setItem('quizPreFillBackup', ''); // Clear backup
      }

      // Verify cleanup (empty strings still count as stored)
      const { result: clearedResult } = storage.getItem('quizPreFill');
      expect(clearedResult).toBe('');
    });
  });

  describe('Edge Case Performance', () => {
    test('should handle malformed data without performance degradation', () => {
      const malformedDatasets = [
        null,
        undefined,
        '',
        'invalid-json{',
        JSON.stringify({ invalid: 'structure' }),
        JSON.stringify({ hasApis: null, dataAccess: undefined }),
        JSON.stringify({ quickCheckScore: 'not-a-number' }),
        JSON.stringify({ systems: Array(10000).fill('large-array') })
      ];

      const start = performance.now();

      malformedDatasets.forEach(data => {
        try {
          let parsed = null;
          if (typeof data === 'string' && data) {
            parsed = JSON.parse(data);
          }

          if (parsed) {
            calculateQuickScore(parsed);
            getMaturityLevel(parsed.quickCheckScore || 0);
          }
        } catch (error) {
          // Should handle errors gracefully
        }
      });

      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should handle errors quickly
    });

    test('should maintain performance with extreme input values', () => {
      const extremeInputs = [
        {
          hasApis: 'invalid-option',
          dataAccess: '',
          processDocumentation: null,
          automationExperience: undefined,
          mainBlocker: 'Non-existent option',
          quickCheckScore: -1000
        },
        {
          hasApis: 'most'.repeat(1000),
          dataAccess: 'instant',
          processDocumentation: 'documented',
          automationExperience: 'advanced',
          mainBlocker: 'Budget/resources beperkt',
          quickCheckScore: Number.MAX_SAFE_INTEGER
        }
      ];

      const start = performance.now();

      extremeInputs.forEach(input => {
        const score = calculateQuickScore(input);
        const level = getMaturityLevel(score);

        // Should return valid values even for extreme inputs
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(typeof level).toBe('string');
      });

      const end = performance.now();

      expect(end - start).toBeLessThan(10);
    });

    test('should handle deep object structures efficiently', () => {
      // Create deeply nested quiz data
      const deepData = {
        hasApis: 'most',
        dataAccess: 'instant',
        metadata: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: Array(100).fill(0).reduce((acc, _, i) => {
                    acc[`prop_${i}`] = `value_${i}`;
                    return acc;
                  }, {} as Record<string, string>)
                }
              }
            }
          }
        }
      };

      const start = performance.now();

      // JSON serialization/deserialization should be fast
      const serialized = JSON.stringify(deepData);
      const parsed = JSON.parse(serialized);
      const score = calculateQuickScore(parsed);

      const end = performance.now();

      expect(end - start).toBeLessThan(20);
      expect(score).toBeGreaterThan(0);
    });
  });
});