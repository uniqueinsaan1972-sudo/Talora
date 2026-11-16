import { describe, it, expect } from "vitest";
import { newCard, review, isDue, levelFromXp, xpForLevel, nextStreak, checkAnswer, checkSentence, scoreQuiz, xpForScore, shuffle } from "../src";
describe("srs", () => {
  it("schedules 1, 6 then longer days", () => {
    let c = newCard("2026-01-01"); c = review(c, 5, "2026-01-01"); expect(c.intervalDays).toBe(1);
    c = review(c, 5, "2026-01-02"); expect(c.intervalDays).toBe(6); expect(c.due).toBe("2026-01-08");
    c = review(c, 4, "2026-01-08"); expect(c.intervalDays).toBeGreaterThan(6);
  });
  it("resets on failure and keeps ease >= 1.3", () => {
    let c = newCard("2026-01-01"); for (let i = 0; i < 20; i++) c = review(c, 3, "2026-01-01");
    expect(c.ease).toBeGreaterThanOrEqual(1.3); expect(review(c, 1, "2026-02-01").reps).toBe(0);
  });
  it("rejects bad quality; isDue works", () => { expect(() => review(newCard("2026-01-01"), 9, "2026-01-01")).toThrow(); expect(isDue(newCard("2026-01-01"), "2026-01-01")).toBe(true); });
});
describe("xp and streak", () => {
  it("levels", () => { expect(levelFromXp(0)).toBe(1); expect(levelFromXp(xpForLevel(5))).toBe(5); });
  it("streak continues, freezes, resets", () => {
    expect(nextStreak(3, "2026-01-01", "2026-01-02", 2).streak).toBe(4);
    expect(nextStreak(3, "2026-01-01", "2026-01-03", 2)).toEqual({ streak: 4, freezes: 1 });
    expect(nextStreak(3, "2026-01-01", "2026-01-05", 2).streak).toBe(1);
    expect(nextStreak(3, "2026-01-01", "2026-01-01", 2).streak).toBe(3);
  });
});
describe("quiz", () => {
  it("answers ignore case and punctuation", () => { expect(checkAnswer("Thank you!", ["thank you"])).toBe(true); expect(checkAnswer("hi", ["hello"])).toBe(false); });
  it("sentence builder", () => expect(checkSentence(["I", "am", "Ali"], "I am Ali.")).toBe(true));
  it("scoring and XP never zero", () => { expect(scoreQuiz([true, false, true, true])).toEqual({ correct: 3, total: 4, percent: 75 }); expect(xpForScore(0)).toBe(2); });
  it("shuffle keeps items", () => expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]));
});
