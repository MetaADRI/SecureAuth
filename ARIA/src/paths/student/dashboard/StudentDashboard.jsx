import {
  getNextLesson,
  getStudentLessons,
} from '../../../core/AriaEngine.js';
import WelcomeBanner from './WelcomeBanner.jsx';
import LearningProgressPanel from './LearningProgressPanel.jsx';
import LearningPathRoadmap from './LearningPathRoadmap.jsx';
import ContinueLearningCard from './ContinueLearningCard.jsx';
import AchievementsPanel from './AchievementsPanel.jsx';
import CareerPathsGrid from './CareerPathsGrid.jsx';
import DailyChallengeCard from './DailyChallengeCard.jsx';
import ComingSoonSection from './ComingSoonSection.jsx';
import AriaPanel from './AriaPanel.jsx';
import './StudentDashboard.css';

export default function StudentDashboard({ progress, ariaMessage, onOpenLesson, onReset, authUser }) {
  const next = getNextLesson(progress);

  return (
    <div className="sd-dashboard">
      <header className="sd-dashboard__header">
        <div className="sd-dashboard__brand">
          <span className="sd-dashboard__logo">ARIA</span>
          <span className="text-muted">Student Path</span>
        </div>
        <div className="sd-dashboard__header-actions">
          {onReset && (
            <button type="button" className="btn btn--ghost" onClick={onReset} title="Reset local progress">
              Reset demo
            </button>
          )}
        </div>
      </header>

      <WelcomeBanner progress={progress} userName={authUser?.fullName} />

      <AriaPanel ariaMessage={ariaMessage} />

      <div className="sd-dashboard__grid-2col">
        <LearningProgressPanel progress={progress} />
        <ContinueLearningCard progress={progress} onOpenLesson={onOpenLesson} />
      </div>

      <div className="sd-dashboard__grid-2col">
        <LearningPathRoadmap progress={progress} onOpenLesson={onOpenLesson} />
        <div className="sd-dashboard__sidebar">
          <AchievementsPanel progress={progress} />
          <DailyChallengeCard />
        </div>
      </div>

      <CareerPathsGrid />
      <ComingSoonSection />
    </div>
  );
}
