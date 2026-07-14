const STATS = [
  { key: 'students', label: 'Students Enrolled', emptyIcon: '👤', emptyText: '0 Enrolled' },
  { key: 'lessons', label: 'Lessons Created', emptyIcon: '📘', emptyText: '0 Created' },
  { key: 'assignments', label: 'Assignments Published', emptyIcon: '📋', emptyText: '0 Published' },
  { key: 'avgProgress', label: 'Average Student Progress', emptyIcon: '📊', emptyText: 'No data yet' },
  { key: 'completion', label: 'Course Completion Rate', emptyIcon: '🎯', emptyText: 'No data yet' },
  { key: 'active', label: 'Active Students', emptyIcon: '⚡', emptyText: '0 Active' },
];

export default function QuickStatsGrid({ stats }) {
  const hasData = stats && stats.students > 0;

  return (
    <div className="ld-stats-grid">
      {STATS.map((s) => {
        const value = stats ? stats[s.key] : 0;
        return (
          <div key={s.key} className="ld-stat-card glass--muted">
            {hasData ? (
              <>
                <div className="ld-stat-card__value">{value}</div>
                <div className="ld-stat-card__label">{s.label}</div>
              </>
            ) : (
              <div className="ld-stat-card__empty">
                <div className="ld-stat-card__empty-icon">{s.emptyIcon}</div>
                <div className="ld-stat-card__empty-text">{s.emptyText}</div>
                <div className="ld-stat-card__label">{s.label}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
