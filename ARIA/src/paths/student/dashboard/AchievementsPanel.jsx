import BadgeGrid from '../../../components/BadgeGrid.jsx';

export default function AchievementsPanel({ progress }) {
  const earnedCount = progress.badges?.length || 0;

  return (
    <div className="sd-panel glass glass--strong sd-achievements">
      <h2 className="sd-panel__title">
        Badges
        {earnedCount > 0 && <span className="sd-achievements__count text-muted">({earnedCount})</span>}
      </h2>
      {earnedCount > 0 ? (
        <BadgeGrid earnedIds={progress.badges} />
      ) : (
        <div className="sd-empty-state">
          <div className="sd-empty-state__icon text-muted" aria-hidden="true">◌</div>
          <p className="sd-empty-state__text text-muted">
            Complete your first lesson to earn a badge.
          </p>
        </div>
      )}
    </div>
  );
}
