import { useState, useSyncExternalStore } from 'react';
import ClassroomStore from '../../../core/ClassroomStore.js';
import RosterTable from '../components/RosterTable.jsx';
import StudentDetailDrawer from '../components/StudentDetailDrawer.jsx';

export default function StudentProgressPanel() {
  const classroomId = 'cs_4th_year';
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const data = useSyncExternalStore(
    ClassroomStore.subscribe,
    ClassroomStore.getSnapshot,
    ClassroomStore.getSnapshot
  );

  const classroom = data.classrooms.find(c => c.id === classroomId);
  const hasStudents = classroom && classroom.studentIds.length > 0;

  return (
    <div className="ld-panel ld-progress-panel glass--muted">
      <div className="ld-panel__title">Student Progress</div>
      {hasStudents ? (
        <>
          <RosterTable
            classroomId={classroomId}
            onSelectStudent={setSelectedStudentId}
          />
          {selectedStudentId && (
            <StudentDetailDrawer
              studentId={selectedStudentId}
              classroomId={classroomId}
              onClose={() => setSelectedStudentId(null)}
            />
          )}
        </>
      ) : (
        <div className="ld-empty-state">
          <div className="ld-empty-state__icon">👥</div>
          <div className="ld-empty-state__text">
            No student activity available yet.
          </div>
          <div className="ld-empty-state__sub">
            Enroll students to see their progress here.
          </div>
        </div>
      )}
    </div>
  );
}
