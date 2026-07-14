import { useState } from 'react';
import AriaAvatar from '../components/AriaAvatar.jsx';
import { getAriaResponse } from '../core/MentorScript.js';
import { TRANSITION } from '../visuals/transitions.js';
import '../components/RoleSelect.css';

const ROLES = [
  {
    id: 'student',
    title: 'Student',
    blurb: 'Guided cyber fundamentals for learners building baseline security literacy.',
    available: true,
  },
  {
    id: 'developer',
    title: 'Developer',
    blurb: 'Auth, tokens, lockouts, injection, and secure deploy — the path that ships.',
    available: true,
  },
  {
    id: 'lecturer',
    title: 'Lecturer',
    blurb: 'Classroom tools and cohort progress for educators running the Academy.',
    available: true,
  },
  {
    id: 'admin',
    title: 'Administrator',
    blurb: 'Institution-level configuration, cohorts, and platform oversight.',
    available: false,
  },
];

export default function RoleSelectPreLogin() {
  const [pulling, setPulling] = useState(false);
  const message = getAriaResponse({ key: 'welcome' });

  const handleSelect = async (roleId) => {
    if (pulling) return;
    setPulling(true);
    await new Promise((r) => setTimeout(r, TRANSITION.pullMs));
    sessionStorage.setItem('selectedRole', roleId);
    window.location.href = '/login.html';
  };

  return (
    <div className={`role-select ${pulling ? 'role-select--pulling' : ''}`}>
      <header className="role-select__header">
        <div className="role-select__brand">
          <span className="role-select__logo">ARIA</span>
          <span className="role-select__product text-muted">Cybersecurity Academy</span>
        </div>
        <p className="role-select__tagline text-muted">
          Choose your path to begin.
        </p>
      </header>

      <div className="role-select__aria glass glass--strong">
        <AriaAvatar message={message} speaking trackPointer />
      </div>

      <div className="role-select__grid">
        {ROLES.map((role) => {
          const available = role.available;
          return (
            <button
              key={role.id}
              type="button"
              className={`role-card glass ${available ? 'role-card--live glass--hot' : 'role-card--soon glass--muted'}`}
              onClick={available ? () => handleSelect(role.id) : undefined}
              disabled={!available || pulling}
              aria-disabled={!available}
            >
              <div className="role-card__eyebrow">
                {available ? 'Select path' : 'Coming to the Academy soon'}
              </div>
              <h2 className="role-card__title">{role.title}</h2>
              <p className="role-card__blurb text-muted">{role.blurb}</p>
              {available && (
                <span className="role-card__cta text-cyan">Continue as {role.title} →</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
