import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

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
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Execute code using Piston API
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: 'python',
      version: '3.10.0',
      files: [
        {
          content: code,
        },
      ],
      stdin: '',
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    });

    const result = response.data;

    // Format the response
    const output = result.run.stdout || result.run.stderr || result.run.output;
    const hasError = result.run.code !== 0;

    return res.status(200).json({
      success: !hasError,
      output: output.trim(),
      error: hasError ? (result.run.stderr || 'Execution failed') : undefined,
    });
  } catch (error: any) {
    console.error('Code execution error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute code',
    });
  }
}
