import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const KEYWORDS_AI_URL = 'https://api.keywordsai.co/api/chat/completions';

const getFeedbackPrompt = (
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { problemTitle, problemDescription, code, hintsUsed, executionCount } = req.body;

    if (!problemTitle || !problemDescription || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.VITE_KEYWORDS_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Keywords AI API key not configured' });
    }

    const prompt = getFeedbackPrompt(
      problemTitle,
      problemDescription,
      code,
      hintsUsed || 0,
      executionCount || 0
    );

    // Call Keywords AI
    // Using stronger model (gpt-4) for final evaluation
    const response = await axios.post(
      KEYWORDS_AI_URL,
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const feedbackText = response.data.choices[0]?.message?.content || '{}';
    const feedback = JSON.parse(feedbackText);

    return res.status(200).json(feedback);
  } catch (error: any) {
    console.error('Feedback generation error:', error.response?.data || error);

    // Return a fallback feedback if AI fails
    return res.status(200).json({
      strengths: ['Attempted the problem', 'Used proper Python syntax'],
      weaknesses: ['Could not complete full evaluation'],
      suggestedTopics: ['Data Structures', 'Algorithms', 'Time Complexity'],
      overallScore: 5,
      detailedFeedback: 'Session completed. Keep practicing coding problems to improve your skills.',
    });
  }
}
