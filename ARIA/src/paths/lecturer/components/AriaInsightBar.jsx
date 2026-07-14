import { useMemo } from 'react';
import ClassroomStore from '../../../core/ClassroomStore.js';

export default function AriaInsightBar({ classroomId }) {
  const insights = useMemo(() => {
    const result = [];
    const stalled = ClassroomStore.getStalledStudents(classroomId, 6);
    if (stalled.length > 0) {
      const names = stalled.length <= 3 ? stalled.join(', ') : `${stalled.length} students`;
      result.push({
        type: 'alert',
        icon: '⚠',
        text: `${names} haven't opened a lesson in 6+ days.`,
      });
    }

    const lowest = ClassroomStore.getLowestScoringLesson(classroomId);
    if (lowest) {
      result.push({
        type: 'info',
        icon: '📊',
        text: `${lowest.label} has the lowest average quiz score (${Math.round(lowest.avg)}%) — may be worth a follow-up in class.`,
      });
    }

    const students = ClassroomStore.getStudentsByClassroom(classroomId);
    const completed = students.filter(s => s.completedLessons.length >= 5).length;
    const ratio = Math.round((completed / students.length) * 100);
    if (students.length > 0) {
      result.push({
        type: 'ok',
        icon: '✓',
        text: `${completed}/${students.length} students (${ratio}%) have completed the full path.`,
      });
    }

    const hotStreaks = students.filter(s => s.streak >= 10).length;
    if (hotStreaks > 0) {
      result.push({
        type: 'ok',
        icon: '🔥',
        text: `${hotStreaks} student${hotStreaks !== 1 ? 's' : ''} on a 10+ day streak.`,
      });
    }

    return result;
  }, [classroomId]);

  if (insights.length === 0) return null;

  return (
    <div className="insight-bar">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`insight-chip insight-chip--${insight.type}`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="insight-chip__icon">{insight.icon}</span>
          {insight.text}
        </div>
      ))}
    </div>
  );
}
