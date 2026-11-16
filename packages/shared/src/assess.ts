import { PASS_PERCENT, percentOf } from "./placement";
export const isPass = (percent: number, pass = PASS_PERCENT) => percent >= pass;
export const scoreTest = (correct: number, total: number, pass = PASS_PERCENT) => { const percent = percentOf(correct, total); return { correct, total, percent, passed: isPass(percent, pass) }; };
export const weakTopics = (wrongIds: string[], topicById: Record<string, string>) => [...new Set(wrongIds.map(id => topicById[id]).filter(Boolean))];
// Unit flow: lessons -> Test 1,2,3 -> Mega -> unit complete. `passed` = ids of passed tests.
export function unitState(unit: string, passed: string[], lessonsDone: string[], lessonIds: string[]) {
  const p = new Set(passed), allLessons = lessonIds.every(l => lessonsDone.includes(l));
  const t = [1, 2, 3].map(n => p.has(`${unit}-t${n}`));
  const mega = p.has(`${unit}-mega`);
  return { lessonsDone: allLessons, testsOpen: allLessons, test: t, megaUnlocked: allLessons && t.every(Boolean), complete: mega };
}
