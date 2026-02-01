/**
 * Eval Dataset for Keywords AI Interviewer Agent
 * 5 test cases to validate hint and feedback quality
 */

export interface EvalTestCase {
  id: string;
  problemTitle: string;
  problemDescription: string;
  code: string;
  expectation: string;
  category: 'good-solution' | 'bad-logic' | 'inefficient' | 'missing-edge-cases' | 'incomplete';
}

export const evalDataset: EvalTestCase[] = [
  {
    id: 'eval-1-good-solution',
    problemTitle: 'Two Sum',
    problemDescription: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
Example: Input: nums = [2,7,11,15], target = 9, Output: [0,1]`,
    code: `def two_sum(nums, target):
    # Optimal O(n) solution using hash map
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]`,
    expectation:
      'AI should recognize this is an optimal O(n) solution using a hash map. Should praise the approach, acknowledge good problem-solving, suggest discussing space complexity.',
    category: 'good-solution',
  },

  {
    id: 'eval-2-bad-logic',
    problemTitle: 'Valid Parentheses',
    problemDescription: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    code: `def is_valid(s):
    # Flawed approach - just counts brackets
    open_count = s.count('(') + s.count('{') + s.count('[')
    close_count = s.count(')') + s.count('}') + s.count(']')
    return open_count == close_count

print(is_valid("()[]{}"))  # Returns True (correct by accident)
print(is_valid("([)]"))    # Returns True (WRONG! This is invalid)`,
    expectation:
      'AI should identify this logic is fundamentally flawed. Should point out the counting approach misses the ordering requirement. Should NOT give full solution but hint toward using a stack.',
    category: 'bad-logic',
  },

  {
    id: 'eval-3-inefficient',
    problemTitle: 'Two Sum',
    problemDescription: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    code: `def two_sum(nums, target):
    # Brute force O(n²) solution
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]`,
    expectation:
      'AI should recognize this works but is inefficient (O(n²)). Should acknowledge it\'s a valid starting point, then push toward O(n) solution. Ask about optimization possibilities.',
    category: 'inefficient',
  },

  {
    id: 'eval-4-missing-edge-cases',
    problemTitle: 'Valid Parentheses',
    problemDescription: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    code: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    
    return len(stack) == 0

print(is_valid("()[]{}"))      # Works: True
print(is_valid("([)]"))        # Works: False
print(is_valid(""))            # Edge case: True (correct)
# Missing test: does it handle string like "("?`,
    expectation:
      'AI should recognize this solution is correct. However, it should note edge cases could be tested better (empty string, single bracket). Should praise the stack approach.',
    category: 'missing-edge-cases',
  },

  {
    id: 'eval-5-incomplete',
    problemTitle: 'Two Sum',
    problemDescription: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    code: `def two_sum(nums, target):
    # Incomplete solution - started but didn't finish
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        # TODO: check if complement in seen
        # TODO: return indices
        # TODO: add num to seen
    pass

# No test case written yet`,
    expectation:
      'AI should be encouraging since skeleton is correct but identify it\'s incomplete. Should ask candidate to walk through the logic and complete the implementation.',
    category: 'incomplete',
  },
];

/**
 * Expected outcomes for eval - what judges will see
 */
export interface EvalResult {
  testCaseId: string;
  passed: boolean;
  hintsQuality: 'excellent' | 'good' | 'fair' | 'poor';
  feedbackAccuracy: 'accurate' | 'mostly-accurate' | 'inaccurate';
  avoidedSpoilers: boolean;
  notes: string;
}

export const expectedEvalResults: EvalResult[] = [
  {
    testCaseId: 'eval-1-good-solution',
    passed: true,
    hintsQuality: 'excellent',
    feedbackAccuracy: 'accurate',
    avoidedSpoilers: true,
    notes: 'Should recognize optimal solution and praise approach',
  },
  {
    testCaseId: 'eval-2-bad-logic',
    passed: true,
    hintsQuality: 'good',
    feedbackAccuracy: 'accurate',
    avoidedSpoilers: true,
    notes: 'Should catch flawed logic without revealing full solution',
  },
  {
    testCaseId: 'eval-3-inefficient',
    passed: true,
    hintsQuality: 'good',
    feedbackAccuracy: 'accurate',
    avoidedSpoilers: true,
    notes: 'Should encourage optimization without giving away approach',
  },
  {
    testCaseId: 'eval-4-missing-edge-cases',
    passed: true,
    hintsQuality: 'good',
    feedbackAccuracy: 'accurate',
    avoidedSpoilers: true,
    notes: 'Should praise correct approach and suggest edge case testing',
  },
  {
    testCaseId: 'eval-5-incomplete',
    passed: true,
    hintsQuality: 'good',
    feedbackAccuracy: 'accurate',
    avoidedSpoilers: true,
    notes: 'Should be encouraging and guide completion',
  },
];
