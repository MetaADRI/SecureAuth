/**
 * AriaEngine — state machine: role → path → lesson → progress
 * Thin orchestrator over ProgressStore + lesson catalog.
 */

import ProgressStore from './ProgressStore.js';
import { getAriaResponse } from './MentorScript.js';
import developerLessons from '../paths/developer/lessons.json';
import studentLessons from '../paths/student/lessons.json';

/** App screens */
export const SCREENS = {
  ROLE_SELECT: 'role_select',
  DASHBOARD: 'dashboard',
  LESSON: 'lesson',
};

export const ROLES = {
  STUDENT: 'student',
  DEVELOPER: 'developer',
  LECTURER: 'lecturer',
};

const DEVELOPER_LESSONS = developerLessons;
const STUDENT_LESSONS = studentLessons;

export function getDeveloperLessons() {
  return DEVELOPER_LESSONS;
}

export function getStudentLessons() {
  return STUDENT_LESSONS;
}

export function getLessonById(id) {
  return DEVELOPER_LESSONS.find((l) => l.id === id) ||
         STUDENT_LESSONS.find((l) => l.id === id) || null;
}

export function getStudentLessonById(id) {
  return STUDENT_LESSONS.find((l) => l.id === id) || null;
}

function getLessonsForRole(role) {
  return role === ROLES.STUDENT ? STUDENT_LESSONS : DEVELOPER_LESSONS;
}

export function getNextLesson(progress) {
  const lessons = getLessonsForRole(progress.role);
  const completed = new Set(progress.completedLessons || []);
  return lessons.find((l) => !completed.has(l.id)) || null;
}

export function isLessonUnlocked(lessonId, progress) {
  const lessons = getLessonsForRole(progress.role);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return true;
  const prev = lessons[idx - 1];
  return (progress.completedLessons || []).includes(prev.id);
}

export function getLessonProgress(progress) {
  const lessons = getLessonsForRole(progress.role);
  const total = lessons.length;
  const completed = (progress.completedLessons || []).filter((id) =>
    lessons.some((l) => l.id === id)
  ).length;
  return { completed, total, ratio: total ? completed / total : 0 };
}

/**
 * Create initial UI state (screen machine only — progress lives in ProgressStore).
 */
export function createInitialUiState() {
  const progress = ProgressStore.getSnapshot();
  if (progress.role === 'developer' || progress.role === 'student' || progress.role === 'lecturer') {
    return { screen: SCREENS.DASHBOARD, lessonId: null, lessonPhase: 'intro' };
  }
  return { screen: SCREENS.ROLE_SELECT, lessonId: null, lessonPhase: 'intro' };
}

export function selectRole(role) {
  ProgressStore.setRole(role);
  ProgressStore.checkDailyLogin();
  if (role === 'developer') {
    return {
      screen: SCREENS.DASHBOARD,
      lessonId: null,
      lessonPhase: 'intro',
      ariaMessage: getAriaResponse({ key: 'role_selected_developer' }),
    };
  }
  if (role === 'student') {
    return {
      screen: SCREENS.DASHBOARD,
      lessonId: null,
      lessonPhase: 'intro',
      ariaMessage: getAriaResponse({ key: 'role_selected_student' }),
    };
  }
  if (role === 'lecturer') {
    return {
      screen: SCREENS.DASHBOARD,
      lessonId: null,
      lessonPhase: 'intro',
      ariaMessage: "Lecturer console loaded. I'll surface classroom insights as you explore.",
    };
  }
  return {
    screen: SCREENS.ROLE_SELECT,
    lessonId: null,
    lessonPhase: 'intro',
    ariaMessage: getAriaResponse({ key: 'welcome' }),
  };
}

export function openDashboard() {
  ProgressStore.setCurrentLesson(null);
  return {
    screen: SCREENS.DASHBOARD,
    lessonId: null,
    lessonPhase: 'intro',
    ariaMessage: getAriaResponse({ key: 'dashboard_return' }),
  };
}

export function openLesson(lessonId, progress) {
  if (!isLessonUnlocked(lessonId, progress)) {
    return null;
  }
  ProgressStore.setCurrentLesson(lessonId);
  return {
    screen: SCREENS.LESSON,
    lessonId,
    lessonPhase: 'intro',
    ariaMessage: getAriaResponse({ lessonId, state: 'intro' }),
  };
}

export function advanceLessonPhase(lessonId, currentPhase) {
  const order = ['intro', 'concept', 'practical', 'complete'];
  const idx = order.indexOf(currentPhase);
  const next = order[Math.min(idx + 1, order.length - 1)];

  let ariaMessage;
  if (next === 'concept') {
    ariaMessage = getAriaResponse({ lessonId, state: 'concept' });
  } else if (next === 'practical') {
    ariaMessage = getAriaResponse({ lessonId, state: 'practical_prompt' });
  } else if (next === 'complete') {
    ariaMessage = getAriaResponse({ lessonId, state: 'complete' });
  } else {
    ariaMessage = getAriaResponse({ lessonId, state: next });
  }

  return { lessonPhase: next, ariaMessage };
}

export function getLessonSource(lessonId) {
  return DEVELOPER_LESSONS.find((l) => l.id === lessonId)
    ? 'developer'
    : STUDENT_LESSONS.find((l) => l.id === lessonId)
      ? 'student'
      : null;
}

export default {
  SCREENS,
  ROLES,
  getDeveloperLessons,
  getStudentLessons,
  getLessonById,
  getStudentLessonById,
  getNextLesson,
  isLessonUnlocked,
  getLessonProgress,
  getLessonSource,
  createInitialUiState,
  selectRole,
  openDashboard,
  openLesson,
  advanceLessonPhase,
};
