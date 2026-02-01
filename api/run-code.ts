import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  telemetry?: {
    timestamp: number;
    latency: number;
    service: string;
  };
}

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
    const startTime = Date.now();
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    console.log('[run-code] Executing code via Piston API');

    // Execute code using Piston API
    const response = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
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
      },
      {
        timeout: 15000,
      }
    );

    const latency = Date.now() - startTime;
    const result = response.data;
    const output = result.run.stdout || result.run.stderr || result.run.output;
    const hasError = result.run.code !== 0;

    const executionResult: ExecutionResult = {
      success: !hasError,
      output: output.trim(),
      error: hasError ? (result.run.stderr || 'Execution failed') : undefined,
      executionTime: latency,
      telemetry: {
        timestamp: Date.now(),
        latency,
        service: 'piston',
      },
    };

    console.log(`[run-code] Success - Latency: ${latency}ms`, executionResult);

    return res.status(200).json(executionResult);
  } catch (error: any) {
    const latency = Date.now() - (error.startTime || Date.now());
    console.error('[run-code] Error:', {
      message: error.message,
      code: error.code,
      latency,
    });

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Code execution timed out',
        executionTime: latency,
        telemetry: {
          timestamp: Date.now(),
          latency,
          service: 'piston',
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute code',
      executionTime: latency,
      telemetry: {
        timestamp: Date.now(),
        latency,
        service: 'piston',
      },
    });
  }
}
