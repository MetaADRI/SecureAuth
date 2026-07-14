import XPBar from '../../../components/XPBar.jsx';

export default function LearningProgressPanel({ progress }) {
  const { completed, total, ratio } = (() => {
    const allLessons = [
      'intro_cybersecurity', 'password_security', 'two_factor_auth',
      'safe_browsing', 'phishing_social_engineering', 'web_app_security',
      'cryptography_basics', 'network_security', 'cybersecurity_best_practices',
      'case_studies',
    ];
    const total = allLessons.length;
    const completed = (progress.completedLessons || []).filter(id => allLessons.includes(id)).length;
    return { completed, total, ratio: total ? completed / total : 0 };
  })();

  const ringPct = Math.round(ratio * 100);

  return (
    <div className="sd-panel glass glass--strong">
      <h2 className="sd-panel__title">Learning Progress</h2>
      <XPBar rank={progress.rank} xp={progress.xp} pulse={!!progress.celebrations?.pendingRankUp} />
      <div className="sd-progress-stats">
        <div className="sd-stat-ring-wrap">
          <div
            className="sd-stat-ring"
            style={{
              background: `conic-gradient(var(--aria-cyan) ${ringPct * 3.6}deg, rgba(255,255,255,0.08) 0)`,
            }}
          >
            <div className="sd-stat-ring__inner">
              <strong>{completed}/{total}</strong>
              <span className="text-muted">topics</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-blocks">
          <div className="sd-stat-block">
            <div className="sd-stat-block__label text-muted">Completed</div>
            <div className="sd-stat-block__value">{completed}</div>
          </div>
          <div className="sd-stat-block">
            <div className="sd-stat-block__label text-muted">Login streak</div>
            <div className="sd-stat-block__value">
              {progress.streak}
              <span className="text-muted sd-stat-block__unit">d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
