// SM-2 spaced repetition. quality: 0 (forgot) .. 5 (perfect)
export interface Card { ease: number; intervalDays: number; reps: number; due: string }
export const newCard = (today: string): Card => ({ ease: 2.5, intervalDays: 0, reps: 0, due: today });
const addDays = (d: string, n: number) => { const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
export function review(c: Card, quality: number, today: string): Card {
  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) throw new Error("quality must be integer 0-5");
  if (quality < 3) return { ...c, reps: 0, intervalDays: 1, due: addDays(today, 1) };
  const ease = Math.max(1.3, c.ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const reps = c.reps + 1;
  const intervalDays = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(c.intervalDays * ease);
  return { ease, reps, intervalDays, due: addDays(today, intervalDays) };
}
export const isDue = (c: Card, today: string) => c.due <= today;
