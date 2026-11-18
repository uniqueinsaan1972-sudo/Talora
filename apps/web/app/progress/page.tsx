"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UNITS } from "../../lib/units";
import { supabase } from "../../lib/supabase";
import { usePrefs, TopBar } from "../../lib/prefs";
import { tr } from "../../lib/i18n";
type S = { passed: string[]; lessons: string[]; xp: number; exams: { id: number; mode: string; percent: number; created_at: string }[]; days: { day: string; xp: number }[] };
export default function ProgressPage() {
  const p = usePrefs(); const router = useRouter(); const [s, setS] = useState<S | null>(null); const [err, setErr] = useState("");
  useEffect(() => { (async () => { if (!supabase) return setErr("Supabase is not configured."); const { data: se } = await supabase.auth.getSession(); if (!se.session) return router.replace("/"); const uid = se.session.user.id;
    const since = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10); const [a, l, x, ex, dy] = await Promise.all([supabase.from("test_attempts").select("test_id").eq("user_id", uid).eq("passed", true), supabase.from("lesson_progress").select("lesson_id").eq("user_id", uid), supabase.from("xp_transactions").select("amount").eq("user_id", uid), supabase.from("exam_attempts").select("id,mode,percent,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(10), supabase.from("daily_activity").select("day,xp").eq("user_id", uid).gte("day", since).order("day")]);
    if (a.error || l.error || x.error || ex.error || dy.error) return setErr("Could not load progress. Check your internet connection.");
    setS({ passed: (a.data ?? []).map((r: { test_id: string }) => r.test_id), lessons: (l.data ?? []).map((r: { lesson_id: string }) => r.lesson_id), xp: (x.data ?? []).reduce((t: number, r: { amount: number }) => t + r.amount, 0), exams: ex.data ?? [], days: dy.data ?? [] }); })(); }, [router]);
  return (<><TopBar p={p} /><main className="stack"><h1>{tr("Progress", p.ui)}</h1>{err && <div className="msg">{err}</div>}{!s && !err && <div className="skeleton" style={{ height: 200 }} />}
    {s && <><div className="grid"><div className="card"><div className="stat">{s.xp}</div>XP</div><div className="card"><div className="stat">{s.lessons.length}</div>{tr("Lessons", p.ui)}</div><div className="card"><div className="stat">{new Set(s.passed).size}</div>{tr("Tests passed", p.ui)}</div></div>
      {UNITS.map(u => { const t = u.tests.filter(x => s.passed.includes(x.id)).length, l = u.lessons.filter(x => s.lessons.includes(x.id)).length, tot = u.tests.length + u.lessons.length;
        return <div className="card stack" key={u.id}><b>{u.level}: {u.title}</b><progress value={t + l} max={tot} aria-label={`${u.level} progress`} /><small>{l}/{u.lessons.length} {tr("Lessons", p.ui)} · {t}/{u.tests.length} {tr("Tests passed", p.ui)}</small></div>; })}
      <div className="card stack"><h3>XP, last 30 days</h3>{s.days.length ? <div className="bars" aria-label="XP last 30 days">{s.days.map(d => <div key={d.day} title={`${d.day}: ${d.xp} XP`} style={{ height: `${(d.xp / Math.max(10, ...s.days.map(z => z.xp))) * 100}%` }} />)}</div> : <p>No activity yet.</p>}</div>
      <div className="card stack"><h3>{tr("Test history", p.ui)} (Mega Test)</h3>{s.exams.length === 0 && <p>No Mega Test taken yet.</p>}{s.exams.map(e => <a key={e.id} href={`/exam/report/${e.id}`}>{new Date(e.created_at).toLocaleDateString()} · {e.mode} · <b>{e.percent}%</b></a>)}<a href="/exam"><button>{tr("Mega Test", p.ui)}</button></a></div>
      <a href="/congratulations"><button className="ghost">🎉</button></a></>}</main></>);
}
