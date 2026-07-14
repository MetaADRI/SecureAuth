import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import OrbField from './visuals/OrbField.jsx';
import RoleSelectPreLogin from './auth/RoleSelectPreLogin.jsx';
import RoleContentSlot from './components/RoleContentSlot.jsx';
import DeveloperPath from './paths/developer/DeveloperPath.jsx';
import StudentPath from './paths/student/StudentPath.jsx';
import ProgressStore from './core/ProgressStore.js';
import {
  SCREENS,
  createInitialUiState,
  selectRole,
  openDashboard,
  openLesson,
} from './core/AriaEngine.js';
import { getAriaResponse } from './core/MentorScript.js';
import { TRANSITION } from './visuals/transitions.js';
import './visuals/Glass.css';
import './App.css';

function useProgress() {
  return useSyncExternalStore(
    ProgressStore.subscribe,
    ProgressStore.getSnapshot,
    ProgressStore.getSnapshot
  );
}

export default function App() {
  const progress = useProgress();
  const [ui, setUi] = useState(() => createInitialUiState());
  const [ariaMessage, setAriaMessage] = useState(() =>
    getAriaResponse({ key: progress.role === 'developer' ? 'dashboard_return' : 'welcome' })
  );
  const [orbPull, setOrbPull] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [orbIntensity, setOrbIntensity] = useState(0.9);
  const [orbSpeed, setOrbSpeed] = useState(1);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const authCheckDone = useRef(false);

  // On mount: check localStorage for JWT and verify with backend
  useEffect(() => {
    if (authCheckDone.current) return;
    authCheckDone.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api'
      : '/api';

    fetch(`${apiBase}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
      })
      .then((data) => {
        setAuthUser(data.user);

        // Check for role override from URL query param (?role=student)
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role');
        const selectedRole = sessionStorage.getItem('selectedRole');
        const targetRole = urlRole || selectedRole || progress.role || 'student';
        if (selectedRole) {
          sessionStorage.removeItem('selectedRole');
        }

        if (!progress.role || (urlRole && urlRole !== progress.role)) {
          const next = selectRole(targetRole);
          ProgressStore.setRole(targetRole);
          setUi({
            screen: next.screen,
            lessonId: next.lessonId,
            lessonPhase: next.lessonPhase,
          });
          setAriaMessage(next.ariaMessage);
        }
        setAuthLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setAuthLoading(false);
      });
  }, [progress.role]);

  // Daily streak check once on mount if already in a role
  useEffect(() => {
    if (progress.role === 'developer' || progress.role === 'student') {
      ProgressStore.checkDailyLogin();
    }
  }, []);

  // Dial orb intensity by screen
  useEffect(() => {
    if (ui.screen === SCREENS.ROLE_SELECT) {
      setOrbIntensity(0.95);
      setOrbSpeed(1.05);
    } else if (ui.screen === SCREENS.LESSON) {
      setOrbIntensity(0.45);
      setOrbSpeed(0.7);
    } else {
      setOrbIntensity(0.7);
      setOrbSpeed(0.9);
    }
  }, [ui.screen]);

  // Celebration: rank-up or badge => gold burst
  useEffect(() => {
    const { pendingRankUp, pendingBadge } = progress.celebrations || {};
    if (!pendingRankUp && !pendingBadge) return;

    setCelebrate(true);
    if (pendingRankUp) {
      setAriaMessage(getAriaResponse({ key: 'rank_up' }));
    } else if (pendingBadge) {
      setAriaMessage(getAriaResponse({ key: 'badge_unlock' }));
    }

    const t = setTimeout(() => {
      setCelebrate(false);
      ProgressStore.clearCelebration();
    }, TRANSITION.celebrateMs);

    return () => clearTimeout(t);
  }, [progress.celebrations?.pendingRankUp, progress.celebrations?.pendingBadge]);

  const handleSelectDeveloper = useCallback(() => {
    const next = selectRole('developer');
    setOrbPull(false);
    setUi({
      screen: next.screen,
      lessonId: next.lessonId,
      lessonPhase: next.lessonPhase,
    });
    setAriaMessage(next.ariaMessage);
  }, []);

  const handleSelectStudent = useCallback(() => {
    const next = selectRole('student');
    setOrbPull(false);
    setUi({
      screen: next.screen,
      lessonId: next.lessonId,
      lessonPhase: next.lessonPhase,
    });
    setAriaMessage(next.ariaMessage);
  }, []);

  const handleSelectLecturer = useCallback(() => {
    const next = selectRole('lecturer');
    setOrbPull(false);
    setUi({
      screen: next.screen,
      lessonId: next.lessonId,
      lessonPhase: next.lessonPhase,
    });
    setAriaMessage(next.ariaMessage);
  }, []);

  const handlePullStart = useCallback(() => {
    setOrbPull(true);
  }, []);

  const handleOpenLesson = useCallback(
    (lessonId) => {
      const next = openLesson(lessonId, ProgressStore.getSnapshot());
      if (!next) return;
      setUi({
        screen: next.screen,
        lessonId: next.lessonId,
        lessonPhase: next.lessonPhase,
      });
      setAriaMessage(next.ariaMessage);
    },
    []
  );

  const handleBackDashboard = useCallback(() => {
    const next = openDashboard();
    setUi({
      screen: next.screen,
      lessonId: next.lessonId,
      lessonPhase: next.lessonPhase,
    });
    setAriaMessage(next.ariaMessage);
  }, []);

  const handlePhaseChange = useCallback((patch) => {
    setUi((prev) => ({
      ...prev,
      lessonPhase: patch.lessonPhase ?? prev.lessonPhase,
    }));
    if (patch.ariaMessage) setAriaMessage(patch.ariaMessage);
  }, []);

  const handleBackToRoleSelect = useCallback(() => {
    setUi({ screen: SCREENS.ROLE_SELECT, lessonId: null, lessonPhase: 'intro' });
    setAriaMessage(getAriaResponse({ key: 'welcome' }));
    setCelebrate(false);
  }, []);

  const handleReset = useCallback(() => {
    ProgressStore.reset();
    handleBackToRoleSelect();
  }, [handleBackToRoleSelect]);

  if (authLoading) {
    return (
      <div className="app">
        <OrbField intensity={0.95} speed={1.05} celebrate={false} />
        <main className="app__main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass glass--strong" style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="text-muted">Verifying session...</p>
          </div>
        </main>
      </div>
    );
  }

  // No auth — show pre-login role selection
  if (!authUser && ui.screen === SCREENS.ROLE_SELECT) {
    return (
      <div className="app">
        <OrbField intensity={0.95} speed={1.05} celebrate={false} />
        <RoleSelectPreLogin />
      </div>
    );
  }

  // Auth'd but no role yet — should not happen, but fallback to RoleSelect
  if (!progress.role) {
    return (
      <div className="app">
        <OrbField intensity={0.95} speed={1.05} celebrate={false} />
        <main className="app__main">
          <div className="glass glass--strong" style={{ padding: '2rem', textAlign: 'center', maxWidth: 400, margin: '4rem auto' }}>
            <p className="text-muted">Unable to determine your role. Please log in again.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <OrbField
        intensity={orbIntensity}
        speed={orbSpeed}
        celebrate={celebrate}
        className={orbPull ? 'orb-pull-focus' : ''}
      />

      {celebrate && (
        <div className="celebrate-banner glass glass--gold" role="status">
          {progress.celebrations?.pendingRankUp
            ? `Rank up — ${progress.celebrations.pendingRankUp.name}`
            : progress.celebrations?.pendingBadge
              ? `Badge unlocked — ${progress.celebrations.pendingBadge.name}`
              : 'Achievement'}
        </div>
      )}

      <main className="app__main">
        {ui.screen === SCREENS.DASHBOARD && (
          <RoleContentSlot
            progress={progress}
            role={progress.role}
            ariaMessage={ariaMessage}
            onOpenLesson={handleOpenLesson}
            onReset={handleReset}
            authUser={authUser}
          />
        )}

        {ui.screen === SCREENS.LESSON && progress.role === 'student' && (
          <StudentPath
            lessonId={ui.lessonId}
            phase={ui.lessonPhase}
            ariaMessage={ariaMessage}
            progress={progress}
            onPhaseChange={handlePhaseChange}
            onBack={handleBackDashboard}
            onLessonComplete={() => {}}
          />
        )}

        {ui.screen === SCREENS.LESSON && progress.role === 'developer' && (
          <DeveloperPath
            lessonId={ui.lessonId}
            phase={ui.lessonPhase}
            ariaMessage={ariaMessage}
            progress={progress}
            onPhaseChange={handlePhaseChange}
            onBack={handleBackDashboard}
            onLessonComplete={() => {}}
          />
        )}
      </main>
    </div>
  );
}
