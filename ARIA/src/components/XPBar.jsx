import './XPBar.css';

/**
 * XP bar with current rank + next threshold.
 * pulse=true triggers celebrate glow.
 */
export default function XPBar({ rank, xp, pulse = false }) {
  const { current, next, progressInRank, xpToNext } = rank;
  const pct = Math.round(progressInRank * 100);

  return (
    <div className={`xp-bar ${pulse ? 'xp-pulse' : ''}`}>
      <div className="xp-bar__header">
        <div>
          <span className="xp-bar__rank">{current.name}</span>
          <span className="xp-bar__xp mono">{xp} XP</span>
        </div>
        <div className="xp-bar__next text-muted">
          {next ? (
            <>
              {xpToNext} XP → {next.name}
            </>
          ) : (
            <span className="text-gold">Max rank</span>
          )}
        </div>
      </div>
      <div className="xp-bar__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="xp-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
