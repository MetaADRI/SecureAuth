import './LessonCard.css';

/**
 * Lesson card for dashboard / path list.
 */
export default function LessonCard({
  lesson,
  status = 'locked', // locked | available | completed
  onClick,
  recommended = false,
}) {
  const locked = status === 'locked';
  const done = status === 'completed';

  return (
    <button
      type="button"
      className={`lesson-card glass ${recommended ? 'glass--hot' : ''} ${locked ? 'lesson-card--locked' : ''} ${done ? 'lesson-card--done' : ''}`}
      onClick={onClick}
      disabled={locked}
    >
      <div className="lesson-card__top">
        <span className="lesson-card__order mono">
          {String(lesson.order).padStart(2, '0')}
        </span>
        {recommended && <span className="lesson-card__tag">Recommended</span>}
        {done && <span className="lesson-card__tag lesson-card__tag--done">Complete</span>}
        {locked && <span className="lesson-card__tag lesson-card__tag--locked">Locked</span>}
      </div>
      <h3 className="lesson-card__title">{lesson.title}</h3>
      <p className="lesson-card__sub text-muted">{lesson.subtitle}</p>
      <div className="lesson-card__meta text-muted">
        <span>{lesson.duration}</span>
        {!locked && !done && <span className="text-cyan">Start →</span>}
        {done && <span className="text-cyan">Review</span>}
      </div>
    </button>
  );
}
