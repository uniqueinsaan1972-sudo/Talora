const norm = (s: string) => s.toLowerCase().replace(/[.,!?;:"]/g, "").replace(/\s+/g, " ").trim();
export const checkAnswer = (given: string, accepted: string[]) => accepted.some(a => norm(a) === norm(given));
export const checkSentence = (words: string[], answer: string) => norm(words.join(" ")) === norm(answer);
export function scoreQuiz(results: boolean[]) {
  const correct = results.filter(Boolean).length;
  return { correct, total: results.length, percent: results.length ? Math.round((correct / results.length) * 100) : 0 };
}
export function xpForScore(percent: number) { return percent >= 100 ? 15 : percent >= 80 ? 10 : percent >= 50 ? 5 : 2; } // never 0: no shaming
export function shuffle<T>(a: T[], rnd = Math.random) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
