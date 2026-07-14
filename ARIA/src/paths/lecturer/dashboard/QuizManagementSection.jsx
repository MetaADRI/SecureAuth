const FUTURE_ACTIONS = [
  'Create Quiz',
  'Schedule Quiz',
  'View Results',
];

export default function QuizManagementSection() {
  return (
    <div className="ld-coming-soon">
      <div className="ld-coming-soon__title">Quiz Management</div>
      <div className="ld-coming-soon__desc">
        Build quizzes, schedule assessments, and review class results. Coming in a future update.
      </div>
      <div className="ld-coming-soon__actions">
        {FUTURE_ACTIONS.map((action) => (
          <span key={action} className="ld-coming-soon__action">{action}</span>
        ))}
      </div>
    </div>
  );
}
