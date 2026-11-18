"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { levelFromXp, xpForLevel } from "@shared";
import course from "@content/journey.json";
import { supabase, SETUP_MSG } from "../../lib/supabase";
import { usePrefs, TopBar } from "../../lib/prefs";
import { UNITS } from "../../lib/units";
import { getDownloaded } from "../../lib/offline";
import { tr } from "../../lib/i18n";
type D = { name: string; xp: number; streak: number; best: number; week: { day: string; xp: number }[]; lessonsToday: number; rec: string | null; dl: number; goal: number; exam: { id: number; percent: number; created_at: string; mode: string } | null };
const MODULES = [["Units A1, A2, B1, B2, C1 (1 story lesson, 3 tests and a Mega Test each; one unit per level so far)", "Working"], ["Placement test", "Working (small question bank)"], ["Games: Tic-Tac-Toe vs computer", "Working"], ["Audio: browser text-to-speech", "Working where supported"], ["Word practice (A0 words, flashcards, quiz)", "Working"], ["All 12 tenses, rest of A1-C1", "Planned"], ["Other games, conversations, professional English", "Planned"], ["Speaking recording and pronunciation scoring", "Not available"], ["Admin CMS", "Database ready, UI planned"]];
export default function Dashboard() {
  const p = usePrefs(); const router = useRouter(); const [d, setD] = useState<D | null>(null); const [err, setErr] = useState("");
  useEffect(() => { (async () => {
    if (!supabase) return setErr(SETUP_MSG);
    const { data: s } = await supabase.auth.getSession(); if (!s.session) return router.replace("/");
    const uid = s.session.user.id;
    let { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (!prof) { const raw = localStorage.getItem("lp_pending_profile");
      if (!raw) return setErr("Profile not found. Please sign up again.");
      const ins = await supabase.from("profiles").insert({ id: uid, ...JSON.parse(raw) }).select().single();
      if (ins.error) return setErr("Could not create profile: " + ins.error.message); prof = ins.data; localStorage.removeItem("lp_pending_profile"); }
    if (!localStorage.getItem("lp_lang")) p.setLang(prof.explain_language);
    const since = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
    const [xp, st, wk, at, ex] = await Promise.all([supabase.from("xp_transactions").select("amount").eq("user_id", uid), supabase.from("user_streaks").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("daily_activity").select("day,xp,lessons_done").eq("user_id", uid).gte("day", since).order("day"), supabase.from("test_attempts").select("test_id").eq("user_id", uid).eq("passed", true), supabase.from("exam_attempts").select("id,percent,created_at,mode").eq("user_id", uid).order("created_at", { ascending: false }).limit(1)]);
    const today = new Date().toISOString().slice(0, 10);
    setD({ name: prof.full_name, xp: (xp.data ?? []).reduce((a: number, r: { amount: number }) => a + r.amount, 0), streak: st.data?.current_streak ?? 0, best: st.data?.longest_streak ?? 0,
      week: (wk.data ?? []).map((r: { day: string; xp: number }) => ({ day: r.day, xp: r.xp })), lessonsToday: (wk.data ?? []).find((r: { day: string }) => r.day === today)?.lessons_done ?? 0,
      rec: UNITS.find(x => !(at.data ?? []).some((r: { test_id: string }) => r.test_id === `${x.id}-mega`))?.id ?? null, dl: Object.keys(await getDownloaded()).length, goal: prof.daily_minutes ?? 10, exam: ex.data?.[0] ?? null });
  })(); }, []); // eslint-disable-line
  const out = async () => { await supabase?.auth.signOut(); router.replace("/"); };
  if (err) return (<><TopBar p={p} /><main><div className="msg">{err}</div></main></>);
  if (!d) return (<><TopBar p={p} /><main className="stack"><div className="skeleton" style={{ height: 70 }} /><div className="skeleton" style={{ height: 220 }} /><div className="grid"><div className="skeleton" style={{ height: 110 }} /><div className="skeleton" style={{ height: 110 }} /></div></main></>);
  const lvl = levelFromXp(d.xp), max = Math.max(10, ...d.week.map(w => w.xp));
  return (<><TopBar p={p}><button className="ghost" onClick={out}>{tr("Log out", p.ui)}</button></TopBar><main className="stack">
    <section className="hero"><div className="stack"><h1>{tr("Hello", p.ui)}, {d.name}!</h1><p>{tr("Dagoruna is ready when you are. Small steps count.", p.ui)}</p><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><a href="/journey"><button>{tr("Continue journey", p.ui)}</button></a><a href="/exam"><button>{tr("Mega Test", p.ui)}</button></a><a href="/congratulations"><button className="ghost">{tr("My progress", p.ui)}</button></a><a href="/games"><button className="ghost">{tr("Games", p.ui)}</button></a><a href="/placement"><button className="ghost">{tr("Placement test", p.ui)}</button></a><a href="/learn"><button className="ghost">{tr("Word practice", p.ui)}</button></a></div></div>
      <img src="/brand/lingo-mascot.png" alt="Dagoruna the dragon" style={{ maxHeight: 260, objectFit: "contain" }} /></section>
    <div className="grid"><div className="card"><div className="stat">{d.xp}</div>{tr("XP total", p.ui)}</div><div className="card"><div className="stat">{lvl}</div>{tr("Level", p.ui)} ({tr("next at", p.ui)} {xpForLevel(lvl + 1)} XP)</div>
      <div className="card"><div className="stat">{d.streak}</div>{tr("Day streak", p.ui)} ({tr("best", p.ui)} {d.best})</div><div className="card"><div className="stat">{d.lessonsToday}</div>{tr("Quizzes today", p.ui)}</div></div>
    <div className="grid"><div className="card stack"><h3>{tr("Recommended lesson", p.ui)}</h3>{d.rec ? <><b>{UNITS.find(x => x.id === d.rec)!.level}: {UNITS.find(x => x.id === d.rec)!.title}</b><a href={`/unit/${d.rec}`}><button>{tr("Continue journey", p.ui)}</button></a></> : <p>✓</p>}</div>
      <div className="card stack"><h3>{tr("Daily goal", p.ui)}</h3><p>{d.goal} {tr("minutes", p.ui)}</p><h3>{tr("Daily challenge", p.ui)}</h3><span className="tag">{tr("Planned", p.ui)}</span></div>
      <div className="card stack"><h3>{tr("Latest Mega Test", p.ui)}</h3>{d.exam ? <><div className="stat">{d.exam.percent}%</div><small>{new Date(d.exam.created_at).toLocaleDateString()} · {d.exam.mode}</small><a href={`/exam/report/${d.exam.id}`}><button className="ghost">Report</button></a></> : <><p>No Mega Test taken yet.</p><a href="/exam"><button className="ghost">{tr("Mega Test", p.ui)}</button></a></>}</div>
      <div className="card stack"><h3>{tr("Offline lessons", p.ui)}</h3><p>{d.dl} / {UNITS.length} {tr("Downloaded", p.ui)}</p><a href="/downloads"><button className="ghost">{tr("Downloads", p.ui)}</button></a></div></div>
    <div className="card"><h3>{tr("XP, last 7 days", p.ui)}</h3>{d.week.length ? <div className="bars" aria-label="Weekly XP">{d.week.map(w => <div key={w.day} title={`${w.day}: ${w.xp} XP`} style={{ height: `${(w.xp / max) * 100}%` }} />)}</div> : <p>No activity yet. Try the word quiz!</p>}</div>
    <div className="card"><h3>{tr("Course path", p.ui)}</h3>{course.levels.map(l => <p key={l.level}><b>{l.level}</b> {l.title}: {l.units.map(u => `${u.title} (${u.status})`).join(", ")}</p>)}</div>
    <div className="card"><h3>{tr("Module status", p.ui)}</h3>{MODULES.map(([m, s]) => <p key={m}>{m}: <span className="tag">{s}</span></p>)}</div></main></>);
}
