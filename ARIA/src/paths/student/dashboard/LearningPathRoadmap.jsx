import { isLessonUnlocked, getStudentLessons } from '../../../core/AriaEngine.js';

const TOPIC_ICONS = {
  intro_cybersecurity: '🛡',
  password_security: '🔑',
  two_factor_auth: '📱',
  safe_browsing: '🌐',
  phishing_social_engineering: '🎣',
  web_app_security: '💻',
  cryptography_basics: '🔐',
  network_security: '🌍',
  cybersecurity_best_practices: '✓',
  case_studies: '📋',
};

export default function LearningPathRoadmap({ progress, onOpenLesson }) {
  const lessons = getStudentLessons();

  const statusFor = (lesson) => {
    if (lesson.stub) return 'stub';
    if (progress.completedLessons?.includes(lesson.id)) return 'completed';
    if (isLessonUnlocked(lesson.id, progress)) return 'available';
    return 'locked';
  };

  return (
    <div className="sd-panel glass glass--strong sd-roadmap">
      <h2 className="sd-panel__title">Learning Path</h2>
      <div className="sd-roadmap__path">
        {lessons.map((lesson, i) => {
          const status = statusFor(lesson);
          const isLast = i === lessons.length - 1;
          return (
            <div key={lesson.id} className="sd-roadmap__node-wrap">
              <button
                type="button"
                className={`sd-roadmap__node glass sd-roadmap__node--${status}`}
                disabled={status !== 'available'}
                onClick={() => onOpenLesson(lesson.id)}
              >
                <div className="sd-roadmap__node-icon" aria-hidden="true">
                  {status === 'completed' ? '✓' : status === 'stub' ? '⏳' : TOPIC_ICONS[lesson.id] || '○'}
                </div>
                <div className="sd-roadmap__node-info">
                  <div className="sd-roadmap__node-order mono">
                    Topic {lesson.order}
                    {status === 'stub' && <span className="sd-roadmap__node-tag text-muted">Coming soon</span>}
                    {status === 'completed' && <span className="sd-roadmap__node-tag sd-roadmap__node-tag--done">Done</span>}
                    {status === 'available' && <span className="sd-roadmap__node-tag sd-roadmap__node-tag--avail">Start</span>}
                    {status === 'locked' && <span className="sd-roadmap__node-tag sd-roadmap__node-tag--locked">Locked</span>}
                  </div>
                  <div className="sd-roadmap__node-title">{lesson.title}</div>
                  <div className="sd-roadmap__node-sub text-muted">{lesson.subtitle}</div>
                </div>
              </button>
              {!isLast && <div className="sd-roadmap__connector" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
