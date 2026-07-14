import { useMemo } from 'react';
import ClassroomStore from '../../../core/ClassroomStore.js';

export default function ClassAnalytics({ classroomId }) {
  const dist = ClassroomStore.getCompletionDistribution(classroomId);
  const lessonAvgs = ClassroomStore.getLessonAverages(classroomId);
  const activity = ClassroomStore.getWeeklyActivity(classroomId);

  const maxDist = Math.max(...Object.values(dist), 1);
  const maxActivity = Math.max(...activity.map(w => w.active), 1);

  return (
    <div className="class-analytics">
      <div className="analytics-grid">
        <FunnelCard dist={dist} maxDist={maxDist} />
        <ScoreCard lessonAvgs={lessonAvgs} />
        <ActivityCard activity={activity} maxActivity={maxActivity} />
        <SummaryCard dist={dist} lessonAvgs={lessonAvgs} classroomId={classroomId} />
      </div>
    </div>
  );
}

function FunnelCard({ dist, maxDist }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return (
    <div className="analytics-card">
      <div className="analytics-card__title">Completion funnel</div>
      <div className="analytics-card__chart">
        {[0, 1, 2, 3, 4, 5].map(n => {
          const count = dist[n] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={n} className="funnel-bar">
              <span className="funnel-bar__label">{n}</span>
              <div className="funnel-bar__track">
                <div
                  className={`funnel-bar__fill funnel-bar__fill--${n}`}
                  style={{ width: `${pct}%` }}
                >
                  {count > 0 && count}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: '0.65rem', color: 'var(--aria-text-muted)', marginTop: '0.25rem' }}>
          Lessons completed (0–5) · {total} students
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ lessonAvgs }) {
  const maxScore = Math.max(...lessonAvgs.filter(a => a.avg != null).map(a => a.avg), 1);
  return (
    <div className="analytics-card">
      <div className="analytics-card__title">Average quiz score by lesson</div>
      <div className="analytics-card__chart">
        <div className="score-bars">
          {lessonAvgs.map(l => {
            if (l.avg == null) return null;
            const pct = (l.avg / 100) * 100;
            const cls = l.avg >= 80 ? 'high' : l.avg >= 50 ? 'mid' : 'low';
            return (
              <div key={l.lessonId} className="score-bar">
                <span className="score-bar__label">{l.label}</span>
                <div className="score-bar__track">
                  <div
                    className={`score-bar__fill score-bar__fill--${cls}`}
                    style={{ width: `${pct}%` }}
                  >
                    {Math.round(l.avg)}%
                  </div>
                </div>
              </div>
            );
          })}
          {lessonAvgs.every(l => l.avg == null) && (
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>No quiz data yet</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity, maxActivity }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card__title">Active students (14-week lookback)</div>
      <div className="analytics-card__chart">
        <div className="activity-chart">
          {activity.map((w, i) => {
            const pct = (w.active / maxActivity) * 100;
            const cls = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
            return (
              <div
                key={i}
                className={`activity-bar activity-bar__${cls}`}
                style={{ height: `${pct}%` }}
                title={`${w.label}: ${w.active}/${w.total} active`}
              />
            );
          })}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--aria-text-muted)', marginTop: '0.3rem', textAlign: 'center' }}>
          Weeks (active = logged in that week)
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ dist, lessonAvgs, classroomId }) {
  const stalled = ClassroomStore.getStalledStudents(classroomId, 6);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  const stalledCount = stalled.length;
  const completedCount = (dist[5] || 0);
  const lowest = lessonAvgs.filter(a => a.avg != null).sort((a, b) => a.avg - b.avg)[0];

  return (
    <div className="analytics-card">
      <div className="analytics-card__title">Summary</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Metric label="Total students" value={total} />
        <Metric label="Path complete" value={`${completedCount} student${completedCount !== 1 ? 's' : ''}`} />
        <Metric label="Stalled (6+ days)" value={`${stalledCount} student${stalledCount !== 1 ? 's' : ''}`} alert={stalledCount > 0} />
        {lowest && (
          <Metric
            label="Toughest lesson"
            value={`${lowest.label} (${Math.round(lowest.avg)}% avg)`}
          />
        )}
        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--aria-text-muted)', lineHeight: 1.5 }}>
          <strong className="text-cyan">Join code:</strong> CS4-SEC-2026
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, alert }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.85rem',
    }}>
      <span className="text-muted">{label}</span>
      <span style={{
        fontFamily: 'var(--aria-mono)',
        fontWeight: 600,
        color: alert ? 'rgba(255, 143, 143, 0.8)' : 'var(--aria-text)',
      }}>
        {value}
      </span>
    </div>
  );
}
