import { getNextLesson, isLessonUnlocked, getStudentLessons } from '../../../core/AriaEngine.js';
import LessonCard from '../../../components/LessonCard.jsx';

export default function ContinueLearningCard({ progress, onOpenLesson }) {
  const next = getNextLesson(progress);
  const allLessons = getStudentLessons();
  const availableCount = allLessons.filter(l => isLessonUnlocked(l.id, progress) && !progress.completedLessons?.includes(l.id) && !l.stub).length;

  return (
    <div className="sd-panel glass glass--strong">
      <h2 className="sd-panel__title">Continue Learning</h2>
      {next && !next.stub ? (
        <LessonCard
          lesson={next}
          status="available"
          recommended
          onClick={() => onOpenLesson(next.id)}
        />
      ) : next && next.stub ? (
        <div className="sd-empty-state">
          <div className="sd-empty-state__icon text-muted" aria-hidden="true">⏳</div>
          <p className="sd-empty-state__text text-muted">
            New lessons are being prepared. Check back soon.
          </p>
        </div>
      ) : (
        <div className="sd-empty-state">
          <div className="sd-empty-state__icon text-gold" aria-hidden="true">★</div>
          <p className="sd-empty-state__text text-muted">
            Path complete. Review any topic to reinforce the material.
          </p>
        </div>
      )}
      {availableCount > 1 && next && (
        <p className="text-muted sd-continue-hint">
          {availableCount - 1} more lesson{availableCount - 1 !== 1 ? 's' : ''} available
        </p>
      )}
    </div>
  );
}
