import { useState, useEffect } from 'react';
import InterviewPanel from './components/InterviewPanel';
import FeedbackPanel from './components/FeedbackPanel';
import { loadProblems, getDefaultProblem } from './data/problems';
import type { Problem, SessionFeedback } from './types/index';
import { Brain } from 'lucide-react';
import './App.css';

const DEMO_FEEDBACK: SessionFeedback = {
  overallScore: 8,
  detailedFeedback: "Excellent work on solving the Two Sum problem! You demonstrated strong problem-solving skills, understood the requirements well, and implemented an efficient solution with good time complexity. Your code was clean and readable. Consider using more descriptive variable names and adding comments for complex logic in future interviews.",
  strengths: [
    'Strong understanding of hash map data structures',
    'Efficient O(n) time complexity solution',
    'Clean and readable code with proper naming conventions',
    'Proactive testing with multiple test cases'
  ],
  weaknesses: [
    'Could have explained the edge cases more thoroughly',
    'Took a moment to decide between brute force and optimal approach'
  ],
  suggestedTopics: [
    'Two pointers technique for array problems',
    'Dynamic programming fundamentals',
    'Bit manipulation problems'
  ]
};

function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  // Load problems from Supabase on mount
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching problems from Supabase...');
        const data = await loadProblems();
        console.log('Received problems:', data.length);
        console.log('Problem data:', data);
        setProblems(data);
        if (data.length > 0) {
          console.log('Setting current problem to:', data[0]);
          setCurrentProblem(data[0]);
        } else {
          console.warn('No problems loaded, using default');
          const defaultProblem = getDefaultProblem();
          console.log('Default problem:', defaultProblem);
          setCurrentProblem(defaultProblem);
        }
      } catch (err) {
        console.error('Failed to fetch problems:', err);
        setError('Failed to load problems. Using fallback.');
        const fallback = getDefaultProblem();
        console.log('Using fallback problem:', fallback);
        setProblems([fallback]);
        setCurrentProblem(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleProblemChange = (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId);
    if (problem) {
      setCurrentProblem(problem);
    }
  };

  const handleDemoClick = () => {
    setShowDemo(!showDemo);
  };

  if (showDemo) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <Brain size={32} />
            <h1>AI Interview Coach</h1>
          </div>
          <button
            onClick={handleDemoClick}
            style={{
              padding: '0.5rem 1rem',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Exit Demo
          </button>
        </header>
        <main className="app-main">
          <FeedbackPanel
            feedback={DEMO_FEEDBACK}
            onNewInterview={handleDemoClick}
          />
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <Brain size={32} />
            <h1>AI Interview Coach</h1>
          </div>
        </header>
        <main className="app-main" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading problems...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <Brain size={32} />
          <h1>AI Interview Coach</h1>
        </div>
        <div className="problem-selector">
          <label htmlFor="problem-select">Problem:</label>
          {error && <span style={{ color: '#ff6b6b', marginRight: '0.5rem' }}>⚠ {error}</span>}
          <select
            id="problem-select"
            value={currentProblem?.id || ''}
            onChange={(e) => handleProblemChange(e.target.value)}
          >
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title} ({problem.difficulty})
              </option>
            ))}
          </select>
          <button
            onClick={handleDemoClick}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              background: '#4c6ef5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            🎤 Test Voice Demo
          </button>
        </div>
      </header>

      <main className="app-main">
        {currentProblem && (
          <InterviewPanel problem={currentProblem} onProblemChange={handleProblemChange} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a href="https://keywordsai.co" target="_blank" rel="noopener noreferrer">
            Keywords AI
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
