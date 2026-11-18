"use client";
import type { ExamQ } from "@shared";
export default function QuestionInput({ q, value, onChange, picked, onPick }: { q: ExamQ; value: string; onChange: (v: string) => void; picked: number[]; onPick: (p: number[]) => void }) {
  if (q.type === "mcq") return <div className="stack">{q.options!.map(o => <button key={o} className={"opt " + (value === o ? "right" : "")} onClick={() => onChange(o)}>{o}</button>)}</div>;
  if (q.type === "fill") return <input aria-label="Your answer" value={value} onChange={e => onChange(e.target.value)} />;
  const set = (p: number[]) => { onPick(p); onChange(p.map(i => q.words![i]).join(" ")); };
  return (<div className="stack"><div className="msg" style={{ minHeight: 48 }}>{value || "…"}</div><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{q.words!.map((w, i) => <button key={i} className="ghost" disabled={picked.includes(i)} onClick={() => set([...picked, i])}>{w}</button>)}</div>
    <button className="ghost" onClick={() => set([])}>Clear</button></div>);
}
