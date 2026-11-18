"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExamQ, LEVEL_NAMES, categoryScores, strongestWeakest, suggestLevel, pointsChange, Tally } from "@shared";
import bankJson from "@content/exam_bank.public.json";
import { supabase } from "../../../../lib/supabase";
import { usePrefs, TopBar } from "../../../../lib/prefs";
import Dagoruna, { Confetti } from "../../../../components/Dagoruna";
const bank = (bankJson as unknown as { questions: ExamQ[] }).questions;
type A = { id: number; mode: string; level: number; timed: boolean; correct: number; total: number; skipped: number; percent: number; seconds: number; by_category: Tally; by_level: Tally; mistakes: { id: string; given: string; answer: string }[]; created_at: string };
const TIPS: Record<string, [string, string]> = { vocabulary: ["Practise words and flashcards in Word practice.", "/learn"], spelling: ["Practise the words in Word practice and write them from memory.", "/learn"], grammar: ["Repeat the unit lessons and tests in your Journey.", "/journey"], sentence: ["Practise word order with the unit tests in your Journey.", "/journey"],
  translation: ["Re-read the Urdu/Hindi translations in each lesson, then try again.", "/journey"], reading: ["Read short English texts every day (reading lessons are planned).", "/journey"], listening: ["Use the Listen and Slow buttons in lessons (a Listening Studio is planned).", "/journey"] };
const Ring = ({ v }: { v: number }) => <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`${v}%`}><circle cx="70" cy="70" r="54" fill="none" stroke="var(--line)" strokeWidth="14" /><circle cx="70" cy="70" r="54" fill="none" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${v * 3.393} 339.3`} transform="rotate(-90 70 70)" /><text x="70" y="78" textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--head)">{v}%</text></svg>;
const mmss = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
export default function Report() {
  const p = usePrefs(); const { id } = useParams<{ id: string }>(); const [a, setA] = useState<A | null>(null); const [prev, setPrev] = useState<number | null>(null); const [msg, setMsg] = useState(""); const [note, setNote] = useState("");
  useEffect(() => { (async () => { if (!supabase) return setMsg("Supabase is not configured."); const { data: s } = await supabase.auth.getSession(); if (!s.session) return setMsg("Log in to see your report.");
    const { data, error } = await supabase.from("exam_attempts").select("*").eq("id", id).maybeSingle(); if (error || !data) return setMsg("Report not found (or you are offline)."); setA(data as A);
    const { data: pr } = await supabase.from("exam_attempts").select("percent").eq("user_id", s.session.user.id).eq("mode", data.mode).lt("id", data.id).order("id", { ascending: false }).limit(1); setPrev(pr?.[0]?.percent ?? null); })(); }, [id]);
  if (msg) return (<><TopBar p={p} /><main><div className="msg">{msg}</div></main></>); if (!a) return (<><TopBar p={p} /><main className="stack"><div className="skeleton" style={{ height: 220 }} /></main></>);
  const cats = categoryScores(a.by_category), sw = strongestWeakest(a.by_category), lvl = suggestLevel(a.by_level), diff = pointsChange(a.percent, prev), wrong = a.total - a.correct - a.skipped;
  const text = `TALORA Mega Test: ${a.percent}% (${a.correct}/${a.total} correct)`;
  const share = async () => { try { if (navigator.share) await navigator.share({ title: "TALORA", text }); else { await navigator.clipboard.writeText(text); setNote("Result copied."); } } catch {} };
  const show = (m: A["mistakes"][number]) => { const q = bank.find(x => x.id === m.id); return q ? { q, prompt: (q.src?.[p.lang] ? q.src[p.lang] + " — " : "") + q.prompt } : null; };
  return (<><TopBar p={p} />{a.percent >= 80 && <Confetti />}<main className="stack">
    <div className="card hero"><div className="stack"><h1>Mega Test report</h1><small>{new Date(a.created_at).toLocaleString()} · {a.mode} · {a.level < 0 ? "all levels" : LEVEL_NAMES[a.level]} · {a.timed ? "timed" : "untimed"}</small>
      <p><b>{a.correct}</b> correct · <b>{wrong}</b> incorrect · <b>{a.skipped}</b> skipped · {mmss(a.seconds)}</p><p>Accuracy {a.percent}% of {a.total} questions.{diff !== null && ` Compared with your previous ${a.mode} test: ${diff >= 0 ? "+" : ""}${diff} percentage points.`}{diff === null && " This is your first test of this length, so there is nothing to compare yet."}</p></div><div style={{ justifySelf: "center" }}><Ring v={a.percent} /><div style={{ textAlign: "center" }}><Dagoruna pose={a.percent >= 70 ? "celebrating" : "happy"} size={110} /></div></div></div>
    <div className="card stack"><h3>Performance by skill</h3>{cats.map(c => <div key={c.category}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ textTransform: "capitalize" }}>{c.category === "sentence" ? "sentence formation" : c.category}</span><b>{c.percent}% ({c.correct}/{c.total})</b></div><progress value={c.percent} max={100} /></div>)}
      <p>{sw.strongest ? <>Strongest: <b>{sw.strongest}</b>. Weakest: <b>{sw.weakest}</b>.</> : "No clear strongest or weakest skill in this test."}</p></div>
    <div className="card stack"><h3>Suggested level</h3><p><b>{LEVEL_NAMES[lvl]}</b> <small>(highest level where you got at least 70% of at least 2 questions right. A short test is only a rough guide.)</small></p>
      <h3>Next steps</h3>{sw.weakest ? <p>{TIPS[sw.weakest][0]} <a href={TIPS[sw.weakest][1]}><button className="ghost">Practise {sw.weakest}</button></a></p> : <p>Keep practising a little every day.</p>}</div>
    <div className="card stack" id="mistakes"><h3>Review answers: mistakes and corrections ({a.mistakes.length})</h3>{a.mistakes.length === 0 && <p>No mistakes. Excellent!</p>}{a.mistakes.map(m => { const s = show(m); return s ? <div key={m.id} className="msg"><b>{s.prompt}</b>{s.q.context && <div><i>{s.q.context}</i></div>}<div>Your answer: {m.given || "— skipped"}</div><div>Correct: <b>{m.answer}</b></div></div> : null; })}</div>
    <div className="noprint" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><a href="/exam"><button>Retake test</button></a><button className="ghost" onClick={share}>Share result</button><button className="ghost" onClick={() => window.print()}>Download as PDF</button><a href="/progress"><button className="ghost">History</button></a></div>
    {note && <div className="msg">{note}</div>}<small className="noprint">“Download as PDF” opens your device’s print dialog: choose “Save as PDF”.</small></main></>);
}
