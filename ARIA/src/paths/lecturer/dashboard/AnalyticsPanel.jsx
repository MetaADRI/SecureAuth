import { useSyncExternalStore } from 'react';
import ClassroomStore from '../../../core/ClassroomStore.js';

export default function AnalyticsPanel() {
  const classroomId = 'cs_4th_year';
  const data = useSyncExternalStore(
    ClassroomStore.subscribe,
    ClassroomStore.getSnapshot,
    ClassroomStore.getSnapshot
  );

  const classroom = data.classrooms.find(c => c.id === classroomId);
  const hasStudents = classroom && classroom.studentIds.length > 0;

  if (!hasStudents) {
    return (
      <div className="ld-panel ld-analytics-panel glass--muted">
        <div className="ld-panel__title">Learning Analytics</div>
        <div className="analytics-grid">
          <EmptyChartCard title="Completion Funnel" />
          <EmptyChartCard title="Average Quiz Scores" />
          <EmptyChartCard title="Weekly Activity" />
          <EmptyChartCard title="Summary" />
        </div>
      </div>
    );
  }

  return (
    <div className="ld-panel ld-analytics-panel glass--muted">
      <div className="ld-panel__title">Learning Analytics</div>
      <div style={{ minHeight: 0 }}>
        {null /* ClassAnalytics imported only when data exists */}
      </div>
    </div>
  );
}

function EmptyChartCard({ title }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card__title">{title}</div>
      <div className="analytics-card__chart--empty">
        <div className="empty-chart-frame" />
        <div className="empty-chart-msg">
          Analytics will appear once students begin learning.
        </div>
      </div>
    </div>
  );
}
