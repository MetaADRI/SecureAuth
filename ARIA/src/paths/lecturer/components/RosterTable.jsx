import { useState, useMemo } from 'react';
import ClassroomStore from '../../../core/ClassroomStore.js';

const SORT_KEYS = {
  NAME: 'name',
  XP: 'xp',
  PROGRESS: 'progress',
  STREAK: 'streak',
  LAST: 'last',
};

export default function RosterTable({ classroomId, onSelectStudent }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(SORT_KEYS.PROGRESS);
  const [sortDir, setSortDir] = useState('desc');

  const students = ClassroomStore.getStudentsByClassroom(classroomId);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === SORT_KEYS.NAME) cmp = a.name.localeCompare(b.name);
      else if (sortKey === SORT_KEYS.XP) cmp = a.xp - b.xp;
      else if (sortKey === SORT_KEYS.PROGRESS) cmp = a.completedLessons.length - b.completedLessons.length;
      else if (sortKey === SORT_KEYS.STREAK) cmp = a.streak - b.streak;
      else if (sortKey === SORT_KEYS.LAST) cmp = (a.lastLoginDate || '').localeCompare(b.lastLoginDate || '');
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  function daysSince(d) {
    if (!d) return 999;
    const diff = Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000);
    return diff;
  }

  function progressPercent(s) {
    return Math.round((s.completedLessons.length / 5) * 100);
  }

  const sortIndicator = key => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div className="roster-table">
      <div className="roster-table__toolbar">
        <input
          className="roster-table__search"
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="roster-table__sort-group">
          <span className="roster-table__sort-label">Sort</span>
          {Object.entries({
            [SORT_KEYS.PROGRESS]: 'Progress',
            [SORT_KEYS.XP]: 'XP',
            [SORT_KEYS.STREAK]: 'Streak',
            [SORT_KEYS.NAME]: 'Name',
            [SORT_KEYS.LAST]: 'Last active',
          }).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`roster-table__sort-btn ${sortKey === key ? 'is-active' : ''}`}
              onClick={() => handleSort(key)}
            >
              {label}{sortIndicator(key)}
            </button>
          ))}
        </div>
      </div>

      <div className="roster-table__header">
        <div className="roster-header">
          <span className="roster-header__sortable" onClick={() => handleSort(SORT_KEYS.NAME)}>
            Student{sortIndicator(SORT_KEYS.NAME)}
          </span>
          <span className="roster-header__right roster-header__sortable" onClick={() => handleSort(SORT_KEYS.XP)}>
            XP{sortIndicator(SORT_KEYS.XP)}
          </span>
          <span className="roster-header__center roster-header__sortable" onClick={() => handleSort(SORT_KEYS.PROGRESS)}>
            Progress{sortIndicator(SORT_KEYS.PROGRESS)}
          </span>
          <span className="roster-header__center roster-header__sortable" onClick={() => handleSort(SORT_KEYS.STREAK)}>
            Streak{sortIndicator(SORT_KEYS.STREAK)}
          </span>
          <span className="roster-header__right roster-header__sortable" onClick={() => handleSort(SORT_KEYS.LAST)}>
            Last active{sortIndicator(SORT_KEYS.LAST)}
          </span>
        </div>
      </div>

      <div className="roster-table__grid">
        {sorted.length === 0 && (
          <div className="roster-empty">No students match your search.</div>
        )}
        {sorted.map(s => {
          const days = daysSince(s.lastLoginDate);
          const pct = progressPercent(s);
          const stalled = days >= 6;
          const full = pct >= 100;
          return (
            <div
              key={s.id}
              className={`roster-row ${stalled ? 'roster-row--stalled' : ''} ${full ? 'roster-row--complete' : ''}`}
              onClick={() => onSelectStudent(s.id)}
            >
              <div className="roster-row__name">
                {s.name}
                <small>{s.email}</small>
              </div>
              <div className="roster-row__xp">{s.xp.toLocaleString()}</div>
              <div>
                <div className="roster-row__bar-wrap" title={`${pct}% complete`}>
                  <div
                    className={`roster-row__bar ${pct < 25 ? 'roster-row__bar--low' : ''} ${pct >= 25 && pct < 75 ? 'roster-row__bar--mid' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className={`roster-row__streak ${s.streak >= 7 ? 'is-hot' : ''}`}>
                {s.streak} day{s.streak !== 1 ? 's' : ''}
              </div>
              <div className={`roster-row__last ${stalled ? 'is-stale' : ''}`}>
                {days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
