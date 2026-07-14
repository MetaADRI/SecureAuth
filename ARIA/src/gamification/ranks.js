/**
 * Rank table — fixed XP thresholds.
 * Cyber Cadet → Cyber Elite
 */

export const RANKS = [
  { id: 'cyber_cadet', name: 'Cyber Cadet', xpRequired: 0 },
  { id: 'cyber_defender', name: 'Cyber Defender', xpRequired: 250 },
  { id: 'cyber_guardian', name: 'Cyber Guardian', xpRequired: 600 },
  { id: 'security_engineer', name: 'Security Engineer', xpRequired: 1200 },
  { id: 'security_architect', name: 'Security Architect', xpRequired: 2200 },
  { id: 'cyber_elite', name: 'Cyber Elite', xpRequired: 4000 },
];

/**
 * Resolve current rank and next rank from total XP.
 */
export function getRankForXp(xp) {
  let current = RANKS[0];
  let next = RANKS[1] || null;

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].xpRequired) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }

  const floor = current.xpRequired;
  const ceiling = next ? next.xpRequired : current.xpRequired;
  const span = Math.max(ceiling - floor, 1);
  const progressInRank = next ? Math.min((xp - floor) / span, 1) : 1;
  const xpToNext = next ? Math.max(next.xpRequired - xp, 0) : 0;

  return {
    current,
    next,
    progressInRank,
    xpToNext,
    floor,
    ceiling,
  };
}
