"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { pickQuestions, ExamQ, EXAM_MODES, LEVEL_NAMES } from "@shared";
import bankJson from "@content/exam_bank.public.json";
import { supabase, SETUP_MSG } from "../../lib/supabase";
import { usePrefs, TopBar } from "../../lib/prefs";
import { speak, canSpeak } from "../../lib/audio";
import { tr } from "../../lib/i18n";
import QuestionInput from "../../components/QuestionInput";
import Dagoruna from "../../components/Dagoruna";
const bank = (bankJson as unknown as { questions: ExamQ[] }).questions; type Mode = keyof typeof EXAM_MODES;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export default function Exam() {
  const p = usePrefs(); const router = useRouter(); const [mode, setMode] = useState<Mode>("standard"); const [level, setLevel] = useState(1); const [timed, setTimed] = useState(false);
  const [qs, setQs] = useState<ExamQ[] | null>(null); const [i, setI] = useState(0); const [ans, setAns] = useState<Record<string, string>>({}); const [pk, setPk] = useState<Record<string, number[]>>({}); const [el, setEl] = useState(0); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const limit = qs ? qs.length * 45 : 0; const fin = useRef<() => void>(() => {});
  async function finish() { if (!qs || busy) return; if (!supabase) return setErr(SETUP_MSG); if (!navigator.onLine) return setErr("Mega Tests are graded on the server, so they need internet. Your answers are kept: reconnect and press Finish again."); setBusy(true); setErr("");
    const { data, error } = await supabase.rpc("submit_exam", { p_mode: mode, p_level: mode === "mega" ? -1 : level, p_timed: timed, p_answers: ans, p_questions: qs.map(q => q.id), p_seconds: el });
    if (error) { setBusy(false); return setErr(error.message); } router.push(`/exam/report/${(data as { id: number }).id}`); }
  fin.current = finish;
  useEffect(() => { if (!qs) return; const t = setInterval(() => { setEl(e => { const n = e + 1; if (timed && n >= limit) fin.current(); return n; }); }, 1000); return () => clearInterval(t); }, [qs, timed, limit]);
  async function start() { setErr(""); if (!supabase) return setErr(SETUP_MSG); const { data } = await supabase.auth.getSession(); if (!data.session) return setErr("Log in to take a Mega Test and save your report.");
    setQs(pickQuestions(bank, mode === "mega" ? -1 : level, EXAM_MODES[mode])); setI(0); setAns({}); setPk({}); setEl(0); }
  if (!qs) return (<><TopBar p={p} /><main className="stack"><div className="card hero"><div className="stack"><h1>TALORA {tr("Mega Test", p.ui)}</h1><p>Vocabulary, grammar, sentence formation, translation, spelling, reading and listening. Graded on the server, saved with a full report.</p></div><Dagoruna pose="thinking" size={150} /></div>
    <div className="card stack"><h3>Length</h3><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{(Object.keys(EXAM_MODES) as Mode[]).map(m => <button key={m} className={mode === m ? "" : "ghost"} onClick={() => setMode(m)}>{{ short: "Short (10)", standard: "Standard (up to 20)", mega: "Comprehensive Mega (48)" }[m]}</button>)}</div>
      {mode !== "mega" && <><h3>Level</h3><select aria-label="Level" value={level} onChange={e => setLevel(Number(e.target.value))}>{LEVEL_NAMES.map((n, k) => <option key={n} value={k}>{n}</option>)}</select><small>Questions come from your chosen level and the levels next to it. The Mega option uses all six levels.</small></>}
      <label><input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} style={{ minHeight: 0 }} /> Timed (45 seconds per question; unanswered questions count as skipped)</label>
      <button onClick={start}>Start</button>{err && <div className="msg">{err}</div>}</div>
    <small>The question bank has 48 questions in total, so repeated tests will repeat questions across attempts (never inside one test). Match-the-words questions and a certificate are not built yet.</small></main></>);
  const q = qs[i]; const answered = qs.filter(x => (ans[x.id] ?? "").trim()).length;
  return (<><TopBar p={p} /><main className="stack"><div className="card" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}><b>{i + 1} / {qs.length}</b><span>{answered} answered</span><b>{timed ? fmt(Math.max(0, limit - el)) : fmt(el)}</b></div>
    <progress value={i + 1} max={qs.length} aria-label="Progress" />
    <div className="card stack" key={q.id}><span className="tag">{q.category} · {LEVEL_NAMES[q.level]}</span>{q.context && <div className="msg">{q.context}</div>}
      {q.audio && (canSpeak() ? <div style={{ display: "flex", gap: ".5rem" }}><button className="ghost" onClick={() => speak(q.audio!)}>{tr("Listen", p.ui)}</button><button className="ghost" onClick={() => speak(q.audio!, true)}>{tr("Slow", p.ui)}</button></div> : <div className="msg">Audio is not supported on this device. Transcript: {q.audio}</div>)}
      {q.src && <div className={"msg " + (p.lang === "urdu" ? "rtl" : "")} style={{ fontSize: "1.3rem" }}>{q.src[p.lang]}</div>}<h2>{q.prompt}</h2>
      <QuestionInput q={q} value={ans[q.id] ?? ""} onChange={v => setAns({ ...ans, [q.id]: v })} picked={pk[q.id] ?? []} onPick={v => setPk({ ...pk, [q.id]: v })} /></div>
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><button className="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button><button className="ghost" disabled={i === qs.length - 1} onClick={() => setI(i + 1)}>{tr("Next", p.ui)} / Skip</button>
      <button disabled={busy} onClick={finish}>{busy ? tr("Checking…", p.ui) : `Finish (${qs.length - answered} unanswered)`}</button></div>
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{qs.map((x, k) => <button key={x.id} aria-label={`Question ${k + 1}`} className={k === i ? "" : "ghost"} style={{ minHeight: 36, minWidth: 36, padding: 0, borderColor: (ans[x.id] ?? "").trim() ? "var(--ok)" : undefined }} onClick={() => setI(k)}>{k + 1}</button>)}</div>
    {err && <div className="msg">{err}</div>}</main></>);
}
