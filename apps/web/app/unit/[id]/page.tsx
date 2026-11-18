"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { unitState, checkGoes, checkContinuous, checkPast, checkPerfect, checkPastPerfect, checkFuturePerfect, weakTopics } from "@shared";
import { UNITS, megaId, Unit as UnitT, Lesson, Test, Q } from "../../../lib/units";
import { supabase, SETUP_MSG } from "../../../lib/supabase";
import { usePrefs, useUi, TopBar, Lang, LANG_NAMES } from "../../../lib/prefs";
import { tr } from "../../../lib/i18n";
import { speak, canSpeak, sfx } from "../../../lib/audio";
import { loadSnapshot, saveSnapshot, enqueueLesson, queuedLessons } from "../../../lib/offline";
import Dagoruna, { Pose, Confetti } from "../../../components/Dagoruna";
type Result = { correct: number; total: number; percent: number; passed: boolean; xp: number; review: { id: string; answer: string }[] };
const rtl = (l: Lang) => (l === "urdu" ? "rtl" : "");
const Say = ({ t }: { t: string; lang?: Lang }) => { const ui = useUi(); return canSpeak() ? <span style={{ display: "inline-flex", gap: 4 }}><button className="ghost" aria-label="Play audio" onClick={() => speak(t)}>{tr("Listen", ui)}</button><button className="ghost" aria-label="Play slowly" onClick={() => speak(t, true)}>{tr("Slow", ui)}</button></span> : null; };

export default function Page() {
  const { id } = useParams<{ id: string }>(); const u = UNITS.find(x => x.id === id);
  return u ? <Unit key={u.id} u={u} /> : <main className="stack"><div className="card">Unit not found. <a href="/journey">Back to the journey</a></div></main>;
}
function Unit({ u }: { u: UnitT }) {
  const ui = useUi();
  const LIDS = u.lessons.map(l => l.id); const idx = UNITS.findIndex(x => x.id === u.id); const prev = idx > 0 ? UNITS[idx - 1] : null; const nxt = UNITS[idx + 1];
  const p = usePrefs(); const [uid, setUid] = useState<string | null>(null); const [msg, setMsg] = useState(""); const [passed, setPassed] = useState<string[]>([]); const [done, setDone] = useState<string[]>([]);
  const [view, setView] = useState<string>(LIDS[0]); const [ready, setReady] = useState(false);
  const load = useCallback(async () => { if (!supabase) { setMsg(SETUP_MSG); setReady(true); return; }
    const { data: s } = await supabase.auth.getSession(); if (!s.session) { setMsg("Log in to save progress and take graded tests. You can still read the lessons."); setReady(true); return; }
    setUid(s.session.user.id);
    const [a, l] = await Promise.all([supabase.from("test_attempts").select("test_id,passed").eq("user_id", s.session.user.id), supabase.from("lesson_progress").select("lesson_id").eq("user_id", s.session.user.id)]);
    const q = await queuedLessons();
    if (a.error || l.error) { const snap = await loadSnapshot(s.session.user.id); if (snap) { setPassed(snap.passed); setDone([...new Set([...snap.done, ...q])]); } setMsg("You are offline. You can read downloaded lessons; tests, XP and sync need internet."); setReady(true); return; }
    const pa = (a.data ?? []).filter((r: { passed: boolean }) => r.passed).map((r: { test_id: string }) => r.test_id), dn = (l.data ?? []).map((r: { lesson_id: string }) => r.lesson_id);
    setPassed(pa); setDone([...new Set([...dn, ...q])]); void saveSnapshot(s.session.user.id, { passed: pa, done: dn }); setReady(true); }, []);
  useEffect(() => { load(); }, [load]);
  const st = unitState(u.id, passed, done, LIDS);
  const gated = !!prev && ready && !passed.includes(megaId(prev));
  const locked = (id: string) => id.includes("mega") ? !st.megaUnlocked : id.includes("-t") ? !st.testsOpen : false;
  const steps = [...u.lessons.map(l => ({ id: l.id, label: l.title, ok: done.includes(l.id) })), ...u.tests.map(t => ({ id: t.id, label: t.title, ok: passed.includes(t.id) }))];
  const lesson = u.lessons.find(l => l.id === view); const test = u.tests.find(t => t.id === view);
  return (<><TopBar p={p}><a href="/journey"><button className="ghost">{tr("Journey", ui)}</button></a></TopBar><main className="stack">
    <h1>{u.level} · {u.title}</h1><div><small>{tr("Lesson explanations", ui)}</small> <select aria-label="Lesson explanations" value={p.lang} onChange={e => p.setLang(e.target.value as Lang)}>{(Object.keys(LANG_NAMES) as Lang[]).map(k => <option key={k} value={k}>{LANG_NAMES[k]}</option>)}</select></div>{msg && <div className="msg">{msg}</div>}
    {st.complete && <div className="card"><Confetti /><b>Level {u.level} complete! </b>{nxt ? <a href={`/unit/${nxt.id}`}>Start {nxt.level} →</a> : <a href="/congratulations">See your congratulations →</a>}</div>}
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{steps.map(s => <button key={s.id} disabled={locked(s.id)} className={view === s.id ? "" : "ghost"} onClick={() => setView(s.id)}>{s.ok ? "✓ " : locked(s.id) ? "🔒 " : ""}{s.label}</button>)}</div>
    {gated ? <div className="card stack"><Dagoruna pose="reading" size={140} /><p>Pass the Mega Test of {prev!.level} first to unlock {u.level}.</p><a href={`/unit/${prev!.id}`}><button>Go to {prev!.level}</button></a></div> : !ready ? <p>{tr("Loading…", ui)}</p> : lesson ? <LessonView key={lesson.id} lesson={lesson} lang={p.lang} uid={uid} done={done.includes(lesson.id)} onDone={async () => { await load(); const i = LIDS.indexOf(lesson.id); setView(i + 1 < LIDS.length ? LIDS[i + 1] : u.tests[0].id); }} />
      : test ? <TestView key={test.id} test={test as Test} uid={uid} lang={p.lang} locked={locked(test.id)} onResult={load} /> : null}
  </main></>);
}
function LessonView({ lesson: l, lang, uid, done, onDone }: { lesson: Lesson; lang: Lang; uid: string | null; done: boolean; onDone: () => void }) {
  const ui = useUi();
  const [txt, setTxt] = useState(""); const [fb, setFb] = useState<{ ok: boolean; msg: string } | null>(null); const [err, setErr] = useState("");
  const check = () => { const r = ({ goes: checkGoes, continuous: checkContinuous, past: checkPast, perfect: checkPerfect, pastperfect: checkPastPerfect, futureperfect: checkFuturePerfect } as Record<string, (s: string) => { ok: boolean; msg: string }>)[l.practice](txt); setFb(r); sfx(r.ok ? "ok" : "bad"); };
  async function finish() { if (!supabase || !uid) return setErr("Log in to save lesson progress.");
    if (!navigator.onLine) { await enqueueLesson(l.id); return onDone(); }
    const { error } = await supabase.rpc("complete_lesson", { p_lesson: l.id }); if (error) { if (/fetch|network/i.test(error.message)) { await enqueueLesson(l.id); return onDone(); } return setErr(error.message); } onDone(); }
  return (<div className="stack"><div className="card hero"><div className="stack"><h2>{l.title}</h2><div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{l.sentence} <Say t={l.sentence} lang={lang} /></div>
    <div className={rtl(lang)} style={{ fontSize: "1.3rem" }}>{l.tr[lang]}</div></div><Dagoruna pose={l.pose as Pose} size={200} /></div>
    <div className="card stack"><h3>{tr("Break it down", ui)}</h3><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{l.parts.map(x => <span key={x.w} className="card" style={{ padding: ".6rem 1rem" }}><b>{x.w}</b><br /><span className={rtl(lang)}>{x.r[lang]}</span></span>)}</div>
      <h3>{tr("Why?", ui)}</h3><p className={rtl(lang)}>{l.why[lang]}</p></div>
    <div className="card stack"><h3>{tr("More examples", ui)}</h3>{l.examples.map(e => <div key={e.en}><b>{e.en}</b> <Say t={e.en} lang={lang} /><div className={rtl(lang)}>{e.tr[lang]}</div></div>)}</div>
    <div className="card stack"><h3>{tr("Your turn", ui)}</h3><p>{l.prompt}</p><input aria-label="Your sentence" value={txt} onChange={e => setTxt(e.target.value)} /><button onClick={check} disabled={!txt.trim()}>{tr("Check my sentence", ui)}</button>
      {fb && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="msg" role="status" style={{ borderLeft: `6px solid ${fb.ok ? "var(--ok)" : "var(--bad)"}` }}>{fb.msg}</motion.div>}
      <small>This is a simple rule-based checker, not a full grammar engine.</small></div>
    <button onClick={finish}>{tr(done ? "Lesson done: continue" : "Finish lesson (+5 XP)", ui)}</button>{err && <div className="msg">{err}</div>}</div>);
}
function TestView({ test, uid, lang, locked, onResult }: { test: Test; uid: string | null; lang: Lang; locked: boolean; onResult: () => void }) {
  const ui = useUi();
  const qs: Q[] = test.questions; const [i, setI] = useState(0); const [ans, setAns] = useState<Record<string, string>>({}); const [picked, setPicked] = useState<string[]>([]); const [res, setRes] = useState<Result | null>(null); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  if (locked) return <div className="card"><Dagoruna pose="reading" size={140} /><p>Finish the lessons{test.kind === "mega" ? " and pass Test 1, 2 and 3" : ""} to open this test. Each level also needs the previous level's Mega Test.</p></div>;
  if (res) { const topics = weakTopics(res.review.map(r => r.id), Object.fromEntries(qs.map(q => [q.id, q.topic ?? ""]))); return (<div className="card stack">{res.passed && <Confetti />}
    <Dagoruna pose={res.passed ? "celebrating" : "sad"} size={170} /><h2>{res.percent}% ({res.correct} of {res.total})</h2><p>{res.passed ? `Passed! ${res.xp ? `+${res.xp} XP.` : "XP was already earned for this test."}` : tr("Not yet. You need 80%. Every try teaches you something, and Dagoruna believes in you!", ui)}</p>
    {res.review.length > 0 && <div className="stack"><h3>{tr("Review", ui)}</h3>{res.review.map(r => { const q = qs.find(x => x.id === r.id)!; return <div key={r.id} className="msg"><b>{q.ptr?.[lang] ?? q.prompt}</b><br />{tr("Correct answer", ui)}: {r.answer}</div>; })}
      {topics.length > 0 && <p>{tr("Revise", ui)}: {topics.join(", ")}</p>}</div>}<button onClick={() => { setRes(null); setI(0); setAns({}); setPicked([]); }}>{tr(res.passed ? "Practise again" : "Try again", ui)}</button></div>); }
  const q = qs[i]; const set = (v: string) => setAns({ ...ans, [q.id]: v });
  async function submit(final: Record<string, string>) { if (!supabase || !uid) return setErr("Log in to take graded tests."); if (!navigator.onLine) return setErr("Tests are graded on the server, so they need internet."); setBusy(true);
    const { data, error } = await supabase.rpc("submit_test", { p_test: test.id, p_answers: final }); setBusy(false); if (error) return setErr(error.message);
    setRes(data as Result); sfx((data as Result).passed ? "win" : "bad"); onResult(); }
  const next = () => { setPicked([]); if (i + 1 < qs.length) setI(i + 1); else submit(ans); };
  const cur = ans[q.id] ?? "";
  return (<div className="card stack"><span className="tag">{test.title} · {tr("Question", ui)} {i + 1} {tr("of", ui)} {qs.length}</span><h2>{q.ptr?.[lang] ?? q.prompt}</h2>
    {q.type === "mcq" && q.options!.map(o => <button key={o} className={"opt " + (cur === o ? "right" : "")} onClick={() => set(o)}>{o}</button>)}
    {q.type === "fill" && <input aria-label="Your answer" value={cur} onChange={e => set(e.target.value)} />}
    {q.type === "arrange" && <><div className="msg" style={{ minHeight: 48 }}>{picked.join(" ") || tr("Tap the words in order", ui)}</div><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{q.words!.map((w, k) => <button key={k} className="ghost" disabled={picked.includes(w + k)} onClick={() => { const n = [...picked, w + k]; setPicked(n); set(n.map(x => x.slice(0, -String(k).length)).join(" ")); }}>{w}</button>)}</div>
      <button className="ghost" onClick={() => { setPicked([]); set(""); }}>{tr("Clear", ui)}</button></>}
    {err && <div className="msg">{err}</div>}<div style={{ display: "flex", gap: ".5rem" }}><button disabled={!cur.trim() || busy} onClick={next}>{i + 1 === qs.length ? tr(busy ? "Checking…" : "Submit test", ui) : tr("Next", ui)}</button></div>
    <small>Answers are checked on the server after you submit.</small></div>);
}
