import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: {
    name?: string;
    content: string;
  }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

export interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export const executePythonCode = async (code: string): Promise<PistonExecuteResponse> => {
  try {
    const response = await axios.post<PistonExecuteResponse>(
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
      } as PistonExecuteRequest
    );

    return response.data;
  } catch (error) {
    console.error('Piston API error:', error);
    throw new Error('Failed to execute code');
  }
};

export const getRuntimes = async () => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch runtimes:', error);
    throw error;
  }
};
