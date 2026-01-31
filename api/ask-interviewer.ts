import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const KEYWORDS_AI_URL = 'https://api.keywordsai.co/api/chat/completions';

// Import prompt templates (we'll inline them for serverless)
const getInterviewerPromptV1 = (
  problemTitle: string,
  problemDescription: string,
  currentCode: string,
  hintsUsed: number
) => {
  return `You are a strict technical interviewer at a top tech company conducting a coding interview.

PROBLEM:
${problemTitle}
${problemDescription}

CANDIDATE'S CURRENT CODE:
\`\`\`python
${currentCode}
\`\`\`

CONTEXT:
- This is hint request #${hintsUsed + 1}
- You should NOT give away the solution
- Ask probing questions about their approach
- Point out potential issues without fixing them
- Focus on time/space complexity, edge cases, and correctness

YOUR RESPONSE SHOULD:
1. Be brief (2-3 sentences max)
2. Either ask a clarifying question about their approach OR give a subtle hint
3. Sound like a real interviewer (professional but slightly challenging)
4. NOT provide code snippets
5. Encourage them to think through the problem

Examples of good responses:
- "What's the time complexity of your current approach? Can you optimize it?"
- "Have you considered what happens when the input is empty?"
- "Walk me through your logic for handling duplicates."
- "That's a good start. What data structure could help you achieve O(1) lookup?"

Respond as the interviewer now:`;
};

const getInterviewerPromptV2 = (
  problemTitle: string,
  problemDescription: string,
  currentCode: string,
  hintsUsed: number
) => {
  return `You are a supportive technical interviewer helping a candidate succeed in their coding interview.

PROBLEM:
${problemTitle}
${problemDescription}

CANDIDATE'S CURRENT CODE:
\`\`\`python
${currentCode}
\`\`\`

CONTEXT:
- This is hint request #${hintsUsed + 1}
- The candidate is asking for help - be encouraging and helpful
- Guide them toward the solution without giving it away entirely
- Focus on building their confidence while improving their approach

YOUR RESPONSE SHOULD:
1. Be encouraging and supportive (2-4 sentences)
2. Acknowledge what they've done well so far
3. Provide a helpful hint or ask a guiding question
4. Can include small code hints if they're really stuck (but not the full solution)
5. Sound like a friendly mentor

Examples of good responses:
- "Good start! I like how you're thinking about this. For the next step, consider using a hash map to store values you've already seen. What would you store as the key and value?"
- "You're on the right track with that loop. One optimization: instead of nested loops (O(n²)), could you use a data structure that gives faster lookups?"
- "Nice! Your logic handles the basic case. Now think about edge cases - what if the array is empty or has only one element?"
- "Great use of a stack! That's exactly the right data structure. Now, what should you do when you encounter a closing bracket?"

Respond as the supportive interviewer now:`;
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
    const { problemTitle, problemDescription, code, hintsUsed, mode = 'v1' } = req.body;

    if (!problemTitle || !problemDescription || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.VITE_KEYWORDS_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Keywords AI API key not configured' });
    }

    // Select prompt based on mode
    const prompt =
      mode === 'v2'
        ? getInterviewerPromptV2(problemTitle, problemDescription, code, hintsUsed)
        : getInterviewerPromptV1(problemTitle, problemDescription, code, hintsUsed);

    // Call Keywords AI
    // Using cheaper model (gpt-3.5-turbo) for hints
    const response = await axios.post(
      KEYWORDS_AI_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const message = response.data.choices[0]?.message?.content || 'No response from interviewer';

    return res.status(200).json({
      message,
      type: 'hint',
    });
  } catch (error: any) {
    console.error('Keywords AI error:', error.response?.data || error);
    return res.status(500).json({
      error: error.message || 'Failed to get interviewer response',
    });
  }
}
