export type Cell = "X" | "O" | null; export type Difficulty = "easy" | "medium" | "hard";
const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function winner(b: Cell[]): "X" | "O" | "draw" | null { for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? "draw" : null; }
const free = (b: Cell[]) => b.flatMap((c, i) => (c ? [] : [i]));
function minimax(b: Cell[], turn: "X" | "O"): number { const w = winner(b); if (w === "O") return 1; if (w === "X") return -1; if (w === "draw") return 0;
  const s = free(b).map(i => { const n = [...b]; n[i] = turn; return minimax(n, turn === "O" ? "X" : "O"); }); return turn === "O" ? Math.max(...s) : Math.min(...s); }
const completes = (b: Cell[], who: "X" | "O") => free(b).find(i => { const n = [...b]; n[i] = who; return winner(n) === who; });
// Computer plays "O".
export function computerMove(b: Cell[], d: Difficulty, rnd = Math.random): number {
  const f = free(b); if (!f.length) throw new Error("board full");
  if (d === "easy") return f[Math.floor(rnd() * f.length)];
  if (d === "medium") { const m = completes(b, "O") ?? completes(b, "X"); if (m !== undefined) return m; return b[4] ? f[Math.floor(rnd() * f.length)] : 4; }
  let best = f[0], bs = -2; for (const i of f) { const n = [...b]; n[i] = "O"; const s = minimax(n, "X"); if (s > bs) { bs = s; best = i; } } return best;
}
