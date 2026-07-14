import { useState } from 'react';
import AriaAvatar from '../../components/AriaAvatar.jsx';
import RosterTable from './components/RosterTable.jsx';
import StudentDetailDrawer from './components/StudentDetailDrawer.jsx';
import ClassAnalytics from './components/ClassAnalytics.jsx';
import AriaInsightBar from './components/AriaInsightBar.jsx';
import './LecturerPath.css';

const SCREENS = {
  ROSTER: 'roster',
  ANALYTICS: 'analytics',
};

export default function LecturerPath({ onBack }) {
  const [screen, setScreen] = useState(SCREENS.ROSTER);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const classroomId = 'cs_4th_year';

  return (
    <div className="lecturer-path">
      <header className="lecturer-path__header">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="lecturer-path__meta">
          <span className="mono text-violet">Lecturer Console</span>
          <h1>CS 4th Year — Cybersecurity Intro</h1>
          <p className="text-muted">Classroom tools and cohort progress for educators running the Academy</p>
        </div>
        <nav className="lecturer-path__tabs">
          <button
            type="button"
            className={`lecturer-tab ${screen === SCREENS.ROSTER ? 'is-active' : ''}`}
            onClick={() => setScreen(SCREENS.ROSTER)}
          >
            Roster
          </button>
          <button
            type="button"
            className={`lecturer-tab ${screen === SCREENS.ANALYTICS ? 'is-active' : ''}`}
            onClick={() => setScreen(SCREENS.ANALYTICS)}
          >
            Analytics
          </button>
        </nav>
      </header>

      <section className="lecturer-path__aria glass glass--strong">
        <AriaAvatar
          message="I'm monitoring your classroom. Select a student or view analytics for cohort insights."
          speaking
          compact
        />
      </section>

      <AriaInsightBar classroomId={classroomId} />

      <section className="lecturer-path__stage glass glass--strong">
        {screen === SCREENS.ROSTER && (
          <RosterTable
            classroomId={classroomId}
            onSelectStudent={setSelectedStudentId}
          />
        )}
        {screen === SCREENS.ANALYTICS && (
          <ClassAnalytics classroomId={classroomId} />
        )}
      </section>

      {selectedStudentId && (
        <StudentDetailDrawer
          studentId={selectedStudentId}
          classroomId={classroomId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
}
