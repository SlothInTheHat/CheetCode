// End-of-Interview Feedback Prompt
// This generates comprehensive feedback after the interview session

export const getFeedbackPrompt = (
  problemTitle: string,
  problemDescription: string,
  finalCode: string,
  hintsUsed: number,
  executionCount: number
) => {
  return `You are a technical interviewer providing feedback after a coding interview session.

PROBLEM:
${problemTitle}
${problemDescription}

CANDIDATE'S FINAL CODE:
\`\`\`python
${finalCode}
\`\`\`

SESSION STATS:
- Hints requested: ${hintsUsed}
- Code executions: ${executionCount}

Analyze the candidate's performance and provide structured feedback in the following JSON format:

{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestedTopics": ["topic 1", "topic 2", "topic 3"],
  "overallScore": <number from 1-10>,
  "detailedFeedback": "<2-3 sentence summary of performance>"
}

EVALUATION CRITERIA:
1. Code correctness and completeness
2. Time and space complexity
3. Code quality (readability, variable names, structure)
4. Edge case handling
5. Problem-solving approach (based on hints needed)

Be honest but constructive. Focus on specific, actionable feedback.

Return ONLY the JSON object, no other text:`;
};
