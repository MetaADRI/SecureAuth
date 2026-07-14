import QuickStatsGrid from './QuickStatsGrid.jsx';
import CourseManagementCard from './CourseManagementCard.jsx';
import StudentProgressPanel from './StudentProgressPanel.jsx';
import AssignmentSection from './AssignmentSection.jsx';
import QuizManagementSection from './QuizManagementSection.jsx';
import AnalyticsPanel from './AnalyticsPanel.jsx';
import AriaLecturerCard from './AriaLecturerCard.jsx';
import ResourcesGrid from './ResourcesGrid.jsx';
import RoadmapSection from './RoadmapSection.jsx';
import './LecturerDashboard.css';

const WELCOME_MESSAGES = [
  'Your classroom dashboard is ready. Monitor progress, manage content, and support your cohort.',
  'All metrics are live — data will appear as students begin their cybersecurity journey.',
  'Use the panels below to track engagement, review submissions, and plan your lessons.',
];

export default function LecturerDashboard({ progress, ariaMessage, authUser }) {
  const userName = authUser?.fullName || 'Lecturer';
  const welcomeMsg = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];

  return (
    <div className="ld-dashboard">
      <div className="ld-welcome glass glass--strong">
        <div className="ld-welcome__text">
          <h1 className="ld-welcome__title">Welcome, {userName}</h1>
          <p className="ld-welcome__sub text-muted">{welcomeMsg}</p>
        </div>
        <div className="ld-welcome__role-badge">Lecturer</div>
      </div>

      <div className="ld-dashboard__full">
        <AriaLecturerCard
          ariaMessage={ariaMessage || "Lecturer console loaded. I'll surface classroom insights as you explore."}
        />
      </div>

      <div className="ld-dashboard__full">
        <QuickStatsGrid stats={null} />
      </div>

      <div className="ld-dashboard__grid-2col">
        <StudentProgressPanel />
        <CourseManagementCard />
      </div>

      <div className="ld-dashboard__grid-2col">
        <AssignmentSection />
        <QuizManagementSection />
      </div>

      <div className="ld-dashboard__full">
        <AnalyticsPanel />
      </div>

      <div className="ld-dashboard__full">
        <ResourcesGrid />
      </div>

      <div className="ld-dashboard__full">
        <RoadmapSection />
      </div>
    </div>
  );
}
