/**
 * Eval Runner Script
 * Run Keywords AI interviewer through 5 test cases
 * Execute: npx ts-node scripts/runEvals.ts
 *
 * This script:
 * 1. Loads the 5 eval test cases
 * 2. Calls your /api/ask-interviewer and /api/end-session endpoints
 * 3. Logs results (for judges to inspect)
 * 4. Generates eval report
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

// Type definitions
interface EvalTestCase {
  id: string;
  problemTitle: string;
  problemDescription: string;
  code: string;
  expectation: string;
  category: string;
}

interface EvalRunResult {
  testCaseId: string;
  category: string;
  hintsReceived: string[];
  finalFeedback: string;
  success: boolean;
  latency: number;
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5173';

// Test cases (same as in evalDataset.ts)
const testCases: EvalTestCase[] = [
  {
    id: 'eval-1-good-solution',
    problemTitle: 'Two Sum',
    problemDescription: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    expectation: 'Should praise optimal O(n) approach',
    category: 'good-solution',
  },
  {
    id: 'eval-2-bad-logic',
    problemTitle: 'Valid Parentheses',
    problemDescription: `Given a string s with parentheses, determine if valid.`,
    code: `def is_valid(s):
    open_count = s.count('(') + s.count('{') + s.count('[')
    close_count = s.count(')') + s.count('}') + s.count(']')
    return open_count == close_count`,
    expectation: 'Should identify flawed counting logic',
    category: 'bad-logic',
  },
];

async function runEval() {
  console.log('\n🧪 Keywords AI Interviewer Eval Runner\n');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Running ${testCases.length} test cases...\n`);

  const results: EvalRunResult[] = [];

  for (const testCase of testCases) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Test Case: ${testCase.id}`);
    console.log(`Category: ${testCase.category}`);
    console.log(`Problem: ${testCase.problemTitle}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const startTime = Date.now();
    const hintsReceived: string[] = [];

    try {
      // Request 2 hints
      console.log('Requesting hints from Keywords AI...');
      for (let i = 0; i < 2; i++) {
        const hintResponse = await axios.post(`${API_BASE_URL}/api/ask-interviewer`, {
          problemTitle: testCase.problemTitle,
          problemDescription: testCase.problemDescription,
          code: testCase.code,
          hintsUsed: i,
          mode: 'v1', // Use strict mode for eval
        });

        const hint = hintResponse.data.message;
        hintsReceived.push(hint);
        console.log(`\n  Hint #${i + 1}:`);
        console.log(`  "${hint}"`);
      }

      // Get final feedback
      console.log('\n\nRequesting final feedback from Keywords AI...');
      const feedbackResponse = await axios.post(`${API_BASE_URL}/api/end-session`, {
        problemTitle: testCase.problemTitle,
        problemDescription: testCase.problemDescription,
        code: testCase.code,
        hintsUsed: 2,
        executionCount: 1,
      });

      const feedback = feedbackResponse.data;
      const latency = Date.now() - startTime;

      console.log('\n  Feedback:');
      console.log(`  Strengths: ${feedback.strengths.join(', ')}`);
      console.log(`  Weaknesses: ${feedback.weaknesses.join(', ')}`);
      console.log(`  Score: ${feedback.overallScore}/10`);
      console.log(`  Latency: ${latency}ms`);

      results.push({
        testCaseId: testCase.id,
        category: testCase.category,
        hintsReceived,
        finalFeedback: JSON.stringify(feedback),
        success: true,
        latency,
      });

      console.log('\n✅ Test case passed');
    } catch (error: any) {
      console.error('\n❌ Test case failed:', error.message);
      results.push({
        testCaseId: testCase.id,
        category: testCase.category,
        hintsReceived,
        finalFeedback: error.message,
        success: false,
        latency: Date.now() - startTime,
      });
    }
  }

  // Summary
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('📊 EVAL SUMMARY');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const passCount = results.filter((r) => r.success).length;
  const passRate = Math.round((passCount / results.length) * 100);

  console.log(`Total Test Cases: ${results.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${results.length - passCount}`);
  console.log(`Pass Rate: ${passRate}%\n`);

  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
  console.log(`Average Latency: ${Math.round(avgLatency)}ms`);

  // Save results to file
  const reportPath = path.join(process.cwd(), 'eval-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${reportPath}`);

  process.exit(passCount === results.length ? 0 : 1);
}

runEval().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
