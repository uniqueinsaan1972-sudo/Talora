"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { winner, computerMove, Cell, Difficulty } from "@shared";
import { sfx } from "../../lib/audio";
import Dagoruna, { Pose } from "../../components/Dagoruna";
import { usePrefs, TopBar } from "../../lib/prefs";
const empty = (): Cell[] => Array(9).fill(null);
export default function Games() {
  const p = usePrefs(); const [b, setB] = useState<Cell[]>(empty()); const [d, setD] = useState<Difficulty>("medium"); const [score, setScore] = useState({ you: 0, cpu: 0, draw: 0 });
  const w = winner(b);
  useEffect(() => { if (w) return; const x = b.filter(c => c === "X").length, o = b.filter(c => c === "O").length; if (x > o) { const t = setTimeout(() => setB(cur => { const n = [...cur]; n[computerMove(cur, d)] = "O"; return n; }), 450); return () => clearTimeout(t); } }, [b, w, d]);
  useEffect(() => { if (!w) return; sfx(w === "X" ? "win" : w === "O" ? "bad" : "ok"); setScore(s => ({ you: s.you + (w === "X" ? 1 : 0), cpu: s.cpu + (w === "O" ? 1 : 0), draw: s.draw + (w === "draw" ? 1 : 0) })); }, [w]);
  const pose: Pose = w === "X" ? "celebrating" : w === "O" ? "happy" : w === "draw" ? "thinking" : "reading";
  return (<><TopBar p={p}><a href="/dashboard"><button className="ghost">Dashboard</button></a></TopBar><main className="stack"><h1>Games</h1>
    <div className="card stack"><h2>Tic-Tac-Toe</h2><p>You are X. The computer plays O.</p>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{(["easy", "medium", "hard"] as Difficulty[]).map(x => <button key={x} className={d === x ? "" : "ghost"} onClick={() => { setD(x); setB(empty()); }}>{x}</button>)}</div>
      <div className="hero"><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 330 }}>{b.map((c, i) => <motion.button key={i} whileTap={{ scale: 0.92 }} aria-label={`Cell ${i + 1} ${c ?? "empty"}`} disabled={!!c || !!w}
        style={{ height: 100, fontSize: "2.4rem" }} className={c ? "opt" : ""} onClick={() => { const n = [...b]; n[i] = "X"; setB(n); }}><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>{c}</motion.span></motion.button>)}</div>
        <div className="stack"><Dagoruna pose={pose} size={150} /><div className="msg" role="status">{w === "X" ? "You won! Great thinking!" : w === "O" ? "Good game! Try again, you can do it." : w === "draw" ? "A draw. Well played!" : "Your move."}</div></div></div>
      <div>You {score.you} · Computer {score.cpu} · Draws {score.draw}</div><button onClick={() => setB(empty())}>New game</button></div>
    <div className="card"><h3>More games</h3><p>Word matching, memory cards, word scramble, vocabulary race and trivia are <span className="tag">Planned</span>.</p></div></main></>);
}
