#!/bin/bash

# Comprehensive test runner for settings system
# Usage: ./tests/run-all-tests.sh [--watch] [--coverage] [--ci]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default options
WATCH=false
COVERAGE=false
CI_MODE=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --watch)
      WATCH=true
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --ci)
      CI_MODE=true
      COVERAGE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🧪 Starting comprehensive settings system tests...${NC}"

# Create test results directory
mkdir -p test-results

# Set environment variables
export NODE_ENV=test
export CI=$CI_MODE

# Base Jest command
JEST_CMD="npx jest"

if [ "$COVERAGE" = true ]; then
  JEST_CMD="$JEST_CMD --coverage --coverageDirectory=test-results/coverage"
fi

if [ "$VERBOSE" = true ]; then
  JEST_CMD="$JEST_CMD --verbose"
fi

if [ "$WATCH" = true ]; then
  JEST_CMD="$JEST_CMD --watch"
fi

if [ "$CI_MODE" = true ]; then
  JEST_CMD="$JEST_CMD --ci --watchAll=false --passWithNoTests"
fi

# Function to run specific test suite
run_test_suite() {
  local suite_name=$1
  local test_pattern=$2
  local description=$3
  
  echo -e "\n${YELLOW}📋 Running $description...${NC}"
  
  if $JEST_CMD --testPathPattern="$test_pattern" --silent; then
    echo -e "${GREEN}✅ $suite_name tests passed${NC}"
    return 0
  else
    echo -e "${RED}❌ $suite_name tests failed${NC}"
    return 1
  fi
}

# Track test results
FAILED_SUITES=()

# Run test suites
echo -e "\n${BLUE}🔬 Test Suite Execution Plan:${NC}"
echo "1. Unit Tests - Core functionality"
echo "2. Integration Tests - API endpoints" 
echo "3. Security Tests - Vulnerabilities and data protection"
echo "4. Performance Tests - Response times and scalability"
echo "5. Accessibility Tests - WCAG compliance and screen readers"
echo "6. E2E Tests - Complete user workflows"

if [ "$WATCH" = false ]; then
  # Unit Tests
  if ! run_test_suite "Unit" "tests/unit" "Unit Tests"; then
    FAILED_SUITES+=("Unit")
  fi

  # Integration Tests  
  if ! run_test_suite "Integration" "tests/integration" "Integration Tests"; then
    FAILED_SUITES+=("Integration")
  fi

  # Security Tests
  if ! run_test_suite "Security" "tests/security" "Security Tests"; then
    FAILED_SUITES+=("Security") 
  fi

  # Performance Tests
  if ! run_test_suite "Performance" "tests/performance" "Performance Tests"; then
    FAILED_SUITES+=("Performance")
  fi

  # Accessibility Tests
  if ! run_test_suite "Accessibility" "tests/accessibility" "Accessibility Tests"; then
    FAILED_SUITES+=("Accessibility")
  fi

  # E2E Tests (using Cypress)
  echo -e "\n${YELLOW}🌐 Running E2E Tests...${NC}"
  if command -v cypress &> /dev/null; then
    if npx cypress run --spec "tests/e2e/**/*.cy.ts" --headless; then
      echo -e "${GREEN}✅ E2E tests passed${NC}"
    else
      echo -e "${RED}❌ E2E tests failed${NC}"
      FAILED_SUITES+=("E2E")
    fi
  else
    echo -e "${YELLOW}⚠️  Cypress not found, skipping E2E tests${NC}"
  fi

  # Test Results Summary
  echo -e "\n${BLUE}📊 Test Results Summary${NC}"
  echo "=================================="
  
  if [ ${#FAILED_SUITES[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All test suites passed!${NC}"
    
    if [ "$COVERAGE" = true ]; then
      echo -e "\n${BLUE}📈 Coverage Report:${NC}"
      echo "Coverage report: test-results/coverage/lcov-report/index.html"
      
      # Show coverage summary
      if command -v lcov &> /dev/null; then
        echo -e "\n${BLUE}Coverage Summary:${NC}"
        lcov --summary test-results/coverage/lcov.info 2>/dev/null | grep -E "(lines|functions|branches)" || true
      fi
    fi
    
    echo -e "\n${BLUE}📋 Generated Reports:${NC}"
    echo "- HTML Report: test-results/report.html"
    echo "- JUnit XML: test-results/junit.xml"
    [ "$COVERAGE" = true ] && echo "- Coverage: test-results/coverage/lcov-report/index.html"
    
    exit 0
  else
    echo -e "${RED}❌ Failed test suites: ${FAILED_SUITES[*]}${NC}"
    echo -e "\n${YELLOW}🔍 Debugging Tips:${NC}"
    echo "- Run specific suite: npm test -- --testPathPattern='tests/unit'"
    echo "- Debug with coverage: npm test -- --coverage --testPathPattern='tests/unit'"
    echo "- Watch mode: npm test -- --watch"
    echo "- Verbose output: npm test -- --verbose"
    
    exit 1
  fi
else
  # Watch mode - run all tests
  echo -e "\n${BLUE}👀 Running in watch mode...${NC}"
  $JEST_CMD
fi