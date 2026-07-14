import { BADGES } from '../gamification/xpRules.js';
import './BadgeGrid.css';

/**
 * Badge grid — earned full color, locked greyed with "?"
 */
export default function BadgeGrid({ earnedIds = [] }) {
  const earned = new Set(earnedIds);

  return (
    <div className="badge-grid">
      {BADGES.map((badge) => {
        const unlocked = earned.has(badge.id);
        return (
          <div
            key={badge.id}
            className={`badge-card glass ${unlocked ? '' : 'badge-card--locked'}`}
            title={unlocked ? badge.description : 'Locked — keep learning'}
          >
            <div className="badge-card__icon" aria-hidden="true">
              {unlocked ? badge.icon : '?'}
            </div>
            <div className="badge-card__name">{unlocked ? badge.name : 'Locked'}</div>
            {unlocked && (
              <div className="badge-card__desc text-muted">{badge.description}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
