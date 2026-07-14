export default function WelcomeBanner({ progress, userName }) {
  const name = userName || 'Student';
  const streakDays = progress.streak || 0;

  return (
    <div className="sd-welcome glass glass--strong">
      <div className="sd-welcome__text">
        <h1 className="sd-welcome__title">
          Welcome back, {name}
        </h1>
        <p className="sd-welcome__sub text-muted">
          Your cybersecurity journey awaits. Continue where you left off or explore a new topic.
        </p>
      </div>
      <div className="sd-welcome__badge">
        {streakDays > 0 ? (
          <div className="sd-welcome__streak">
            <span className="sd-welcome__streak-num">{streakDays}</span>
            <span className="sd-welcome__streak-label text-muted">day streak</span>
          </div>
        ) : (
          <div className="sd-welcome__placeholder text-muted">No streak yet</div>
        )}
      </div>
    </div>
  );
}
