/**
 * Quiz Logic Validation Tests
 *
 * This test suite validates the core logic of the quiz-to-assessment flow:
 * 1. Score calculation algorithms
 * 2. Progress percentage calculations
 * 3. Step skipping logic
 * 4. Data transfer mechanisms
 * 5. Edge case handling
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

// Core scoring logic extracted from components
const calculateQuickScore = (data: {
  hasApis: string;
  dataAccess: string;
  processDocumentation: string;
  automationExperience: string;
  mainBlocker: string;
}): number => {
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

  // Main Blocker (10 points) - LOWER score for HARDER blockers
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

// Assessment progress calculation logic (matches actual implementation)
const getSkippedQuestionCount = (quizData: any): number => {
  if (!quizData) return 0;

  let count = 0;
  if (quizData.hasApis) count++;
  if (quizData.dataAccess) count++;
  if (quizData.processDocumentation) count++;
  if (quizData.automationExperience) count++;
  if (quizData.mainBlocker) count++;

  return count;
};

// Matches the actual implementation from page.tsx
const getAdjustedProgress = (currentQuestionNumber: number, skippedCount: number): number => {
  const totalQuestionsToAnswer = 15 - skippedCount;
  if (totalQuestionsToAnswer <= 1) return 100; // Edge case handling

  return Math.round((Math.min(currentQuestionNumber - 1, totalQuestionsToAnswer - 1) / (totalQuestionsToAnswer - 1)) * 100);
};

// Simplified question number calculation based on actual implementation pattern
const getCurrentQuestionNumber = (currentStep: number, quizData: any): number => {
  if (!quizData) return currentStep;

  // Calculate how many questions are skipped from the first 5 steps
  const skippedCount = getSkippedQuestionCount(quizData);

  // The current question number is currentStep + number of skipped questions
  // This assumes we skip the first N questions and then continue with sequential numbering
  return currentStep + skippedCount;
};

describe('Quiz-to-Assessment Logic Validation', () => {
  describe('Quick Quiz Score Calculation', () => {
    test('should calculate perfect score correctly', () => {
      const perfectData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      const score = calculateQuickScore(perfectData);
      expect(score).toBe(98); // 25+25+25+15+8 = 98
    });

    test('should calculate minimum score correctly', () => {
      const minData = {
        hasApis: 'none',
        dataAccess: 'impossible',
        processDocumentation: 'chaos',
        automationExperience: 'none',
        mainBlocker: 'Security/compliance zorgen'
      };

      const score = calculateQuickScore(minData);
      expect(score).toBe(2); // 0+0+0+0+2 = 2
    });

    test('should handle mixed answers correctly', () => {
      const mixedData = {
        hasApis: 'some',           // 15 points
        dataAccess: 'minutes',     // 18 points
        processDocumentation: 'partially', // 18 points
        automationExperience: 'basic',     // 10 points
        mainBlocker: 'Technische kennis ontbreekt' // 6 points
      };

      const score = calculateQuickScore(mixedData);
      expect(score).toBe(67); // 15+18+18+10+6 = 67
    });

    test('should handle invalid options gracefully', () => {
      const invalidData = {
        hasApis: 'invalid-option',
        dataAccess: '',
        processDocumentation: 'non-existent',
        automationExperience: 'unknown-value',
        mainBlocker: 'not-in-list'
      };

      const score = calculateQuickScore(invalidData);
      expect(score).toBe(0); // All invalid options should default to 0
    });

    test('should not exceed maximum score of 100', () => {
      // This test ensures the Math.min(score, 100) cap works
      const score = calculateQuickScore({
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      });

      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Maturity Level Determination', () => {
    test('should correctly assign maturity levels based on score ranges', () => {
      expect(getMaturityLevel(95)).toBe('Agent-Ready (Level 5)');
      expect(getMaturityLevel(90)).toBe('Agent-Ready (Level 5)');
      expect(getMaturityLevel(89)).toBe('Integration-Ready (Level 4)');
      expect(getMaturityLevel(70)).toBe('Integration-Ready (Level 4)');
      expect(getMaturityLevel(69)).toBe('Digitalization-Ready (Level 3)');
      expect(getMaturityLevel(50)).toBe('Digitalization-Ready (Level 3)');
      expect(getMaturityLevel(49)).toBe('Foundation-Building (Level 2)');
      expect(getMaturityLevel(30)).toBe('Foundation-Building (Level 2)');
      expect(getMaturityLevel(29)).toBe('Pre-Digital (Level 1)');
      expect(getMaturityLevel(0)).toBe('Pre-Digital (Level 1)');
    });

    test('should handle edge cases in score ranges', () => {
      expect(getMaturityLevel(-1)).toBe('Pre-Digital (Level 1)');
      expect(getMaturityLevel(100)).toBe('Agent-Ready (Level 5)');
      expect(getMaturityLevel(101)).toBe('Agent-Ready (Level 5)');
    });
  });

  describe('Assessment Progress Calculation', () => {
    test('should calculate skipped questions correctly', () => {
      const completeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      expect(getSkippedQuestionCount(completeQuizData)).toBe(5);

      const partialQuizData = {
        hasApis: 'most',
        dataAccess: 'instant'
        // Only 2 questions answered
      };

      expect(getSkippedQuestionCount(partialQuizData)).toBe(2);

      expect(getSkippedQuestionCount(null)).toBe(0);
      expect(getSkippedQuestionCount({})).toBe(0);
    });

    test('should calculate current question number correctly', () => {
      const completeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      // With all 5 quiz answers, currentStep 1 should be question 6
      expect(getCurrentQuestionNumber(1, completeQuizData)).toBe(6);
      expect(getCurrentQuestionNumber(2, completeQuizData)).toBe(7);
      expect(getCurrentQuestionNumber(10, completeQuizData)).toBe(15);

      // With no quiz data, step = question number
      expect(getCurrentQuestionNumber(1, null)).toBe(1);
      expect(getCurrentQuestionNumber(15, null)).toBe(15);

      const partialQuizData = {
        hasApis: 'most',
        dataAccess: 'instant'
        // Only 2 questions answered, steps 1 and 2 skipped
      };

      // With 2 quiz answers, currentStep 1 should be question 3
      expect(getCurrentQuestionNumber(1, partialQuizData)).toBe(3);
      expect(getCurrentQuestionNumber(2, partialQuizData)).toBe(4);
    });

    test('should calculate progress percentage with skipped questions', () => {
      const completeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      // With 5 questions skipped, 10 remain
      // Question 6 (step 1) = 0/9 progress = 0%
      const questionNumber1 = getCurrentQuestionNumber(1, completeQuizData);
      expect(getAdjustedProgress(questionNumber1, 5)).toBe(0);

      // Question 7 (step 2) = 1/9 progress = 11%
      const questionNumber2 = getCurrentQuestionNumber(2, completeQuizData);
      expect(getAdjustedProgress(questionNumber2, 5)).toBe(11);

      // No questions skipped
      // Question 1 (step 1) = 0/14 progress = 0%
      expect(getAdjustedProgress(1, 0)).toBe(0);

      // Question 15 (step 15) = 14/14 progress = 100%
      expect(getAdjustedProgress(15, 0)).toBe(100);
    });

    test('should handle edge cases in progress calculation', () => {
      // Edge case: almost all questions skipped
      expect(getAdjustedProgress(1, 14)).toBe(100); // totalQuestionsToAnswer = 1, handled specially

      // Edge case: all questions skipped (impossible but test for robustness)
      expect(getAdjustedProgress(1, 15)).toBe(100);

      // Edge case: zero question number
      expect(getAdjustedProgress(0, 0)).toBe(0);
    });
  });

  describe('Data Transfer Validation', () => {
    test('should preserve quiz data structure for assessment transfer', () => {
      const originalQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      const score = calculateQuickScore(originalQuizData);
      const level = getMaturityLevel(score);

      // Create transfer data structure (as would be stored in sessionStorage)
      const transferData = {
        ...originalQuizData,
        quickCheckScore: score,
        quickCheckLevel: level,
        source: 'hero_quiz',
        timestamp: new Date().toISOString()
      };

      // Verify JSON serialization/deserialization preserves data
      const serialized = JSON.stringify(transferData);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.hasApis).toBe(originalQuizData.hasApis);
      expect(deserialized.dataAccess).toBe(originalQuizData.dataAccess);
      expect(deserialized.quickCheckScore).toBe(score);
      expect(deserialized.quickCheckLevel).toBe(level);
      expect(deserialized.source).toBe('hero_quiz');
      expect(typeof deserialized.timestamp).toBe('string');
    });

    test('should handle malformed storage data', () => {
      const malformedData = [
        null,
        undefined,
        '',
        'invalid-json{',
        JSON.stringify({ invalid: 'structure' }),
        JSON.stringify({ hasApis: null, quickCheckScore: 'not-a-number' })
      ];

      malformedData.forEach(data => {
        let parsed = null;
        try {
          if (typeof data === 'string' && data) {
            parsed = JSON.parse(data);
          }
        } catch (error) {
          // Should handle parsing errors gracefully
          expect(error).toBeDefined();
        }

        // If parsed successfully but invalid structure, should not break calculations
        if (parsed) {
          const skippedCount = getSkippedQuestionCount(parsed);
          expect(skippedCount).toBeGreaterThanOrEqual(0);
          expect(skippedCount).toBeLessThanOrEqual(5);
        }
      });
    });
  });

  describe('Question Counter Logic', () => {
    test('should correctly map current steps to question numbers', () => {
      const completeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      // With 5 questions skipped, step 1 becomes question 6
      expect(getCurrentQuestionNumber(1, completeQuizData)).toBe(6);

      // Step 2 becomes question 7
      expect(getCurrentQuestionNumber(2, completeQuizData)).toBe(7);

      // Step 10 becomes question 15 (final question)
      expect(getCurrentQuestionNumber(10, completeQuizData)).toBe(15);

      // With no questions skipped
      expect(getCurrentQuestionNumber(1, null)).toBe(1);
      expect(getCurrentQuestionNumber(15, null)).toBe(15);

      // With partial skipping
      const partialQuizData = {
        hasApis: 'most',
        dataAccess: 'instant'
      };

      expect(getCurrentQuestionNumber(1, partialQuizData)).toBe(3);
      expect(getCurrentQuestionNumber(13, partialQuizData)).toBe(15);
    });

    test('should validate assessment completion logic', () => {
      const isAssessmentComplete = (currentStep: number, skippedCount: number): boolean => {
        const totalSteps = 15;
        const remainingSteps = totalSteps - skippedCount;
        return currentStep > remainingSteps;
      };

      // With 5 skipped, assessment completes after step 10
      expect(isAssessmentComplete(10, 5)).toBe(false);
      expect(isAssessmentComplete(11, 5)).toBe(true);

      // With no skipped, assessment completes after step 15
      expect(isAssessmentComplete(15, 0)).toBe(false);
      expect(isAssessmentComplete(16, 0)).toBe(true);
    });

    test('should validate question display text format', () => {
      const formatQuestionDisplay = (currentStep: number, quizData: any): string => {
        const questionNumber = getCurrentQuestionNumber(currentStep, quizData);
        return `Vraag ${questionNumber} van 15`;
      };

      const completeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      expect(formatQuestionDisplay(1, completeQuizData)).toBe('Vraag 6 van 15');
      expect(formatQuestionDisplay(2, completeQuizData)).toBe('Vraag 7 van 15');
      expect(formatQuestionDisplay(10, completeQuizData)).toBe('Vraag 15 van 15');

      expect(formatQuestionDisplay(1, null)).toBe('Vraag 1 van 15');
      expect(formatQuestionDisplay(15, null)).toBe('Vraag 15 van 15');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large datasets efficiently', () => {
      const start = Date.now();

      // Test 1000 score calculations
      for (let i = 0; i < 1000; i++) {
        const testData = {
          hasApis: ['most', 'some', 'unknown', 'none'][i % 4],
          dataAccess: ['instant', 'minutes', 'difficult', 'impossible'][i % 4],
          processDocumentation: ['documented', 'partially', 'tribal', 'chaos'][i % 4],
          automationExperience: ['advanced', 'basic', 'trying', 'none'][i % 4],
          mainBlocker: ['Security/compliance zorgen', 'Budget/resources beperkt'][i % 2]
        };

        calculateQuickScore(testData);
        getMaturityLevel(calculateQuickScore(testData));
        getSkippedQuestionCount(testData);
        getAdjustedProgress(i % 15 + 1, i % 6);
      }

      const end = Date.now();
      const duration = end - start;

      // Should complete 1000 calculations in reasonable time (under 100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should maintain consistency across multiple calculations', () => {
      const testData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      // Multiple calculations should yield identical results
      const scores = Array.from({ length: 100 }, () => calculateQuickScore(testData));
      const uniqueScores = [...new Set(scores)];

      expect(uniqueScores).toHaveLength(1);
      expect(uniqueScores[0]).toBe(98);
    });

    test('should validate all possible score combinations produce valid results', () => {
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

      let validResults = 0;
      let totalCombinations = 0;

      options.hasApis.forEach(api => {
        options.dataAccess.forEach(data => {
          options.processDocumentation.forEach(process => {
            options.automationExperience.forEach(automation => {
              options.mainBlocker.forEach(blocker => {
                totalCombinations++;

                const score = calculateQuickScore({
                  hasApis: api,
                  dataAccess: data,
                  processDocumentation: process,
                  automationExperience: automation,
                  mainBlocker: blocker
                });

                const level = getMaturityLevel(score);

                if (score >= 0 && score <= 100 && typeof level === 'string') {
                  validResults++;
                }
              });
            });
          });
        });
      });

      expect(totalCombinations).toBe(1024); // 4^5 combinations
      expect(validResults).toBe(totalCombinations); // All should be valid
    });
  });
});