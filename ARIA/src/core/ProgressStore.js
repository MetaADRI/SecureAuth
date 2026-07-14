/**
 * ProgressStore — localStorage-backed XP, badges, completion, streak.
 * Designed so a Supabase backend can replace the storage layer later.
 */

import { XP_RULES, LESSON_BADGE_MAP, BADGES, STUDENT_PATH_BADGE } from '../gamification/xpRules.js';
import { getRankForXp } from '../gamification/ranks.js';

const STORAGE_KEY = 'aria_progress_v1';

const DEFAULT_STATE = {
  xp: 0,
  completedLessons: [],
  passedPracticals: [],
  badges: [],
  streak: 0,
  lastLoginDate: null,
  role: null,
  currentLessonId: null,
  celebrations: {
    pendingRankUp: null,
    pendingBadge: null,
  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, celebrations: { pendingRankUp: null, pendingBadge: null } };
    return { ...DEFAULT_STATE, ...JSON.parse(raw), celebrations: { pendingRankUp: null, pendingBadge: null } };
  } catch {
    return { ...DEFAULT_STATE, celebrations: { pendingRankUp: null, pendingBadge: null } };
  }
}

function saveRaw(state) {
  const { celebrations, ...persistable } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
}

let state = loadRaw();
const listeners = new Set();

/**
 * Cached public snapshot. useSyncExternalStore requires getSnapshot() to
 * return the *same object reference* until the store actually changes.
 * Returning a fresh object every call causes React to infinite-loop / crash
 * → blank dark page (body background only).
 */
let cachedSnapshot = null;

function notify() {
  // Invalidate cache before listeners re-read
  cachedSnapshot = null;
  const snap = getSnapshot();
  listeners.forEach((fn) => fn(snap));
}

function awardBadge(badgeId) {
  if (!badgeId || state.badges.includes(badgeId)) return false;
  const def = BADGES.find((b) => b.id === badgeId);
  if (!def) return false;
  state = {
    ...state,
    badges: [...state.badges, badgeId],
    celebrations: {
      ...state.celebrations,
      pendingBadge: def,
    },
  };
  return true;
}

function applyXp(amount) {
  if (amount <= 0) return;
  const before = getRankForXp(state.xp);
  state = { ...state, xp: state.xp + amount };
  const after = getRankForXp(state.xp);
  if (after.current.id !== before.current.id) {
    state = {
      ...state,
      celebrations: {
        ...state.celebrations,
        pendingRankUp: after.current,
      },
    };
  }
}

export const ProgressStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return getSnapshot();
  },

  /** Call on app mount — awards daily streak if new day */
  checkDailyLogin() {
    const today = todayKey();
    if (state.lastLoginDate === today) {
      return getSnapshot();
    }

    let newStreak = 1;
    if (state.lastLoginDate) {
      const last = new Date(state.lastLoginDate + 'T12:00:00');
      const now = new Date(today + 'T12:00:00');
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = state.streak + 1;
      }
    }

    state = {
      ...state,
      lastLoginDate: today,
      streak: newStreak,
    };

    const bonus = Math.min(XP_RULES.DAILY_STREAK_BONUS, XP_RULES.STREAK_DAILY_CAP);
    applyXp(bonus);

    if (newStreak >= 3) {
      awardBadge('streak_3');
    }

    saveRaw(state);
    notify();
    return getSnapshot();
  },

  setRole(role) {
    state = { ...state, role };
    saveRaw(state);
    notify();
    return getSnapshot();
  },

  setCurrentLesson(lessonId) {
    state = { ...state, currentLessonId: lessonId };
    saveRaw(state);
    notify();
    return getSnapshot();
  },

  /** Award practical check XP (once per lesson) */
  completePractical(lessonId) {
    if (state.passedPracticals.includes(lessonId)) {
      return { snapshot: getSnapshot(), awarded: 0, alreadyDone: true };
    }
    applyXp(XP_RULES.PRACTICAL_PASSED);
    state = {
      ...state,
      passedPracticals: [...state.passedPracticals, lessonId],
    };
    saveRaw(state);
    notify();
    return { snapshot: getSnapshot(), awarded: XP_RULES.PRACTICAL_PASSED, alreadyDone: false };
  },

  /** Complete lesson: XP + badges + unlock next */
  completeLesson(lessonId, totalLessons = 10) {
    if (state.completedLessons.includes(lessonId)) {
      return { snapshot: getSnapshot(), awarded: 0, alreadyDone: true };
    }

    applyXp(XP_RULES.LESSON_COMPLETE);
    state = {
      ...state,
      completedLessons: [...state.completedLessons, lessonId],
    };

    // First lesson badge
    if (state.completedLessons.length === 1) {
      awardBadge('first_lesson');
    }

    // Lesson-specific badge
    const lessonBadge = LESSON_BADGE_MAP[lessonId];
    if (lessonBadge) awardBadge(lessonBadge);

    // Path complete
    if (state.completedLessons.length >= totalLessons) {
      if (state.role === 'student') {
        awardBadge(STUDENT_PATH_BADGE);
      } else {
        awardBadge('path_complete');
      }
    }

    saveRaw(state);
    notify();
    return {
      snapshot: getSnapshot(),
      awarded: XP_RULES.LESSON_COMPLETE,
      alreadyDone: false,
    };
  },

  clearCelebration(kind) {
    if (kind === 'rank') {
      state = {
        ...state,
        celebrations: { ...state.celebrations, pendingRankUp: null },
      };
    } else if (kind === 'badge') {
      state = {
        ...state,
        celebrations: { ...state.celebrations, pendingBadge: null },
      };
    } else {
      state = {
        ...state,
        celebrations: { pendingRankUp: null, pendingBadge: null },
      };
    }
    notify();
  },

  /** Dev/demo helper */
  reset() {
    state = { ...DEFAULT_STATE, celebrations: { pendingRankUp: null, pendingBadge: null } };
    saveRaw(state);
    notify();
    return getSnapshot();
  },
};

function getSnapshot() {
  if (cachedSnapshot) return cachedSnapshot;

  const rankInfo = getRankForXp(state.xp);
  cachedSnapshot = {
    xp: state.xp,
    completedLessons: [...state.completedLessons],
    passedPracticals: [...state.passedPracticals],
    badges: [...state.badges],
    streak: state.streak,
    lastLoginDate: state.lastLoginDate,
    role: state.role,
    currentLessonId: state.currentLessonId,
    rank: rankInfo,
    celebrations: { ...state.celebrations },
  };
  return cachedSnapshot;
}

export default ProgressStore;
