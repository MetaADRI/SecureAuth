const FUTURE_ACTIONS = [
  'Create Assignment',
  'Review Submissions',
  'Provide Feedback',
];

export default function AssignmentSection() {
  return (
    <div className="ld-coming-soon">
      <div className="ld-coming-soon__title">Assignment Management</div>
      <div className="ld-coming-soon__desc">
        Create, distribute, and grade assignments. Coming in a future update.
      </div>
      <div className="ld-coming-soon__actions">
        {FUTURE_ACTIONS.map((action) => (
          <span key={action} className="ld-coming-soon__action">{action}</span>
        ))}
      </div>
    </div>
  );
}
