const RESOURCES = [
  {
    title: 'Teaching Materials',
    desc: 'Slide decks, lecture notes, and reference guides for each topic.',
  },
  {
    title: 'Best Practices',
    desc: 'Classroom management strategies and pedagogical approaches.',
  },
  {
    title: 'Lesson Templates',
    desc: 'Structured templates for creating consistent lesson plans.',
  },
  {
    title: 'Documentation',
    desc: 'Platform documentation and integration guides.',
  },
];

export default function ResourcesGrid() {
  return (
    <div className="ld-panel glass--muted">
      <div className="ld-panel__title">Resources</div>
      <div className="ld-resources-grid">
        {RESOURCES.map((r) => (
          <div key={r.title} className="ld-resource-card">
            <div className="ld-resource-card__title">{r.title}</div>
            <div className="ld-resource-card__desc">{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
