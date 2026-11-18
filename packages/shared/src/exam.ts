import { shuffle } from "./quiz";
export const LEVEL_NAMES = ["Beginner", "Elementary", "Intermediate", "Upper Intermediate", "Advanced", "Expert Challenge"] as const;
export const CATEGORIES = ["vocabulary", "grammar", "sentence", "translation", "spelling", "reading", "listening"] as const;
export type Category = (typeof CATEGORIES)[number];
export type ExamQ = { id: string; level: number; category: Category; type: "mcq" | "fill" | "arrange"; prompt: string; options?: string[]; words?: string[]; context?: string; audio?: string; src?: Partial<Record<"roman_urdu" | "urdu" | "hindi", string>> };
export type Tally = Record<string, { c: number; t: number }>;
export const EXAM_MODES = { short: 10, standard: 20, mega: 48 } as const;
// level -1 = all levels. Otherwise questions from the chosen level and its neighbours. No repeats.
export function pickQuestions(bank: ExamQ[], level: number, count: number, rnd = Math.random): ExamQ[] {
  const pool = level < 0 ? bank : bank.filter(q => Math.abs(q.level - level) <= 1);
  return shuffle(pool, rnd).slice(0, Math.min(count, pool.length));
}
export const pct = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
export const categoryScores = (by: Tally) => CATEGORIES.filter(k => by[k]).map(k => ({ category: k, percent: pct(by[k].c, by[k].t), correct: by[k].c, total: by[k].t }));
export function strongestWeakest(by: Tally) { const s = categoryScores(by); if (s.length < 2) return { strongest: null, weakest: null }; const sorted = [...s].sort((a, b) => b.percent - a.percent || b.total - a.total); const top = sorted[0], low = sorted[sorted.length - 1];
  return top.percent === low.percent ? { strongest: null, weakest: null } : { strongest: top.category, weakest: low.category }; }
// Highest level where at least 2 questions were answered and 70% were right. A small sample: only a rough guide.
export function suggestLevel(by: Tally): number { let best = 0; for (const [lv, v] of Object.entries(by)) if (v.t >= 2 && v.c / v.t >= 0.7) best = Math.max(best, Number(lv)); return best; }
// Difference in percentage POINTS against the previous attempt of the same mode; null when there is none.
export const pointsChange = (now: number, prev: number | null) => (prev === null || prev === undefined ? null : now - prev);
