import { useState, useEffect } from 'react';
import AriaAvatar from '../../components/AriaAvatar.jsx';
import { getStudentLessonById } from '../../core/AriaEngine.js';
import { getAriaResponse } from '../../core/MentorScript.js';
import ProgressStore from '../../core/ProgressStore.js';
import QuizCard from './components/QuizCard.jsx';
import PhishingSimulator from './components/PhishingSimulator.jsx';
import CaseStudyCard from './components/CaseStudyCard.jsx';
import CertificateModal from './components/CertificateModal.jsx';
import './StudentPath.css';

export default function StudentPath({
  lessonId,
  phase,
  ariaMessage,
  progress,
  onPhaseChange,
  onBack,
  onLessonComplete,
}) {
  const lesson = getStudentLessonById(lessonId);
  const quizDone = progress.passedPracticals?.includes(lessonId);
  const [quizFeedback, setQuizFeedback] = useState(quizDone ? 'Already cleared.' : '');
  const [showCertificate, setShowCertificate] = useState(false);
  const isLastLesson = lesson?.order === 10;

  useEffect(() => {
    if (isLastLesson && phase === 'complete') {
      setShowCertificate(true);
    }
  }, [isLastLesson, phase]);

  if (!lesson) {
    return (
      <div className="student-path">
        <p className="text-muted">Lesson not found.</p>
        <button type="button" className="btn" onClick={onBack}>Back to dashboard</button>
      </div>
    );
  }

  const phaseSteps = isLastLesson
    ? [
        { id: 'intro', label: 'Intro' },
        { id: 'concept', label: 'Concept' },
        { id: 'practical', label: 'Practical' },
        { id: 'complete', label: 'Complete' },
      ]
    : [
        { id: 'intro', label: 'Intro' },
        { id: 'concept', label: 'Concept' },
        { id: 'quiz', label: 'Quiz' },
        { id: 'complete', label: 'Complete' },
      ];

  return (
    <div className="student-path">
      <header className="student-path__header">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="student-path__meta">
          <span className="mono text-violet">Lesson {String(lesson.order).padStart(2, '0')}</span>
          <h1>{lesson.title}</h1>
          <p className="text-muted">{lesson.subtitle}</p>
        </div>
        <PhasePills steps={phaseSteps} phase={phase} />
      </header>

      <section className="student-path__aria glass glass--strong">
        <AriaAvatar message={ariaMessage} speaking compact />
      </section>

      <section className="student-path__stage glass glass--strong">
        {phase === 'intro' && (
          <IntroPhase
            lesson={lesson}
            onContinue={() =>
              onPhaseChange({
                lessonPhase: 'concept',
                ariaMessage: getAriaResponse({ lessonId, state: 'concept' }),
              })
            }
          />
        )}
        {phase === 'concept' && (
          <ConceptPhase
            lesson={lesson}
            onContinue={() =>
              onPhaseChange({
                lessonPhase: isLastLesson ? 'practical' : 'quiz',
                ariaMessage: getAriaResponse({ lessonId, state: 'practical_prompt' }),
              })
            }
          />
        )}
        {phase === 'quiz' && !isLastLesson && (
          <QuizPhase
            lesson={lesson}
            lessonId={lessonId}
            quizFeedback={quizFeedback}
            setQuizFeedback={setQuizFeedback}
            onContinue={() => {
              const result = ProgressStore.completeLesson(lessonId);
              onLessonComplete?.(result);
              onPhaseChange({
                lessonPhase: 'complete',
                ariaMessage: getAriaResponse({ lessonId, state: 'complete' }),
              });
            }}
          />
        )}
        {phase === 'practical' && isLastLesson && (
          <PracticalPhase
            lesson={lesson}
            lessonId={lessonId}
            onContinue={() => {
              const result = ProgressStore.completeLesson(lessonId);
              onLessonComplete?.(result);
              onPhaseChange({
                lessonPhase: 'complete',
                ariaMessage: getAriaResponse({ lessonId, state: 'complete' }),
              });
            }}
          />
        )}
        {phase === 'complete' && (
          <CompletePhase lesson={lesson} onBack={onBack} />
        )}
      </section>

      {showCertificate && (
        <CertificateModal
          studentName="Student"
          xp={progress.xp}
          rank={progress.rank?.current || progress.rank}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

function PhasePills({ steps, phase }) {
  const idx = steps.findIndex((s) => s.id === phase);
  return (
    <div className="phase-pills" aria-label="Lesson progress">
      {steps.map((s, i) => (
        <span
          key={s.id}
          className={`phase-pill ${i <= idx ? 'is-active' : ''} ${s.id === phase ? 'is-current' : ''}`}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}

function IntroPhase({ lesson, onContinue }) {
  return (
    <div className="phase">
      <h2>Why this matters</h2>
      <p className="phase__lead text-muted">
        ARIA opens with real-world threats before the defense. Read carefully — the quiz builds on this.
      </p>
      <ul className="takeaway-list">
        {lesson.takeaways.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <button type="button" className="btn btn--primary" onClick={onContinue}>
        Continue to concepts →
      </button>
    </div>
  );
}

function ConceptPhase({ lesson, onContinue }) {
  return (
    <div className="phase">
      <h2>Concept map</h2>
      <div className="concept-grid">
        {lesson.concepts.map((c) => (
          <article key={c.title} className="concept-card glass">
            <h3>{c.title}</h3>
            <p className="text-muted">{c.body}</p>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn--primary" onClick={onContinue}>
        {lesson.quiz ? 'Start quiz →' : lesson.id === 'case_studies' ? 'Examine case studies →' : 'Start practical →'}
      </button>
    </div>
  );
}

function QuizPhase({ lesson, lessonId, quizFeedback, setQuizFeedback, onContinue }) {
  const [passed, setPassed] = useState(false);

  const handlePassed = (msg) => {
    setPassed(true);
    setQuizFeedback(msg);
  };

  return (
    <div className="phase">
      <h2>Knowledge check</h2>
      {lesson.quiz && (
        <QuizCard
          lessonId={lessonId}
          quiz={lesson.quiz}
          onPassed={handlePassed}
        />
      )}
      {passed && (
        <p className="phase__feedback is-ok">{quizFeedback}</p>
      )}
      <div className="phase__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!passed}
          onClick={onContinue}
        >
          Complete lesson (+50 XP) →
        </button>
      </div>
    </div>
  );
}

function PracticalPhase({ lesson, lessonId, onContinue }) {
  const [simComplete, setSimComplete] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimComplete = (r) => {
    setResult(r);
    setSimComplete(true);
  };

  return (
    <div className="phase">
      <h2>Phishing simulation</h2>
      <PhishingSimulator onComplete={handleSimComplete} />

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <p className={`phase__feedback ${result.correct === result.total ? 'is-ok' : ''}`}
             style={result.correct < result.total ? { color: '#ff8f8f' } : {}}>
            You identified {result.correct}/{result.total} messages correctly.
          </p>
        </div>
      )}

      <h2 style={{ marginTop: '1.5rem' }}>Case studies</h2>
      <CaseStudyCard onReflection={() => setReflectionDone(true)} />

      <div className="phase__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!simComplete || !reflectionDone}
          onClick={onContinue}
        >
          Complete lesson (+50 XP) →
        </button>
      </div>
    </div>
  );
}

function CompletePhase({ lesson, onBack }) {
  return (
    <div className="phase phase--complete">
      <div className="complete-burst text-gold">Lesson secured</div>
      <h2>{lesson.title}</h2>
      <p className="text-muted">XP awarded. Next lesson unlocks on the dashboard if any remain.</p>
      <ul className="takeaway-list">
        {lesson.takeaways.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <button type="button" className="btn btn--primary" onClick={onBack}>
        Return to dashboard →
      </button>
    </div>
  );
}
