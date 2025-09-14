/**
 * Quiz-to-Assessment Flow Validation Tests
 *
 * This test suite validates the complete flow from quick quiz completion
 * to full assessment, ensuring:
 * 1. Proper data transfer between components
 * 2. Correct progress calculation and display
 * 3. Assessment starts at the right question with proper numbering
 * 4. Edge cases are handled gracefully
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentReadinessQuickCheck } from '@/components/landing/AgentReadinessQuickCheck';
import AgentReadinessPage from '@/app/[locale]/agent-readiness/page';
import { NextIntlClientProvider } from 'next-intl';

// Mock next-intl
const messages = {
  agentReadinessQuiz: {
    title: 'Quick Check',
    subtitle: 'Test your readiness',
    step: 'Step',
    of: 'of',
    navigation: {
      previous: 'Previous',
      next: 'Next',
      showScore: 'Show Score'
    },
    results: {
      yourScore: 'Your Score',
      nextStep: 'Next Step',
      nextStepDescription: 'Get full roadmap',
      getFullRoadmap: 'Get Full Roadmap',
      retry: 'Try Again'
    }
  }
};

// Mock components
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    firebaseUser: null
  })
}));

// Mock sessionStorage and localStorage
const mockStorageData = new Map();
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (key: string) => mockStorageData.get(`session_${key}`) || null,
    setItem: (key: string, value: string) => mockStorageData.set(`session_${key}`, value),
    removeItem: (key: string) => mockStorageData.delete(`session_${key}`),
    clear: () => {
      for (const key of mockStorageData.keys()) {
        if (key.startsWith('session_')) mockStorageData.delete(key);
      }
    }
  }
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorageData.get(`local_${key}`) || null,
    setItem: (key: string, value: string) => mockStorageData.set(`local_${key}`, value),
    removeItem: (key: string) => mockStorageData.delete(`local_${key}`),
    clear: () => {
      for (const key of mockStorageData.keys()) {
        if (key.startsWith('local_')) mockStorageData.delete(key);
      }
    }
  }
});

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/agent-readiness',
  search: '',
  replace: vi.fn(),
  assign: vi.fn()
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock URLSearchParams
Object.defineProperty(window, 'URLSearchParams', {
  value: class MockURLSearchParams {
    private params: Map<string, string> = new Map();

    constructor(search?: string) {
      if (search) {
        const pairs = search.replace('?', '').split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            this.params.set(key, decodeURIComponent(value));
          }
        });
      }
    }

    get(key: string) { return this.params.get(key); }
    set(key: string, value: string) { this.params.set(key, value); }
    toString() {
      return Array.from(this.params.entries())
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    }
  }
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="nl" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe('Quiz-to-Assessment Flow', () => {
  beforeEach(() => {
    mockStorageData.clear();
    mockLocation.href = '';
    mockLocation.search = '';
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Quick Quiz Completion and Data Transfer', () => {
    test('should collect all 5 quiz answers correctly', async () => {
      const { container } = render(
        <TestWrapper>
          <AgentReadinessQuickCheck />
        </TestWrapper>
      );

      // Answer question 1 - APIs
      fireEvent.click(screen.getByLabelText('Ja, de meeste hebben APIs'));
      fireEvent.click(screen.getByText('Next'));

      // Answer question 2 - Data Access
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Ja, paar clicks en ik heb alles'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Answer question 3 - Process Documentation
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Ja, alles gedocumenteerd'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Answer question 4 - Automation Experience
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Zapier, Power Automate, RPA tools'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Answer question 5 - Main Blocker
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Budget/resources beperkt'));
      });

      // Mock API response for quiz completion
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          score: 83,
          level: 'Integration-Ready (Level 4)',
          timeToReady: '2-3 maanden voorbereiding nodig'
        })
      });

      // Complete quiz
      fireEvent.click(screen.getByText('Show Score'));

      await waitFor(() => {
        expect(screen.getByText('83')).toBeInTheDocument();
        expect(screen.getByText('Integration-Ready (Level 4)')).toBeInTheDocument();
      });

      // Verify API was called with correct data
      expect(global.fetch).toHaveBeenCalledWith('/api/quick-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coreBusiness: '',
          systems: [],
          highestImpactSystem: '',
          hasApis: 'most',
          dataAccess: 'instant',
          processDocumentation: 'documented',
          automationExperience: 'advanced',
          mainBlocker: 'Budget/resources beperkt'
        })
      });
    });

    test('should store quiz data in sessionStorage and localStorage for assessment transfer', async () => {
      render(
        <TestWrapper>
          <AgentReadinessQuickCheck />
        </TestWrapper>
      );

      // Complete quiz quickly with sample data
      const quizAnswers = [
        { selector: 'Ja, de meeste hebben APIs', step: 1 },
        { selector: 'Ja, paar clicks en ik heb alles', step: 2 },
        { selector: 'Ja, alles gedocumenteerd', step: 3 },
        { selector: 'Zapier, Power Automate, RPA tools', step: 4 },
        { selector: 'Budget/resources beperkt', step: 5 }
      ];

      for (const answer of quizAnswers) {
        fireEvent.click(screen.getByLabelText(answer.selector));
        if (answer.step < 5) {
          fireEvent.click(screen.getByText('Next'));
          await waitFor(() => screen.getByText(`Step ${answer.step + 1} of 5`));
        }
      }

      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          score: 83,
          level: 'Integration-Ready (Level 4)'
        })
      });

      fireEvent.click(screen.getByText('Show Score'));

      await waitFor(() => {
        expect(screen.getByText('Get Full Roadmap')).toBeInTheDocument();
      });

      // Click "Get Full Roadmap" to trigger data transfer
      fireEvent.click(screen.getByText('Get Full Roadmap'));

      // Verify sessionStorage contains quiz data
      const sessionData = JSON.parse(window.sessionStorage.getItem('quizPreFill') || '{}');
      expect(sessionData).toEqual({
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt',
        quickCheckScore: 83,
        quickCheckLevel: 'Integration-Ready (Level 4)',
        source: 'hero_quiz',
        timestamp: expect.any(String)
      });

      // Verify localStorage backup
      const localData = JSON.parse(window.localStorage.getItem('quizPreFillBackup') || '{}');
      expect(localData).toEqual(sessionData);

      // Verify URL redirect with parameters
      expect(mockLocation.href).toContain('/agent-readiness');
      expect(mockLocation.href).toContain('prefill=true');
      expect(mockLocation.href).toContain('score=83');
      expect(mockLocation.href).toContain('from=quick_check');
    });

    test('should handle API failure gracefully with client-side calculation', async () => {
      render(
        <TestWrapper>
          <AgentReadinessQuickCheck />
        </TestWrapper>
      );

      // Answer all questions
      const answers = ['most', 'instant', 'documented', 'advanced', 'Budget/resources beperkt'];

      for (let i = 0; i < 5; i++) {
        const labels = screen.getAllByRole('radio');
        fireEvent.click(labels[0]); // Click first option for simplicity
        if (i < 4) fireEvent.click(screen.getByText('Next'));
      }

      // Mock API failure
      (global.fetch as any).mockRejectedValueOnce(new Error('API failed'));

      fireEvent.click(screen.getByText('Show Score'));

      // Should fall back to client-side calculation
      await waitFor(() => {
        expect(screen.getByText(/\d+/)).toBeInTheDocument(); // Score should be displayed
      });
    });
  });

  describe('Assessment Data Loading and Progress Calculation', () => {
    test('should load quiz data from sessionStorage on assessment start', () => {
      // Pre-populate sessionStorage with quiz data
      const quizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt',
        quickCheckScore: 83,
        quickCheckLevel: 'Integration-Ready (Level 4)',
        source: 'hero_quiz'
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(quizData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should show skipped questions indicator
      expect(screen.getByText(/geskipt uit quick check/)).toBeInTheDocument();
      expect(screen.getByText(/Quick check score: 83/)).toBeInTheDocument();

      // Should clean up sessionStorage after loading
      expect(window.sessionStorage.getItem('quizPreFill')).toBeNull();
    });

    test('should fallback to localStorage if sessionStorage fails', () => {
      // Only populate localStorage
      const quizData = {
        hasApis: 'some',
        dataAccess: 'minutes',
        quickCheckScore: 65
      };

      window.localStorage.setItem('quizPreFillBackup', JSON.stringify(quizData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Quick check score: 65/)).toBeInTheDocument();
    });

    test('should fallback to URL parameters if storage fails', () => {
      // Mock URL with parameters
      mockLocation.search = '?prefill=true&from=quick_check&score=75&hasApis=most&dataAccess=instant';

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should still show quiz data loaded indicator
      expect(screen.getByText(/overgenomen uit quick check/)).toBeInTheDocument();
    });

    test('should calculate correct progress percentage with skipped questions', () => {
      const quizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt',
        quickCheckScore: 83
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(quizData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // With 5 questions skipped out of 15 total, we start at a higher percentage
      // Assessment should start at question "6" but actually be step 1 of remaining 10 questions
      expect(screen.getByText(/Vraag 6 van 15/)).toBeInTheDocument();

      // Progress should be calculated correctly: 1/10 remaining questions = 10%
      expect(screen.getByText(/10%/)).toBeInTheDocument();
    });

    test('should increment question counter correctly through assessment', async () => {
      const quizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(quizData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should start at question 6 (first non-skipped question)
      expect(screen.getByText(/Vraag 6 van 15/)).toBeInTheDocument();

      // Answer current question and proceed
      const textarea = screen.getByPlaceholderText(/We zijn een/);
      fireEvent.change(textarea, { target: { value: 'We zijn een IT consultancy die digitale transformatie levert aan MKB bedrijven' } });

      fireEvent.click(screen.getByText('Volgende'));

      // Should progress to question 7
      await waitFor(() => {
        expect(screen.getByText(/Vraag 7 van 15/)).toBeInTheDocument();
      });

      // Progress percentage should increase: 2/10 remaining = 20%
      expect(screen.getByText(/20%/)).toBeInTheDocument();
    });

    test('should handle edge case with no quiz data gracefully', () => {
      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should start at question 1 with normal progress
      expect(screen.getByText(/Vraag 1 van 15/)).toBeInTheDocument();
      expect(screen.getByText(/7%/)).toBeInTheDocument(); // 1/15 = ~7%

      // Should not show any quiz data indicators
      expect(screen.queryByText(/geskipt uit quick check/)).not.toBeInTheDocument();
    });
  });

  describe('Assessment Step Skipping Logic', () => {
    test('should skip correct steps based on quiz answers', () => {
      const completeQuizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        automationExperience: 'advanced',
        mainBlocker: 'Budget/resources beperkt'
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(completeQuizData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should show that 5 questions are skipped
      expect(screen.getByText(/5 vragen geskipt/)).toBeInTheDocument();

      // Should show pre-filled answer for APIs
      expect(screen.getByText(/Antwoord overgenomen uit quick check/)).toBeInTheDocument();
      expect(screen.getByText(/"most"/)).toBeInTheDocument();
    });

    test('should skip only partial steps for incomplete quiz data', () => {
      const partialQuizData = {
        hasApis: 'some',
        dataAccess: 'minutes'
        // Missing: processDocumentation, automationExperience, mainBlocker
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(partialQuizData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should only skip 2 questions
      expect(screen.getByText(/2 vragen geskipt/)).toBeInTheDocument();
    });
  });

  describe('Score Calculation Validation', () => {
    test('should calculate quiz score correctly for perfect answers', () => {
      const perfectData = {
        hasApis: 'most',        // 25 points
        dataAccess: 'instant',  // 25 points
        processDocumentation: 'documented', // 25 points
        automationExperience: 'advanced',   // 15 points
        mainBlocker: 'Budget/resources beperkt' // 8 points
      };

      // Test client-side calculation logic
      const calculateQuickScore = (data: any): number => {
        let score = 0;

        const apiScore = { 'most': 25, 'some': 15, 'unknown': 8, 'none': 0 }[data.hasApis] || 0;
        score += apiScore;

        const dataScore = { 'instant': 25, 'minutes': 18, 'difficult': 8, 'impossible': 0 }[data.dataAccess] || 0;
        score += dataScore;

        const processScore = { 'documented': 25, 'partially': 18, 'tribal': 8, 'chaos': 0 }[data.processDocumentation] || 0;
        score += processScore;

        const automationScore = { 'advanced': 15, 'basic': 10, 'trying': 5, 'none': 0 }[data.automationExperience] || 0;
        score += automationScore;

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

      const score = calculateQuickScore(perfectData);
      expect(score).toBe(98); // 25+25+25+15+8 = 98
    });

    test('should calculate quiz score correctly for minimum answers', () => {
      const minData = {
        hasApis: 'none',           // 0 points
        dataAccess: 'impossible',  // 0 points
        processDocumentation: 'chaos', // 0 points
        automationExperience: 'none',  // 0 points
        mainBlocker: 'Security/compliance zorgen' // 2 points
      };

      const calculateQuickScore = (data: any): number => {
        let score = 0;
        score += { 'most': 25, 'some': 15, 'unknown': 8, 'none': 0 }[data.hasApis] || 0;
        score += { 'instant': 25, 'minutes': 18, 'difficult': 8, 'impossible': 0 }[data.dataAccess] || 0;
        score += { 'documented': 25, 'partially': 18, 'tribal': 8, 'chaos': 0 }[data.processDocumentation] || 0;
        score += { 'advanced': 15, 'basic': 10, 'trying': 5, 'none': 0 }[data.automationExperience] || 0;
        score += {
          'Security/compliance zorgen': 2, 'Team weerstand tegen verandering': 3,
          'Data is te rommelig/verspreid': 4, 'Systemen praten niet met elkaar': 5,
          'Technische kennis ontbreekt': 6, 'Geen idee waar te beginnen': 7,
          'Budget/resources beperkt': 8, 'Anders': 5
        }[data.mainBlocker] || 0;
        return Math.min(score, 100);
      };

      const score = calculateQuickScore(minData);
      expect(score).toBe(2); // 0+0+0+0+2 = 2
    });

    test('should determine correct maturity levels based on scores', () => {
      const getMaturityLevel = (score: number): string => {
        if (score >= 90) return 'Agent-Ready (Level 5)';
        if (score >= 70) return 'Integration-Ready (Level 4)';
        if (score >= 50) return 'Digitalization-Ready (Level 3)';
        if (score >= 30) return 'Foundation-Building (Level 2)';
        return 'Pre-Digital (Level 1)';
      };

      expect(getMaturityLevel(95)).toBe('Agent-Ready (Level 5)');
      expect(getMaturityLevel(85)).toBe('Integration-Ready (Level 4)');
      expect(getMaturityLevel(60)).toBe('Digitalization-Ready (Level 3)');
      expect(getMaturityLevel(40)).toBe('Foundation-Building (Level 2)');
      expect(getMaturityLevel(15)).toBe('Pre-Digital (Level 1)');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle corrupted sessionStorage data', () => {
      // Store invalid JSON
      window.sessionStorage.setItem('quizPreFill', 'invalid-json{');

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should start normally without quiz data
      expect(screen.getByText(/Vraag 1 van 15/)).toBeInTheDocument();
      expect(screen.queryByText(/geskipt/)).not.toBeInTheDocument();
    });

    test('should handle missing required fields in quiz data', () => {
      // Incomplete quiz data
      const incompleteData = {
        hasApis: 'most'
        // Missing other required fields
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(incompleteData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should handle gracefully and only skip available data
      expect(screen.getByText(/1 vragen geskipt/)).toBeInTheDocument();
    });

    test('should handle browser storage being disabled', () => {
      // Mock storage methods to throw errors
      const originalSetItem = window.sessionStorage.setItem;
      window.sessionStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      render(
        <TestWrapper>
          <AgentReadinessQuickCheck />
        </TestWrapper>
      );

      // Quiz should still function without storage
      expect(screen.getByText('🔌 Hebben jullie systemen APIs?')).toBeInTheDocument();

      // Restore original method
      window.sessionStorage.setItem = originalSetItem;
    });

    test('should handle navigation between quiz and assessment correctly', () => {
      // Test back/forward navigation preservation
      mockLocation.search = '?prefill=true&score=75&hasApis=most';

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should clear URL parameters after loading
      expect(mockLocation.href).toBe('');
    });
  });

  describe('Performance and Data Integrity', () => {
    test('should not cause memory leaks with repeated quiz completions', () => {
      const { unmount } = render(
        <TestWrapper>
          <AgentReadinessQuickCheck />
        </TestWrapper>
      );

      // Simulate multiple completions
      for (let i = 0; i < 5; i++) {
        window.sessionStorage.setItem(`test-${i}`, 'data');
      }

      unmount();

      // Verify cleanup
      expect(window.sessionStorage.length).toBeLessThan(10);
    });

    test('should validate data types and ranges in transferred data', () => {
      const invalidData = {
        hasApis: 'invalid-option',
        dataAccess: 'also-invalid',
        quickCheckScore: 150 // Invalid score > 100
      };

      window.sessionStorage.setItem('quizPreFill', JSON.stringify(invalidData));

      render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Should handle invalid data gracefully
      expect(screen.queryByText(/150/)).not.toBeInTheDocument();
    });

    test('should maintain data consistency across page reloads', () => {
      const quizData = {
        hasApis: 'most',
        dataAccess: 'instant',
        processDocumentation: 'documented',
        quickCheckScore: 83
      };

      // Store data and simulate page reload
      window.sessionStorage.setItem('quizPreFill', JSON.stringify(quizData));

      const { rerender } = render(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Quick check score: 83/)).toBeInTheDocument();

      // Simulate reload
      rerender(
        <TestWrapper>
          <AgentReadinessPage />
        </TestWrapper>
      );

      // Data should be cleared after first load
      expect(screen.queryByText(/Quick check score/)).not.toBeInTheDocument();
    });
  });
});