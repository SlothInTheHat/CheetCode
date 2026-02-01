import { ArrowLeft, Zap, Database } from 'lucide-react';
import type { TelemetryEntry } from '../lib/telemetry';

interface TelemetryPanelProps {
  telemetry: {
    hints: TelemetryEntry[];
    feedback: TelemetryEntry | null;
    executions: { timestamp: number; latency: number }[];
  };
  onBack: () => void;
}

export default function TelemetryPanel({ telemetry, onBack }: TelemetryPanelProps) {
  const calculateTotalCost = () => {
    const hintsCost = telemetry.hints.reduce((sum, h) => sum + h.estimatedCost, 0);
    const feedbackCost = telemetry.feedback?.estimatedCost || 0;
    return hintsCost + feedbackCost;
  };

  const calculateTotalTokens = () => {
    const hintsTokens = telemetry.hints.reduce((sum, h) => sum + h.totalTokens, 0);
    const feedbackTokens = telemetry.feedback?.totalTokens || 0;
    return hintsTokens + feedbackTokens;
  };

  const allTelemetryEntries = [...telemetry.hints, ...(telemetry.feedback ? [telemetry.feedback] : [])];

  return (
    <div className="feedback-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          Back
        </button>
        <h2 className="feedback-title" style={{ margin: 0 }}>Session Telemetry</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div
          style={{
            background: '#f0f0f0',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Session Cost</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            ${calculateTotalCost().toFixed(4)}
          </div>
        </div>
        <div
          style={{
            background: '#f0f0f0',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Tokens Used</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
            {calculateTotalTokens()}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={20} />
          AI API Calls ({allTelemetryEntries.length})
        </h3>

        {allTelemetryEntries.length === 0 ? (
          <p style={{ color: '#999' }}>No API calls yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {allTelemetryEntries.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  background: entry.success ? '#f8f9fa' : '#fff3cd',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${entry.success ? '#ddd' : '#ffc107'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    Call #{idx + 1} - {entry.type === 'hint' ? 'Ask Interviewer' : 'End Session'} ({entry.mode || 'N/A'})
                  </span>
                  <span style={{ color: entry.success ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                    {entry.success ? '✓ Success' : '✗ Failed'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#666' }}>Model:</span>
                    <div style={{ fontWeight: 'bold' }}>{entry.model}</div>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Tokens:</span>
                    <div style={{ fontWeight: 'bold' }}>
                      {entry.promptTokens} in / {entry.completionTokens} out
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Cost:</span>
                    <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                      ${entry.estimatedCost.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Latency:</span>
                    <div style={{ fontWeight: 'bold' }}>{entry.latency}ms</div>
                  </div>
                </div>

                {entry.error && (
                  <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Error: {entry.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {telemetry.executions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Database size={20} />
            Code Executions ({telemetry.executions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {telemetry.executions.map((exec, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8f9fa',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Execution #{idx + 1}</span>
                <span style={{ color: '#666' }}>Latency: {exec.latency}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
        <p style={{ margin: '0.5rem 0' }}>
          <strong>💡 Judge Notes:</strong>
        </p>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Model Routing: Hints use gpt-3.5-turbo (cheaper), feedback uses gpt-4 (stronger)</li>
          <li>Prompt Versioning: Switch between v1 (strict) and v2 (supportive) modes mid-interview</li>
          <li>Observability: Every AI interaction is logged with cost, tokens, and latency</li>
          <li>Cost Efficiency: Estimated costs shown for transparency and tracking</li>
        </ul>
      </div>

      <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '2rem' }}>
        <ArrowLeft size={18} />
        Back to Feedback
      </button>
    </div>
  );
}
