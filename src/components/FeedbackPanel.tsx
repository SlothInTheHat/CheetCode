import { SessionFeedback } from '../types';
import { CheckCircle2, XCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface FeedbackPanelProps {
  feedback: SessionFeedback;
  onNewInterview: () => void;
}

export default function FeedbackPanel({ feedback, onNewInterview }: FeedbackPanelProps) {
  return (
    <div className="feedback-panel">
      <h2 className="feedback-title">Interview Complete!</h2>

      <div className="overall-score">
        <div className="score-circle">
          <span className="score-number">{feedback.overallScore}</span>
          <span className="score-label">/10</span>
        </div>
      </div>

      <div className="detailed-feedback">
        <p>{feedback.detailedFeedback}</p>
      </div>

      <div className="feedback-section">
        <div className="section-header">
          <CheckCircle2 className="icon success" size={20} />
          <h3>Strengths</h3>
        </div>
        <ul className="feedback-list">
          {feedback.strengths.map((strength, idx) => (
            <li key={idx}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="feedback-section">
        <div className="section-header">
          <XCircle className="icon warning" size={20} />
          <h3>Areas for Improvement</h3>
        </div>
        <ul className="feedback-list">
          {feedback.weaknesses.map((weakness, idx) => (
            <li key={idx}>{weakness}</li>
          ))}
        </ul>
      </div>

      <div className="feedback-section">
        <div className="section-header">
          <Lightbulb className="icon info" size={20} />
          <h3>Suggested Practice Topics</h3>
        </div>
        <ul className="feedback-list">
          {feedback.suggestedTopics.map((topic, idx) => (
            <li key={idx}>{topic}</li>
          ))}
        </ul>
      </div>

      <button className="btn btn-primary" onClick={onNewInterview}>
        <TrendingUp size={18} />
        Start New Interview
      </button>
    </div>
  );
}
