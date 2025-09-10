export class CalculatorTool {
  evaluate(expression: string): string {
    try {
      // Parse the expression to extract numbers and operations
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      
      // Basic safety check
      if (!sanitized || sanitized.length === 0) {
        return 'Invalid expression';
      }

      // Special calculations for common business metrics
      if (expression.toLowerCase().includes('roi')) {
        return this.calculateROI(expression);
      }

      if (expression.toLowerCase().includes('productivity')) {
        return this.calculateProductivity(expression);
      }

      if (expression.toLowerCase().includes('cost')) {
        return this.calculateCostSavings(expression);
      }

      // Use Function constructor for safe evaluation
      const result = new Function('return ' + sanitized)();
      
      if (typeof result === 'number' && !isNaN(result)) {
        return `Result: ${result}`;
      }
      
      return 'Invalid calculation';
    } catch (error) {
      return `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private calculateROI(expression: string): string {
    // Extract numbers from the expression
    const numbers = expression.match(/\d+\.?\d*/g);
    
    if (!numbers || numbers.length < 2) {
      return 'ROI calculation requires investment and return values';
    }

    const investment = parseFloat(numbers[0]);
    const returns = parseFloat(numbers[1]);
    
    const roi = ((returns - investment) / investment) * 100;
    
    return `
ROI Calculation:
- Investment: €${investment.toLocaleString()}
- Returns: €${returns.toLocaleString()}
- ROI: ${roi.toFixed(2)}%
- Payback Period: ${(investment / (returns - investment)).toFixed(1)} years
`;
  }

  private calculateProductivity(expression: string): string {
    const numbers = expression.match(/\d+\.?\d*/g);
    
    if (!numbers || numbers.length < 2) {
      return 'Productivity calculation requires hours saved and hourly rate';
    }

    const hoursSaved = parseFloat(numbers[0]);
    const hourlyRate = parseFloat(numbers[1]);
    const weeksPerYear = 52;
    
    const weeklyValue = hoursSaved * hourlyRate;
    const annualValue = weeklyValue * weeksPerYear;
    
    return `
Productivity Gains:
- Hours saved per week: ${hoursSaved}
- Hourly rate: €${hourlyRate}
- Weekly value: €${weeklyValue.toLocaleString()}
- Annual value: €${annualValue.toLocaleString()}
- 5-year value: €${(annualValue * 5).toLocaleString()}
`;
  }

  private calculateCostSavings(expression: string): string {
    const numbers = expression.match(/\d+\.?\d*/g);
    
    if (!numbers || numbers.length < 2) {
      return 'Cost calculation requires current cost and reduction percentage';
    }

    const currentCost = parseFloat(numbers[0]);
    const reductionPercent = parseFloat(numbers[1]);
    
    const savings = currentCost * (reductionPercent / 100);
    const newCost = currentCost - savings;
    
    return `
Cost Savings Analysis:
- Current cost: €${currentCost.toLocaleString()}
- Reduction: ${reductionPercent}%
- Savings: €${savings.toLocaleString()}
- New cost: €${newCost.toLocaleString()}
- 3-year savings: €${(savings * 3).toLocaleString()}
`;
  }

  calculateAgentROI(numAgents: number, tasksPerAgent: number, hoursSavedPerTask: number): string {
    const hourlyRate = 75; // Average developer hourly rate
    const implementationCost = 50000; // Typical implementation cost
    
    const totalHoursSaved = numAgents * tasksPerAgent * hoursSavedPerTask;
    const annualSavings = totalHoursSaved * hourlyRate * 52;
    const roi = ((annualSavings - implementationCost) / implementationCost) * 100;
    const paybackMonths = (implementationCost / (annualSavings / 12));
    
    return `
Multi-Agent System ROI:
- Number of agents: ${numAgents}
- Tasks per agent per week: ${tasksPerAgent}
- Hours saved per task: ${hoursSavedPerTask}
- Total hours saved per week: ${totalHoursSaved}
- Annual savings: €${annualSavings.toLocaleString()}
- Implementation cost: €${implementationCost.toLocaleString()}
- First year ROI: ${roi.toFixed(1)}%
- Payback period: ${paybackMonths.toFixed(1)} months
`;
  }
}