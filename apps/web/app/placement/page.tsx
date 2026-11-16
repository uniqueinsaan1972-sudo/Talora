"use client";
import { useState } from "react";
import { placementNext, percentOf, LEVELS, Level, PASS_PERCENT } from "@shared";
import bank from "@content/placement.json";
import { supabase } from "../../lib/supabase";
import { usePrefs, TopBar } from "../../lib/prefs";
type Item = { q: string; o: string[]; a: string };
export default function Placement() {
  const p = usePrefs(); const [sel, setSel] = useState<Level | null>(null); const [scores, setScores] = useState<Partial<Record<Level, number>>>({}); const [ans, setAns] = useState<string[]>([]); const [note, setNote] = useState("");
  const step = sel ? placementNext(sel, scores) : null; const items = step && !step.done ? (bank as Record<string, Item[]>)[step.test] : [];
  async function finish(start: Level) { if (!supabase) return setNote("Supabase is not configured, so your level cannot be saved."); const { data } = await supabase.auth.getSession();
    if (!data.session) return setNote("Log in to save your starting level."); const { error } = await supabase.from("profiles").update({ current_level: start }).eq("id", data.session.user.id); setNote(error ? error.message : "Starting level saved."); }
  function submit() { if (!step || step.done) return; const c = items.filter((it, i) => ans[i] === it.a).length; setScores({ ...scores, [step.test]: percentOf(c, items.length) }); setAns([]); }
  return (<><TopBar p={p}><a href="/dashboard"><button className="ghost">Dashboard</button></a></TopBar><main className="stack"><h1>Placement test</h1>
    {!sel && <div className="card stack"><p>Which level do you think you are? You can retake this any time. Choose A1 if you are a beginner: you get the full A1 to C1 path.</p>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{LEVELS.map(l => <button key={l} onClick={() => { setSel(l); setScores({}); setNote(""); }}>{l}</button>)}</div></div>}
    {step && !step.done && <div className="card stack"><h2>{step.test} questions</h2>{items.map((it, i) => <div key={i} className="stack"><b>{i + 1}. {it.q}</b><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
      {it.o.map(o => <button key={o} className={ans[i] === o ? "" : "ghost"} onClick={() => { const n = [...ans]; n[i] = o; setAns(n); }}>{o}</button>)}</div></div>)}
      <button disabled={ans.filter(Boolean).length < items.length} onClick={submit}>Check my level</button></div>}
    {step?.done && <div className="card stack"><h2>Your starting level: {step.start}</h2>{Object.entries(scores).map(([l, s]) => <p key={l}>{l} test: {s}% {(s as number) >= PASS_PERCENT ? "(passed)" : "(not passed yet)"}</p>)}
      <p>{sel === "A1" ? "You will follow the complete A1 to C1 pathway." : "You can retake this later. Passing the tests inside each unit is what unlocks the next unit."}</p>
      <button onClick={() => finish(step.start)}>Save this level</button><button className="ghost" onClick={() => { setSel(null); setScores({}); }}>Retake</button>{note && <div className="msg">{note}</div>}</div>}
    <small>The placement bank is small (3 questions per level), so treat the result as a suggestion. It is graded in your browser; unit tests are graded on the server.</small></main></>);
}
