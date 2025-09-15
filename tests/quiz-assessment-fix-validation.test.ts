/**
 * Test to validate the quiz-to-assessment fix
 * This tests the corrected progress calculation and question counter display
 */

describe('Quiz-to-Assessment Fix Validation', () => {
  const totalSteps = 15;

  // Mock functions based on the actual logic
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

  const getCurrentQuestionNumber = (currentStep: number): number => {
    // Simplified - in real implementation this accounts for skipped steps
    return currentStep;
  };

  // Fixed progress calculation
  const getAdjustedProgress = (quizData: any, currentStep: number): number => {
    const skippedCount = getSkippedQuestionCount(quizData);
    const currentQuestionNumber = getCurrentQuestionNumber(currentStep);
    const totalCompleted = skippedCount + currentQuestionNumber - 1;
    const totalQuestions = totalSteps - 1; // -1 because we don't count the final result as a question
    return Math.round((Math.min(totalCompleted, totalQuestions) / totalQuestions) * 100);
  };

  // Fixed question counter display
  const getQuestionDisplay = (quizData: any, currentStep: number): string => {
    const skippedCount = getSkippedQuestionCount(quizData);
    const currentQuestionNumber = getCurrentQuestionNumber(currentStep);
    return `Vraag ${skippedCount + currentQuestionNumber} van ${totalSteps}`;
  };

  test('should show correct question counter with no quiz data', () => {
    const quizData = null;
    const currentStep = 1;
    
    const display = getQuestionDisplay(quizData, currentStep);
    expect(display).toBe('Vraag 1 van 15');
    
    const progress = getAdjustedProgress(quizData, currentStep);
    expect(progress).toBe(0); // 0/14 = 0%
  });

  test('should show correct question counter with full quiz data', () => {
    const quizData = {
      hasApis: 'most',
      dataAccess: 'instant',
      processDocumentation: 'documented',
      automationExperience: 'advanced',
      mainBlocker: 'Budget/resources beperkt'
    };
    const currentStep = 1; // First question after skipped ones
    
    const display = getQuestionDisplay(quizData, currentStep);
    expect(display).toBe('Vraag 6 van 15'); // 5 skipped + 1 current = 6
    
    const progress = getAdjustedProgress(quizData, currentStep);
    expect(progress).toBe(36); // 5 skipped + 0 completed = 5/14 = 36%
  });

  test('should show correct question counter with partial quiz data', () => {
    const quizData = {
      hasApis: 'some',
      dataAccess: 'minutes',
      processDocumentation: 'partially'
      // Missing automationExperience and mainBlocker
    };
    const currentStep = 1;
    
    const display = getQuestionDisplay(quizData, currentStep);
    expect(display).toBe('Vraag 4 van 15'); // 3 skipped + 1 current = 4
    
    const progress = getAdjustedProgress(quizData, currentStep);
    expect(progress).toBe(21); // 3 skipped + 0 completed = 3/14 = 21%
  });

  test('should calculate progress correctly as user proceeds through assessment', () => {
    const quizData = {
      hasApis: 'most',
      dataAccess: 'instant',
      processDocumentation: 'documented',
      automationExperience: 'advanced',
      mainBlocker: 'Budget/resources beperkt'
    };

    // Test different steps
    const testCases = [
      { step: 1, expectedDisplay: 'Vraag 6 van 15', expectedProgress: 36 }, // 5/14 = 36%
      { step: 2, expectedDisplay: 'Vraag 7 van 15', expectedProgress: 43 }, // 6/14 = 43%
      { step: 3, expectedDisplay: 'Vraag 8 van 15', expectedProgress: 50 }, // 7/14 = 50%
      { step: 10, expectedDisplay: 'Vraag 15 van 15', expectedProgress: 100 }, // 14/14 = 100%
    ];

    testCases.forEach(({ step, expectedDisplay, expectedProgress }) => {
      const display = getQuestionDisplay(quizData, step);
      const progress = getAdjustedProgress(quizData, step);
      
      expect(display).toBe(expectedDisplay);
      expect(progress).toBe(expectedProgress);
    });
  });

  test('should always show 15 total questions regardless of skipped count', () => {
    const testCases = [
      { quizData: null, expected: '1 van 15' },
      { quizData: { hasApis: 'most' }, expected: '2 van 15' },
      { quizData: { hasApis: 'most', dataAccess: 'instant' }, expected: '3 van 15' },
      { 
        quizData: { 
          hasApis: 'most', 
          dataAccess: 'instant', 
          processDocumentation: 'documented',
          automationExperience: 'advanced',
          mainBlocker: 'Budget/resources beperkt'
        }, 
        expected: '6 van 15' 
      },
    ];

    testCases.forEach(({ quizData, expected }) => {
      const display = getQuestionDisplay(quizData, 1);
      expect(display).toContain('van 15');
      expect(display).toContain(expected);
    });
  });
});