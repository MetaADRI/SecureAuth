import DashboardShell from './DashboardShell.jsx';
import StudentDashboard from '../paths/student/dashboard/StudentDashboard.jsx';
import LecturerDashboard from '../paths/lecturer/dashboard/LecturerDashboard.jsx';
import DeveloperDashboard from './Dashboard.jsx';

export default function RoleContentSlot({ progress, role, ariaMessage, onOpenLesson, onReset, authUser }) {
  const shell = (dashboard) => (
    <DashboardShell authUser={authUser} role={role}>
      {dashboard}
    </DashboardShell>
  );

  if (role === 'student') {
    return shell(
      <StudentDashboard
        progress={progress}
        ariaMessage={ariaMessage}
        onOpenLesson={onOpenLesson}
        onReset={onReset}
        authUser={authUser}
      />
    );
  }

  if (role === 'lecturer') {
    return shell(
      <LecturerDashboard
        progress={progress}
        ariaMessage={ariaMessage}
        authUser={authUser}
      />
    );
  }

  if (role === 'developer') {
    return shell(
      <DeveloperDashboard
        progress={progress}
        ariaMessage={ariaMessage}
        onOpenLesson={onOpenLesson}
        onReset={onReset}
      />
    );
  }

  return null;
}
