import { useMemo, useState, useEffect } from 'react';
import AriaAvatar from '../../components/AriaAvatar.jsx';
import { getLessonById } from '../../core/AriaEngine.js';
import { getAriaResponse } from '../../core/MentorScript.js';
import ProgressStore from '../../core/ProgressStore.js';
import './DeveloperPath.css';

/**
 * Full lesson flow: intro → concept → practical → complete (+ XP).
 */
export default function DeveloperPath({
  lessonId,
  phase,
  ariaMessage,
  progress,
  onPhaseChange,
  onBack,
  onLessonComplete,
}) {
  const lesson = getLessonById(lessonId);
  const practicalDone = progress.passedPracticals.includes(lessonId);

  if (!lesson) {
    return (
      <div className="dev-path">
        <p className="text-muted">Lesson not found.</p>
        <button type="button" className="btn" onClick={onBack}>Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="dev-path">
      <header className="dev-path__header">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="dev-path__meta">
          <span className="mono text-violet">Lesson {String(lesson.order).padStart(2, '0')}</span>
          <h1>{lesson.title}</h1>
          <p className="text-muted">{lesson.subtitle}</p>
        </div>
        <PhasePills phase={phase} />
      </header>

      <section className="dev-path__aria glass glass--strong">
        <AriaAvatar message={ariaMessage} speaking compact />
      </section>

      <section className="dev-path__stage glass glass--strong">
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
                lessonPhase: 'practical',
                ariaMessage: getAriaResponse({ lessonId, state: 'practical_prompt' }),
              })
            }
          />
        )}
        {phase === 'practical' && (
          <PracticalPhase
            lesson={lesson}
            alreadyPassed={practicalDone}
            onPassed={(msg) => {
              onPhaseChange({ lessonPhase: 'practical', ariaMessage: msg });
            }}
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
    </div>
  );
}

function PhasePills({ phase }) {
  const steps = [
    { id: 'intro', label: 'Intro' },
    { id: 'concept', label: 'Concept' },
    { id: 'practical', label: 'Practical' },
    { id: 'complete', label: 'Complete' },
  ];
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
        ARIA opens with the threat model before the mechanics. Read carefully — the practical builds on this.
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
        Start practical →
      </button>
    </div>
  );
}

function PracticalPhase({ lesson, alreadyPassed, onPassed, onContinue }) {
  const p = lesson.practical;
  const [passed, setPassed] = useState(alreadyPassed);
  const [feedback, setFeedback] = useState(alreadyPassed ? 'Already cleared — continue when ready.' : '');
  const [error, setError] = useState(false);

  const handlePass = (successMsg) => {
    if (!passed) {
      const result = ProgressStore.completePractical(lesson.id);
      const msg =
        successMsg ||
        getAriaResponse({ lessonId: lesson.id, state: 'practical_success' });
      setPassed(true);
      setError(false);
      setFeedback(result.alreadyDone ? 'Already cleared.' : `${msg} (+${result.awarded} XP)`);
      onPassed(msg);
    }
  };

  return (
    <div className="phase">
      <h2>Practical check</h2>
      <p className="phase__lead">{p.prompt}</p>

      {p.type === 'command' && (
        <CommandCheck practical={p} onPass={handlePass} passed={passed} setError={setError} setFeedback={setFeedback} lessonId={lesson.id} />
      )}
      {p.type === 'jwt_inspect' && (
        <JwtCheck practical={p} onPass={handlePass} passed={passed} setError={setError} setFeedback={setFeedback} lessonId={lesson.id} />
      )}
      {p.type === 'lockout_sim' && (
        <LockoutSim practical={p} onPass={handlePass} passed={passed} setError={setError} setFeedback={setFeedback} lessonId={lesson.id} />
      )}
      {p.type === 'code_compare' && (
        <CodeCompare practical={p} onPass={handlePass} passed={passed} setError={setError} setFeedback={setFeedback} lessonId={lesson.id} />
      )}
      {p.type === 'checklist' && (
        <ChecklistCheck
          practical={p}
          onPass={handlePass}
          passed={passed}
          lessonId={lesson.id}
        />
      )}

      {feedback && (
        <p className={`phase__feedback ${error ? 'is-error' : 'is-ok'}`}>{feedback}</p>
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

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

function matchesAnswer(input, practical) {
  const n = normalize(input);
  const accepts = practical.accepts || [practical.answer];
  return accepts.some((a) => normalize(a) === n);
}

function CommandCheck({ practical, onPass, passed, setError, setFeedback, lessonId }) {
  const [value, setValue] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (passed) return;
    if (matchesAnswer(value, practical)) {
      onPass(getAriaResponse({ lessonId, state: 'practical_success' }));
      setFeedback(practical.successNote);
      setError(false);
    } else {
      setError(true);
      setFeedback(getAriaResponse({ key: 'practical_fail' }));
    }
  };
  return (
    <form className="check-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="cmd-input">Command</label>
      <input
        id="cmd-input"
        className="check-input mono"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={practical.placeholder}
        disabled={passed}
        autoComplete="off"
        spellCheck={false}
      />
      <button type="submit" className="btn" disabled={passed || !value.trim()}>
        Run check
      </button>
    </form>
  );
}

function JwtCheck({ practical, onPass, passed, setError, setFeedback, lessonId }) {
  const [value, setValue] = useState('');
  const decoded = useMemo(() => {
    try {
      const mid = practical.jwt.split('.')[1];
      const json = atob(mid.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [practical.jwt]);

  const submit = (e) => {
    e.preventDefault();
    if (passed) return;
    if (matchesAnswer(value, practical)) {
      onPass(getAriaResponse({ lessonId, state: 'practical_success' }));
      setFeedback(practical.successNote);
      setError(false);
    } else {
      setError(true);
      setFeedback(getAriaResponse({ key: 'practical_fail' }));
    }
  };

  return (
    <div>
      <div className="jwt-box mono">
        <div className="jwt-box__label text-muted">Demo JWT</div>
        <code>{practical.jwt}</code>
      </div>
      {decoded && (
        <pre className="jwt-decoded mono glass">{JSON.stringify(decoded, null, 2)}</pre>
      )}
      <form className="check-form" onSubmit={submit}>
        <input
          className="check-input mono"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={practical.placeholder}
          disabled={passed}
          autoComplete="off"
        />
        <button type="submit" className="btn" disabled={passed || !value.trim()}>
          Verify sub
        </button>
      </form>
    </div>
  );
}

function LockoutSim({ practical, onPass, passed, setError, setFeedback, lessonId }) {
  const threshold = practical.threshold || 5;
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [delayMs, setDelayMs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState('');

  const failLogin = async () => {
    if (busy || locked || passed) return;
    setBusy(true);
    const next = attempts + 1;
    const delay = Math.min(200 * next, 1200);
    setDelayMs(delay);
    await new Promise((r) => setTimeout(r, delay));
    setAttempts(next);
    if (next >= threshold) {
      setLocked(true);
      setFeedback(`Account locked after ${next} failures. Progressive delay peaked at ${delay}ms.`);
      setError(false);
    } else {
      setFeedback(`Failed attempt ${next}. Server delay: ${delay}ms (progressive slowdown).`);
      setError(false);
    }
    setBusy(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (passed) return;
    if (!locked) {
      setError(true);
      setFeedback('Trigger the lockout first — then report the failure count.');
      return;
    }
    if (matchesAnswer(answer, practical)) {
      onPass(getAriaResponse({ lessonId, state: 'practical_success' }));
      setFeedback(practical.successNote);
      setError(false);
    } else {
      setError(true);
      setFeedback(getAriaResponse({ key: 'practical_fail' }));
    }
  };

  return (
    <div className="lockout-sim">
      <div className="lockout-sim__panel glass">
        <div className="lockout-sim__status">
          <span className="text-muted">Simulated login</span>
          <strong className={locked ? 'text-gold' : ''}>
            {locked ? 'LOCKED' : 'OPEN'}
          </strong>
        </div>
        <p className="text-muted mono" style={{ fontSize: '0.85rem' }}>
          attempts={attempts} · lastDelay={delayMs}ms · threshold=?
        </p>
        <button type="button" className="btn" onClick={failLogin} disabled={busy || locked || passed}>
          {busy ? 'Waiting…' : locked ? 'Locked out' : 'Submit wrong password'}
        </button>
      </div>
      <form className="check-form" onSubmit={submit}>
        <input
          className="check-input mono"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={practical.placeholder}
          disabled={passed}
        />
        <button type="submit" className="btn" disabled={passed || !answer.trim()}>
          Confirm threshold
        </button>
      </form>
    </div>
  );
}

function CodeCompare({ practical, onPass, passed, setError, setFeedback, lessonId }) {
  const [value, setValue] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (passed) return;
    if (matchesAnswer(value, practical)) {
      onPass(getAriaResponse({ lessonId, state: 'practical_success' }));
      setFeedback(practical.successNote);
      setError(false);
    } else {
      setError(true);
      setFeedback(getAriaResponse({ key: 'practical_fail' }));
    }
  };

  return (
    <div className="code-compare">
      <div className="code-compare__cols">
        <div>
          <div className="code-label text-muted">Vulnerable</div>
          <pre className="code-block mono is-bad">
            {practical.vulnerable.map((line, i) => (
              <div key={i}>
                <span className="code-ln">{i + 1}</span>
                {line}
              </div>
            ))}
          </pre>
        </div>
        <div>
          <div className="code-label text-muted">Fixed</div>
          <pre className="code-block mono is-good">
            {practical.fixed.map((line, i) => (
              <div key={i}>
                <span className="code-ln">{i + 1}</span>
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>
      <form className="check-form" onSubmit={submit}>
        <input
          className="check-input mono"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={practical.placeholder}
          disabled={passed}
        />
        <button type="submit" className="btn" disabled={passed || !value.trim()}>
          Submit
        </button>
      </form>
    </div>
  );
}

function ChecklistCheck({ practical, onPass, passed, lessonId }) {
  const [checked, setChecked] = useState(() => practical.items.map(() => false));

  useEffect(() => {
    if (passed) {
      setChecked(practical.items.map(() => true));
    }
  }, [passed, practical.items]);

  const toggle = (i) => {
    if (passed) return;
    const next = checked.map((v, idx) => (idx === i ? !v : v));
    setChecked(next);
    if (next.every(Boolean)) {
      onPass(getAriaResponse({ lessonId, state: 'practical_success' }));
    }
  };

  return (
    <ul className="checklist">
      {practical.items.map((item, i) => (
        <li key={item}>
          <label className="checklist__item">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              disabled={passed}
            />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
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
