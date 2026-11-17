"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { levelFromXp, xpForLevel } from "@shared";
import course from "@content/journey.json";
import { supabase, SETUP_MSG } from "../../lib/supabase";
import { usePrefs, TopBar } from "../../lib/prefs";
type D = { name: string; xp: number; streak: number; best: number; week: { day: string; xp: number }[]; lessonsToday: number };
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
    p.setLang(prof.explain_language);
    const since = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
    const [xp, st, wk] = await Promise.all([supabase.from("xp_transactions").select("amount").eq("user_id", uid), supabase.from("user_streaks").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("daily_activity").select("day,xp,lessons_done").eq("user_id", uid).gte("day", since).order("day")]);
    const today = new Date().toISOString().slice(0, 10);
    setD({ name: prof.full_name, xp: (xp.data ?? []).reduce((a: number, r: { amount: number }) => a + r.amount, 0), streak: st.data?.current_streak ?? 0, best: st.data?.longest_streak ?? 0,
      week: (wk.data ?? []).map((r: { day: string; xp: number }) => ({ day: r.day, xp: r.xp })), lessonsToday: (wk.data ?? []).find((r: { day: string }) => r.day === today)?.lessons_done ?? 0 });
  })(); }, []); // eslint-disable-line
  const out = async () => { await supabase?.auth.signOut(); router.replace("/"); };
  if (err) return (<><TopBar p={p} /><main><div className="msg">{err}</div></main></>);
  if (!d) return (<><TopBar p={p} /><main><p>Loading…</p></main></>);
  const lvl = levelFromXp(d.xp), max = Math.max(10, ...d.week.map(w => w.xp));
  return (<><TopBar p={p}><button className="ghost" onClick={out}>Log out</button></TopBar><main className="stack">
    <section className="hero"><div className="stack"><h1>Hello, {d.name}!</h1><p>Dagoruna is ready when you are. Small steps count.</p><div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><a href="/journey"><button>Continue journey</button></a><a href="/congratulations"><button className="ghost">My progress</button></a><a href="/games"><button className="ghost">Games</button></a><a href="/placement"><button className="ghost">Placement test</button></a><a href="/learn"><button className="ghost">Word practice</button></a></div></div>
      <img src="/brand/lingo-mascot.png" alt="Dagoruna the dragon" style={{ maxHeight: 260, objectFit: "contain" }} /></section>
    <div className="grid"><div className="card"><div className="stat">{d.xp}</div>XP total</div><div className="card"><div className="stat">{lvl}</div>Level (next at {xpForLevel(lvl + 1)} XP)</div>
      <div className="card"><div className="stat">{d.streak}</div>Day streak (best {d.best})</div><div className="card"><div className="stat">{d.lessonsToday}</div>Quizzes today</div></div>
    <div className="card"><h3>XP, last 7 days</h3>{d.week.length ? <div className="bars" aria-label="Weekly XP">{d.week.map(w => <div key={w.day} title={`${w.day}: ${w.xp} XP`} style={{ height: `${(w.xp / max) * 100}%` }} />)}</div> : <p>No activity yet. Try the word quiz!</p>}</div>
    <div className="card"><h3>Course path</h3>{course.levels.map(l => <p key={l.level}><b>{l.level}</b> {l.title}: {l.units.map(u => `${u.title} (${u.status})`).join(", ")}</p>)}</div>
    <div className="card"><h3>Module status</h3>{MODULES.map(([m, s]) => <p key={m}>{m}: <span className="tag">{s}</span></p>)}</div></main></>);
}
