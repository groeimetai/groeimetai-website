import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

const performanceMetrics: any[] = [];

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    setupNodeEvents(on, config) {
      // Task for logging performance metrics
      on('task', {
        logPerformance(metrics) {
          performanceMetrics.push(metrics);
          return null;
        },
        
        generatePerformanceReport() {
          const report = {
            timestamp: new Date().toISOString(),
            metrics: performanceMetrics,
            summary: {
              avgDomContentLoaded: average(performanceMetrics.map(m => m.domContentLoaded)),
              avgLoadComplete: average(performanceMetrics.map(m => m.loadComplete)),
              avgFirstPaint: average(performanceMetrics.map(m => m.firstPaint)),
              avgFirstContentfulPaint: average(performanceMetrics.map(m => m.firstContentfulPaint)),
              avgTotalTime: average(performanceMetrics.map(m => m.totalTime))
            }
          };
          
          const reportPath = path.join(__dirname, '..', '..', 'cypress', 'reports', 'performance.json');
          fs.mkdirSync(path.dirname(reportPath), { recursive: true });
          fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
          
          console.log('Performance report generated:', reportPath);
          return null;
        },
        
        // Database seeding tasks
        async seedDatabase(data) {
          // TODO: Implement database seeding logic
          console.log('Seeding database with:', data);
          return null;
        },
        
        async cleanDatabase() {
          // TODO: Implement database cleanup logic
          console.log('Cleaning database');
          return null;
        },
        
        // Security testing tasks
        checkSecurityHeaders(url: string) {
          return new Promise((resolve) => {
            const https = require('https');
            https.get(url, (res: any) => {
              resolve({
                statusCode: res.statusCode,
                headers: res.headers
              });
            });
          });
        },
        
        // Accessibility testing tasks
        getA11yViolations(violations: any[]) {
          const violationData = violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length
          }));
          
          console.table(violationData);
          return null;
        }
      });
      
      // Code coverage
      require('@cypress/code-coverage/task')(on, config);
      
      // Visual regression testing
      on('after:screenshot', (details) => {
        // TODO: Integrate with visual regression service
        console.log('Screenshot taken:', details.path);
      });
      
      return config;
    },
    
    env: {
      codeCoverage: {
        url: 'http://localhost:3000/__coverage__'
      }
    },
    
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  }
});

function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}