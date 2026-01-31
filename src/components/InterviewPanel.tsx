import { useState } from 'react';
import { Play, HelpCircle, CheckSquare, Loader2, Terminal } from 'lucide-react';
import CodeEditor from './CodeEditor';
import FeedbackPanel from './FeedbackPanel';
import type { Problem, SessionFeedback, InterviewerHint } from '../types/index';
import axios from 'axios';

interface InterviewPanelProps {
  problem: Problem;
  onProblemChange: (problemId: string) => void;
}

export default function InterviewPanel({ problem, onProblemChange }: InterviewPanelProps) {
  const [code, setCode] = useState(problem.starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAskingInterviewer, setIsAskingInterviewer] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [interviewerMessage, setInterviewerMessage] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [executionCount, setExecutionCount] = useState(0);
  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');

    try {
      const response = await axios.post('/api/run-code', { code });
      const result = response.data;

      if (result.success) {
        setOutput(`✓ Success\n\n${result.output}`);
      } else {
        setOutput(`✗ Error\n\n${result.error || result.output}`);
      }

      setExecutionCount((prev) => prev + 1);
    } catch (error: any) {
      setOutput(`✗ Execution Error\n\n${error.message || 'Failed to run code'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAskInterviewer = async () => {
    setIsAskingInterviewer(true);
    setInterviewerMessage('Thinking...');

    try {
      const mode = import.meta.env.VITE_INTERVIEWER_MODE || 'v1';

      const response = await axios.post('/api/ask-interviewer', {
        problemTitle: problem.title,
        problemDescription: problem.description,
        code,
        hintsUsed,
        mode,
      });

      setInterviewerMessage(response.data.message);
      setHintsUsed((prev) => prev + 1);
    } catch (error: any) {
      setInterviewerMessage('Failed to get interviewer response. Please try again.');
    } finally {
      setIsAskingInterviewer(false);
    }
  };

  const handleEndSession = async () => {
    setIsEndingSession(true);

    try {
      const response = await axios.post('/api/end-session', {
        problemTitle: problem.title,
        problemDescription: problem.description,
        code,
        hintsUsed,
        executionCount,
      });

      setFeedback(response.data);
      setShowFeedback(true);
    } catch (error: any) {
      alert('Failed to generate feedback. Please try again.');
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleNewInterview = () => {
    setCode(problem.starterCode);
    setOutput('');
    setInterviewerMessage('');
    setHintsUsed(0);
    setExecutionCount(0);
    setFeedback(null);
    setShowFeedback(false);
  };

  if (showFeedback && feedback) {
    return <FeedbackPanel feedback={feedback} onNewInterview={handleNewInterview} />;
  }

  return (
    <div className="interview-panel">
      <div className="interview-header">
        <div>
          <h1 className="problem-title">{problem.title}</h1>
          <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="session-stats">
          <span className="stat">Hints: {hintsUsed}</span>
          <span className="stat">Runs: {executionCount}</span>
        </div>
      </div>

      <div className="problem-description">
        <pre>{problem.description}</pre>
      </div>

      <div className="interview-workspace">
        <div className="editor-section">
          <div className="section-header">
            <h3>Your Solution</h3>
            <div className="editor-actions">
              <button
                className="btn btn-secondary"
                onClick={handleRunCode}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="spinning" size={18} />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>
          <CodeEditor code={code} onChange={handleCodeChange} />
        </div>

        <div className="output-section">
          <div className="section-header">
            <Terminal size={18} />
            <h3>Output</h3>
          </div>
          <div className="output-content">
            <pre>{output || 'Click "Run Code" to see output...'}</pre>
          </div>
        </div>
      </div>

      {interviewerMessage && (
        <div className="interviewer-message">
          <div className="message-header">
            <HelpCircle size={18} />
            <span>Interviewer</span>
          </div>
          <p>{interviewerMessage}</p>
        </div>
      )}

      <div className="interview-actions">
        <button
          className="btn btn-hint"
          onClick={handleAskInterviewer}
          disabled={isAskingInterviewer}
        >
          {isAskingInterviewer ? (
            <>
              <Loader2 className="spinning" size={18} />
              Asking...
            </>
          ) : (
            <>
              <HelpCircle size={18} />
              Ask Interviewer
            </>
          )}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleEndSession}
          disabled={isEndingSession}
        >
          {isEndingSession ? (
            <>
              <Loader2 className="spinning" size={18} />
              Ending...
            </>
          ) : (
            <>
              <CheckSquare size={18} />
              End Interview
            </>
          )}
        </button>
      </div>
    </div>
  );
}
