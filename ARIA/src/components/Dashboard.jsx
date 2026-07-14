import {
  ROLES,
  getDeveloperLessons,
  getStudentLessons,
  getNextLesson,
  isLessonUnlocked,
  getLessonProgress,
} from '../core/AriaEngine.js';
import AriaAvatar from './AriaAvatar.jsx';
import XPBar from './XPBar.jsx';
import BadgeGrid from './BadgeGrid.jsx';
import LessonCard from './LessonCard.jsx';
import './Dashboard.css';

const PATH_LABELS = {
  [ROLES.DEVELOPER]: 'Developer Path',
  [ROLES.STUDENT]: 'Student Path',
};

export default function Dashboard({ progress, ariaMessage, onOpenLesson, onReset }) {
  const isStudent = progress.role === ROLES.STUDENT;
  const lessons = isStudent ? getStudentLessons() : getDeveloperLessons();
  const next = getNextLesson(progress);
  const { completed, total, ratio } = getLessonProgress(progress);
  const ringPct = Math.round(ratio * 100);

  const statusFor = (lesson) => {
    if (progress.completedLessons.includes(lesson.id)) return 'completed';
    if (isLessonUnlocked(lesson.id, progress)) return 'available';
    return 'locked';
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <div className="dashboard__brand">
            <span className="dashboard__logo">ARIA</span>
            <span className="text-muted">{PATH_LABELS[progress.role] || 'Academy'}</span>
          </div>
          <h1 className="dashboard__title">Command Board</h1>
        </div>
        <div className="dashboard__header-actions">
          {onReset && (
            <button type="button" className="btn btn--ghost" onClick={onReset} title="Reset local progress">
              Reset demo
            </button>
          )}
        </div>
      </header>

      <section className="dashboard__aria glass glass--strong">
        <AriaAvatar message={ariaMessage} speaking compact />
      </section>

      <div className="dashboard__grid">
        <section className="dashboard__panel glass glass--strong dashboard__rank">
          <h2 className="dashboard__h2">Rank & XP</h2>
          <XPBar rank={progress.rank} xp={progress.xp} pulse={!!progress.celebrations?.pendingRankUp} />
        </section>

        <section className="dashboard__panel glass glass--strong dashboard__stats">
          <div className="stat-ring-wrap">
            <div
              className="stat-ring"
              style={{
                background: `conic-gradient(var(--aria-cyan) ${ringPct * 3.6}deg, rgba(255,255,255,0.08) 0)`,
              }}
            >
              <div className="stat-ring__inner">
                <strong>{completed}/{total}</strong>
                <span className="text-muted">lessons</span>
              </div>
            </div>
          </div>
          <div className="stat-block">
            <div className="stat-block__label text-muted">Login streak</div>
            <div className="stat-block__value">
              {progress.streak} <span className="text-muted">day{progress.streak === 1 ? '' : 's'}</span>
            </div>
          </div>
        </section>

        <section className="dashboard__panel glass glass--strong dashboard__next">
          <h2 className="dashboard__h2">Recommended next</h2>
          {next ? (
            <LessonCard
              lesson={next}
              status="available"
              recommended
              onClick={() => onOpenLesson(next.id)}
            />
          ) : (
            <p className="text-muted">Path complete. Review any lesson to reinforce the material.</p>
          )}
        </section>

        <section className="dashboard__panel glass glass--strong dashboard__challenge">
          <h2 className="dashboard__h2">Daily challenge</h2>
          <div className="challenge-card">
            <div className="challenge-card__tag text-violet">Stub · static for demo</div>
            {isStudent ? (
              <>
                <h3>Spot the phishing email</h3>
                <p className="text-muted">
                  You receive a 'Netflix' email from 'netflix-update@secure-login.tk'. Name the top three red flags.
                </p>
              </>
            ) : (
              <>
                <h3>Spot the weak cookie</h3>
                <p className="text-muted">
                  A session cookie ships without <code className="mono">HttpOnly</code>. Name the XSS risk in one sentence.
                </p>
              </>
            )}
            <p className="challenge-card__note text-muted">
              Full rotation lands after the path MVP. Completing lessons still awards real XP.
            </p>
          </div>
        </section>

        <section className="dashboard__panel glass glass--strong dashboard__lessons">
          <h2 className="dashboard__h2">Lessons</h2>
          <div className="dashboard__lesson-list">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                status={statusFor(lesson)}
                recommended={next?.id === lesson.id}
                onClick={() => onOpenLesson(lesson.id)}
              />
            ))}
          </div>
        </section>

        <section className="dashboard__panel glass glass--strong dashboard__badges">
          <h2 className="dashboard__h2">Badges</h2>
          <BadgeGrid earnedIds={progress.badges} />
        </section>
      </div>
    </div>
  );
}
