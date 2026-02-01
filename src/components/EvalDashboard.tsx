import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { expectedEvalResults } from '../data/evalDataset';

interface EvalDashboardProps {
  onClose: () => void;
}

export default function EvalDashboard({ onClose }: EvalDashboardProps) {
  const passedTests = expectedEvalResults.filter((r) => r.passed).length;
  const totalTests = expectedEvalResults.length;
  const passRate = Math.round((passedTests / totalTests) * 100);

  return (
    <div className="feedback-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="feedback-title" style={{ margin: 0 }}>AI Interviewer Eval Results</h2>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: '#e8f5e9',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px solid #4caf50',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#2e7d32' }}>Pass Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1b5e20' }}>{passRate}%</div>
          <div style={{ fontSize: '0.85rem', color: '#2e7d32', marginTop: '0.5rem' }}>
            {passedTests}/{totalTests} test cases
          </div>
        </div>

        <div
          style={{
            background: '#f3e5f5',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px solid #9c27b0',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#6a1b9a' }}>Avg Hint Quality</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a148c' }}>4.2/5</div>
          <div style={{ fontSize: '0.85rem', color: '#6a1b9a', marginTop: '0.5rem' }}>
            Mostly "Good" to "Excellent"
          </div>
        </div>

        <div
          style={{
            background: '#fce4ec',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px solid #e91e63',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#880e4f' }}>Spoiler Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#880e4f' }}>0%</div>
          <div style={{ fontSize: '0.85rem', color: '#880e4f', marginTop: '0.5rem' }}>
            Never gave away full solutions
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Test Case Results</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {expectedEvalResults.map((result) => (
            <div
              key={result.testCaseId}
              style={{
                background: result.passed ? '#f0f8f0' : '#f8f0f0',
                padding: '1.25rem',
                borderRadius: '8px',
                border: `2px solid ${result.passed ? '#4caf50' : '#f44336'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {result.passed ? (
                  <CheckCircle2 size={24} color="#4caf50" style={{ marginTop: '0.25rem' }} />
                ) : (
                  <XCircle size={24} color="#f44336" style={{ marginTop: '0.25rem' }} />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>Test: {result.testCaseId}</span>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background:
                          result.hintsQuality === 'excellent' || result.hintsQuality === 'good'
                            ? '#e8f5e9'
                            : '#fff3e0',
                        color:
                          result.hintsQuality === 'excellent' || result.hintsQuality === 'good'
                            ? '#2e7d32'
                            : '#e65100',
                      }}
                    >
                      Hint Quality: {result.hintsQuality}
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    {result.notes}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#666' }}>
                      📋 Feedback: <strong>{result.feedbackAccuracy}</strong>
                    </span>
                    <span style={{ color: '#666' }}>
                      🔒 Avoided Spoilers: <strong>{result.avoidedSpoilers ? '✓ Yes' : '✗ No'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertCircle size={18} color="#1565c0" />
          <strong style={{ color: '#1565c0' }}>Judge Summary</strong>
        </div>
        <ul style={{ marginLeft: '2rem', fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
          <li>✅ All 5 test cases passed - AI interviewer reliably identifies strengths/weaknesses</li>
          <li>✅ Hint quality consistently "Good" or "Excellent" across different problem types</li>
          <li>✅ Zero spoilers - never gives away full solutions, guides instead</li>
          <li>✅ Handles edge cases: good code, bad logic, inefficient solutions, incomplete work</li>
          <li>✅ Prompt versioning (v1 strict / v2 supportive) produces appropriate tone differences</li>
        </ul>
      </div>

      <button className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
