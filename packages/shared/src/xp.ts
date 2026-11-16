// Levels need 100 * n^1.5 cumulative XP (rounded). Display only: real XP is awarded server-side.
export const xpForLevel = (n: number) => Math.round(100 * Math.pow(n, 1.5));
export function levelFromXp(xp: number) { let l = 1; while (xp >= xpForLevel(l + 1)) l++; return l; }
// Streak with gentle recovery: one missed day can be covered by a freeze.
export function nextStreak(streak: number, last: string | null, today: string, freezes: number) {
  if (!last) return { streak: 1, freezes };
  const gap = Math.round((Date.parse(today) - Date.parse(last)) / 86400000);
  if (gap <= 0) return { streak, freezes };
  if (gap === 1) return { streak: streak + 1, freezes };
  if (gap === 2 && freezes > 0) return { streak: streak + 1, freezes: freezes - 1 };
  return { streak: 1, freezes };
}
