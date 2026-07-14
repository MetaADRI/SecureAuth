import { useState } from 'react';
import ProgressStore from '../../../core/ProgressStore.js';
import { getAriaResponse } from '../../../core/MentorScript.js';

export default function QuizCard({ lessonId, quiz, onPassed }) {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [passed, setPassed] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;

  const handleSelect = (qId, optionIdx) => {
    if (passed) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCheck = (qId) => {
    if (passed) return;
    const q = quiz.questions.find((qq) => qq.id === qId);
    if (!q || answers[qId] === undefined) return;
    const correct = answers[qId] === q.correct;
    setFeedback((prev) => ({
      ...prev,
      [qId]: { correct, explanation: q.explanation },
    }));
  };

  const handleSubmitAll = () => {
    if (passed || awarded) return;
    const correctCount = quiz.questions.filter(
      (q) => answers[q.id] === q.correct
    ).length;
    const pct = correctCount / total;
    if (pct >= quiz.passThreshold) {
      const result = ProgressStore.completePractical(lessonId);
      setPassed(true);
      setAwarded(true);
      const msg = getAriaResponse({ lessonId, state: 'practical_success' });
      onPassed?.(`${msg} (+${result.awarded} XP)`);
    } else {
      setFeedback((prev) => ({
        ...prev,
        _submitError: `You got ${correctCount}/${total} correct (${Math.round(pct * 100)}%). Need at least ${Math.round(quiz.passThreshold * 100)}%. Review and try again.`,
      }));
    }
  };

  const allChecked = quiz.questions.every((q) => feedback[q.id] !== undefined);
  const canSubmit = answered === total && !allChecked && !passed;

  return (
    <div className="quiz-card">
      <h3 className="phase__lead">{quiz.prompt}</h3>

      {quiz.questions.map((q) => {
        const fb = feedback[q.id];
        const selected = answers[q.id];
        return (
          <div
            key={q.id}
            className={`quiz-question glass ${fb ? (fb.correct ? 'quiz-question--ok' : 'quiz-question--wrong') : ''}`}
          >
            <p className="quiz-question__text">{q.question}</p>
            <div className="quiz-question__options">
              {q.options.map((opt, i) => {
                let cls = 'quiz-option';
                if (passed || fb) {
                  if (i === q.correct) cls += ' quiz-option--correct';
                  else if (i === selected && !fb?.correct) cls += ' quiz-option--wrong';
                  else cls += ' quiz-option--dim';
                } else if (i === selected) {
                  cls += ' quiz-option--selected';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    onClick={() => handleSelect(q.id, i)}
                    disabled={!!fb || passed}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {!fb && selected !== undefined && (
              <button
                type="button"
                className="btn btn--ghost"
                style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => handleCheck(q.id)}
              >
                Check answer
              </button>
            )}
            {fb && (
              <p className={`quiz-question__explanation ${fb.correct ? 'text-cyan' : ''}`}
                 style={fb.correct ? {} : { color: '#ff8f8f' }}>
                {fb.explanation}
              </p>
            )}
          </div>
        );
      })}

      {feedback._submitError && (
        <p className="phase__feedback is-error">{feedback._submitError}</p>
      )}

      {passed && (
        <p className="phase__feedback is-ok">Quiz passed! You've earned your XP.</p>
      )}

      <div className="phase__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canSubmit}
          onClick={handleSubmitAll}
        >
          Submit all answers
        </button>
      </div>
    </div>
  );
}
