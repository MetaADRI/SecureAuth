import { getStudentLessons } from './AriaEngine.js';

const STORAGE_KEY = 'aria_classroom_v1';

const EMPTY_DATA = {
  classrooms: [],
  students: [],
  assignments: [],
  assessmentResults: [],
};

let data = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return structuredClone(EMPTY_DATA);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function notify() {
  listeners.forEach(fn => fn());
}

function getLessonLabel(lessonId) {
  const all = getStudentLessons();
  const found = all.find(l => l.id === lessonId);
  return found ? found.title : lessonId;
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr + 'T12:00:00');
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
}

const TOTAL_LESSONS = 10;

export const ClassroomStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return data;
  },

  getClassroom(classroomId) {
    return data.classrooms.find(c => c.id === classroomId) || null;
  },

  getStudent(studentId) {
    return data.students.find(s => s.id === studentId) || null;
  },

  getStudentsByClassroom(classroomId) {
    const cls = this.getClassroom(classroomId);
    if (!cls) return [];
    return cls.studentIds
      .map(id => this.getStudent(id))
      .filter(Boolean);
  },

  getStudentProgress(studentId) {
    const s = this.getStudent(studentId);
    if (!s) return null;
    const completed = s.completedLessons.length;
    const ratio = completed / TOTAL_LESSONS;
    return {
      completed,
      total: TOTAL_LESSONS,
      ratio,
      percent: Math.round(ratio * 100),
      xp: s.xp,
      streak: s.streak,
      badges: s.badges,
      currentLessonId: s.currentLessonId,
    };
  },

  getAssessmentScores(classroomId, lessonId) {
    return data.assessmentResults.filter(
      r => r.classroomId === classroomId && r.lessonId === lessonId && r.score != null
    );
  },

  getStudentScores(studentId) {
    return data.assessmentResults.filter(r => r.studentId === studentId);
  },

  getLessonAverage(classroomId, lessonId) {
    const scores = this.getAssessmentScores(classroomId, lessonId);
    if (!scores.length) return null;
    const total = scores.reduce((sum, r) => sum + r.score, 0);
    return total / scores.length;
  },

  getLessonAverages(classroomId) {
    const lessons = [
      'password_hygiene',
      'phishing_social_engineering',
      'mobile_security',
      'online_scams',
      'case_studies',
    ];
    return lessons.map(id => ({
      lessonId: id,
      label: getLessonLabel(id),
      avg: this.getLessonAverage(classroomId, id),
      count: this.getAssessmentScores(classroomId, id).length,
    }));
  },

  getCompletionDistribution(classroomId) {
    const students = this.getStudentsByClassroom(classroomId);
    const dist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    students.forEach(s => {
      const completed = s.completedLessons.length;
      dist[completed] = (dist[completed] || 0) + 1;
    });
    return dist;
  },

  getWeeklyActivity(classroomId) {
    const students = this.getStudentsByClassroom(classroomId);
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeks = [];
    for (let w = 13; w >= 0; w--) {
      const d = new Date();
      d.setDate(d.getDate() - w * 7);
      const weekLabel = `${dayNames[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}`;
      let active = 0;
      students.forEach(s => {
        if (daysSince(s.lastLoginDate) <= w * 7) active++;
      });
      weeks.push({ label: weekLabel, active, total: students.length });
    }
    return weeks;
  },

  getStalledStudents(classroomId, daysThreshold = 6) {
    return this.getStudentsByClassroom(classroomId)
      .filter(s => daysSince(s.lastLoginDate) >= daysThreshold)
      .map(s => s.name);
  },

  getLowestScoringLesson(classroomId) {
    const avgs = this.getLessonAverages(classroomId)
      .filter(a => a.avg != null)
      .sort((a, b) => a.avg - b.avg);
    return avgs[0] || null;
  },

  createClassroom(name) {
    const id = 'cls_' + Date.now();
    const newCls = {
      id,
      name,
      joinCode: name.slice(0, 3).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      lecturerId: 'lecturer_1',
      createdAt: new Date().toISOString(),
      studentIds: [],
      assignedPathId: 'student',
      pathLessons: ['password_hygiene','phishing_social_engineering','mobile_security','online_scams','case_studies'],
    };
    data.classrooms.push(newCls);
    save();
    notify();
    return newCls;
  },

  assignLessons(classroomId, lessonIds, dueDate, title) {
    const assignment = {
      id: 'a_' + Date.now(),
      classroomId,
      title,
      pathId: 'student',
      lessonIds,
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      assignedAt: new Date().toISOString(),
    };
    data.assignments.push(assignment);
    save();
    notify();
    return assignment;
  },

  recordAssessment(studentId, classroomId, lessonId, score) {
    const result = {
      id: 'ar_' + Date.now(),
      classroomId,
      studentId,
      lessonId,
      score,
      completedAt: new Date().toISOString(),
    };
    data.assessmentResults.push(result);
    save();
    notify();
    return result;
  },

  /**
   * Reset all classroom data (dev/demo)
   */
  reset() {
    data = structuredClone(EMPTY_DATA);
    save();
    notify();
  },

  getLessonLabel,
};

export default ClassroomStore;
