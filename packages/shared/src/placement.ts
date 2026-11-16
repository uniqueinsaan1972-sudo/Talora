export const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type Level = (typeof LEVELS)[number];
export const PASS_PERCENT = 80;
export const percentOf = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
export type Step = { done: false; test: Level } | { done: true; start: Level };
// Start at the selected level only if its test is passed; otherwise walk down. A1 needs no test (full A1-C1 path).
export function placementNext(selected: Level, scores: Partial<Record<Level, number>>): Step {
  for (let i = LEVELS.indexOf(selected); i >= 0; i--) {
    const lvl = LEVELS[i]; if (lvl === "A1") return { done: true, start: "A1" };
    const s = scores[lvl]; if (s === undefined) return { done: false, test: lvl };
    if (s >= PASS_PERCENT) return { done: true, start: lvl };
  }
  return { done: true, start: "A1" };
}
