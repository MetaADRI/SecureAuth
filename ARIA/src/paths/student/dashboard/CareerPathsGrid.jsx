const CAREER_PATHS = [
  {
    id: 'security_analyst',
    title: 'Security Analyst',
    description: 'Monitor and defend networks, investigate incidents, and manage security tools.',
    level: 'Entry',
    color: 'var(--aria-cyan)',
  },
  {
    id: 'penetration_tester',
    title: 'Penetration Tester',
    description: 'Ethically hack systems to find vulnerabilities before attackers do.',
    level: 'Intermediate',
    color: 'var(--aria-violet)',
  },
  {
    id: 'security_engineer',
    title: 'Security Engineer',
    description: 'Build and maintain secure systems, automate defenses, and architect solutions.',
    level: 'Advanced',
    color: 'var(--aria-gold)',
  },
];

export default function CareerPathsGrid() {
  return (
    <div className="sd-panel glass glass--strong sd-careers">
      <h2 className="sd-panel__title">Career Paths</h2>
      <div className="sd-careers__grid">
        {CAREER_PATHS.map((path) => (
          <div key={path.id} className="sd-career-card glass" style={{ '--career-accent': path.color }}>
            <div className="sd-career-card__level text-muted">{path.level}</div>
            <h3 className="sd-career-card__title">{path.title}</h3>
            <p className="sd-career-card__desc text-muted">{path.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
