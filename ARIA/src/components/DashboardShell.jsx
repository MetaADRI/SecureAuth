import './DashboardShell.css';

export default function DashboardShell({ authUser, role, children }) {
  return (
    <div className="shell">
      <header className="shell__topbar">
        <div className="shell__brand">
          <span className="shell__logo">ARIA</span>
          <span className="shell__product text-muted">Cybersecurity Academy</span>
        </div>
        <nav className="shell__nav">
          <a href="/dashboard.html" className="shell__nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="/" className="shell__nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
        </nav>
        <div className="shell__user">
          {authUser && (
            <>
              <span className="shell__user-name">{authUser.fullName}</span>
              <span className="shell__user-role">{role}</span>
            </>
          )}
        </div>
      </header>
      <div className="shell__body">
        {children}
      </div>
    </div>
  );
}
