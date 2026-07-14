import { useMemo } from 'react';
import ClassroomStore from '../../../core/ClassroomStore.js';
import { getStudentLessons } from '../../../core/AriaEngine.js';

export default function StudentDetailDrawer({ studentId, classroomId, onClose }) {
  const student = ClassroomStore.getStudent(studentId);
  const scores = ClassroomStore.getStudentScores(studentId);
  const progress = ClassroomStore.getStudentProgress(studentId);
  const allLessons = getStudentLessons();

  const lessonMap = useMemo(() => {
    const map = {};
    allLessons.forEach(l => { map[l.id] = l; });
    return map;
  }, [allLessons]);

  const lessonRows = useMemo(() => {
    return allLessons.map(lesson => {
      const completed = student.completedLessons.includes(lesson.id);
      const score = scores.find(r => r.lessonId === lesson.id);
      const attemptCount = scores.filter(r => r.lessonId === lesson.id).length;
      return {
        ...lesson,
        completed,
        score: score ? score.score : null,
        attempts: attemptCount,
      };
    });
  }, [allLessons, student, scores]);

  if (!student) return null;

  const scoreColor = (s) => {
    if (s == null) return 'miss';
    if (s >= 80) return 'done';
    if (s >= 50) return 'partial';
    return 'miss';
  };

  function daysSince(d) {
    if (!d) return 999;
    return Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000);
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="student-drawer" role="dialog" aria-label={`${student.name} details`}>
        <button type="button" className="student-drawer__close" onClick={onClose}>
          ✕
        </button>

        <div className="student-drawer__name">{student.name}</div>
        <div className="student-drawer__email">{student.email}</div>

        <div className="student-drawer__stat-grid">
          <div className="student-drawer__stat">
            <div className="student-drawer__stat-value">{student.xp.toLocaleString()}</div>
            <div className="student-drawer__stat-label">Total XP</div>
          </div>
          <div className="student-drawer__stat">
            <div className="student-drawer__stat-value">{progress.percent}%</div>
            <div className="student-drawer__stat-label">Complete</div>
          </div>
          <div className="student-drawer__stat">
            <div className="student-drawer__stat-value">{student.streak}</div>
            <div className="student-drawer__stat-label">Day streak</div>
          </div>
        </div>

        <div className="student-drawer__stat-grid">
          <div className="student-drawer__stat">
            <div className="student-drawer__stat-value">{student.badges.length}</div>
            <div className="student-drawer__stat-label">Badges</div>
          </div>
          <div className="student-drawer__stat">
            <div className="student-drawer__stat-value">{daysSince(student.lastLoginDate)}d</div>
            <div className="student-drawer__stat-label">Since last login</div>
          </div>
          <div className="student-drawer__stat">
            <div className="student-drawer__stat-value">{student.completedLessons.length}/5</div>
            <div className="student-drawer__stat-label">Lessons done</div>
          </div>
        </div>

        <div className="student-drawer__section-title">Badges earned</div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {student.badges.length === 0 ? (
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>No badges yet</span>
          ) : (
            student.badges.map(b => (
              <span key={b} className="glass" style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                borderColor: 'var(--aria-gold-dim)',
                color: 'var(--aria-gold)',
              }}>
                {badgeLabel(b)}
              </span>
            ))
          )}
        </div>

        <div className="student-drawer__section-title">Lesson breakdown</div>
        <div className="lesson-breakdown">
          {lessonRows.map(row => (
            <div key={row.id} className="lesson-breakdown__row">
              <span className="lesson-breakdown__name">
                <span className={`lesson-breakdown__dot lesson-breakdown__dot--${scoreColor(row.score)}`} />
                {row.title}
              </span>
              <span className="lesson-breakdown__score">
                {row.score != null ? `${row.score}%` : row.completed ? 'Done' : '—'}
                {row.attempts > 1 && <small className="text-muted" style={{ marginLeft: '0.25rem' }}>(×{row.attempts})</small>}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function badgeLabel(id) {
  const map = {
    first_lesson: 'First Lesson',
    streak_3: '3-Day Streak',
    path_complete: 'Path Complete',
  };
  return map[id] || id;
}
