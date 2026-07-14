const ROADMAP_ITEMS = [
  {
    title: 'AI Lesson Generation',
    desc: 'Automatically generate lesson content from topic outlines using the ARIA engine.',
  },
  {
    title: 'Assignment Builder',
    desc: 'Create, distribute, and auto-grade assignments across cohorts.',
  },
  {
    title: 'Student Analytics',
    desc: 'Deep-dive visual analytics into individual and cohort performance.',
  },
  {
    title: 'Classroom Management',
    desc: 'Enroll students, manage cohorts, and configure join codes.',
  },
  {
    title: 'Course Publishing',
    desc: 'Package and publish custom course paths for student access.',
  },
];

export default function RoadmapSection() {
  return (
    <div className="ld-panel glass--muted">
      <div className="ld-panel__title">Coming Soon Roadmap</div>
      <div className="ld-roadmap-grid">
        {ROADMAP_ITEMS.map((item) => (
          <div key={item.title} className="ld-roadmap-card">
            <div className="ld-roadmap-card__title">{item.title}</div>
            <div className="ld-roadmap-card__desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
