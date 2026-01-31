import { useState } from 'react';
import InterviewPanel from './components/InterviewPanel';
import { problems, getDefaultProblem } from './data/problems';
import { Brain } from 'lucide-react';
import './App.css';

function App() {
  const [currentProblem, setCurrentProblem] = useState(getDefaultProblem());

  const handleProblemChange = (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId);
    if (problem) {
      setCurrentProblem(problem);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <Brain size={32} />
          <h1>AI Interview Coach</h1>
        </div>
        <div className="problem-selector">
          <label htmlFor="problem-select">Problem:</label>
          <select
            id="problem-select"
            value={currentProblem.id}
            onChange={(e) => handleProblemChange(e.target.value)}
          >
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title} ({problem.difficulty})
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="app-main">
        <InterviewPanel problem={currentProblem} onProblemChange={handleProblemChange} />
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
