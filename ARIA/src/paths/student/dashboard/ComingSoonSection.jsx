const COMING_SOON_ITEMS = [
  {
    title: 'Hands-on Labs',
    description: 'Practice security skills in a safe, sandboxed environment.',
    icon: '⚙',
  },
  {
    title: 'Community Leaderboard',
    description: 'Compare your progress with fellow learners.',
    icon: '📊',
  },
  {
    title: 'Resource Library',
    description: 'Extended reading, tools, and references for deeper study.',
    icon: '📚',
  },
];

export default function ComingSoonSection() {
  return (
    <div className="sd-panel glass glass--strong sd-coming-soon">
      <h2 className="sd-panel__title">Coming Soon</h2>
      <div className="sd-coming-soon__grid">
        {COMING_SOON_ITEMS.map((item) => (
          <div key={item.title} className="sd-coming-item glass">
            <div className="sd-coming-item__icon text-muted" aria-hidden="true">{item.icon}</div>
            <h3 className="sd-coming-item__title">{item.title}</h3>
            <p className="sd-coming-item__desc text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
