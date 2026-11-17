"use client";
import { useEffect, useState } from "react";
import journey from "@content/journey.json";
import { UNITS, megaId } from "../../lib/units";
import { supabase } from "../../lib/supabase";
import { usePrefs, TopBar } from "../../lib/prefs";
export default function Journey() {
  const p = usePrefs(); const [passed, setPassed] = useState<string[]>([]); const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => { (async () => { if (!supabase) return; const { data: s } = await supabase.auth.getSession(); if (!s.session) return; setLoggedIn(true);
    const { data } = await supabase.from("test_attempts").select("test_id").eq("user_id", s.session.user.id).eq("passed", true); setPassed((data ?? []).map((r: { test_id: string }) => r.test_id)); })(); }, []);
  const done = (id: string) => passed.includes(`${id}-mega`); const allDone = UNITS.every(u => done(u.id));
  return (<><TopBar p={p}><a href="/dashboard"><button className="ghost">Dashboard</button></a></TopBar><main className="stack"><h1>Your English journey</h1>
    <p>From “Hello” to confident, professional English. Pass each level’s Mega Test to unlock the next. Units marked Planned are not built yet.</p>
    {allDone && <div className="card"><b>You finished every available level!</b> <a href="/congratulations">See your congratulations →</a></div>}
    {journey.levels.map(l => <div className="card stack" key={l.level}><h2>{l.level}: {l.title}</h2>{l.units.map(u => { const id = (u as { id?: string }).id; const i = UNITS.findIndex(x => x.id === id);
      const locked = loggedIn && i > 0 && !done(UNITS[i - 1].id);
      return <div key={u.title} style={{ display: "flex", justifyContent: "space-between", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}><span>{u.title}</span>
        {!id ? <span className="tag">Planned</span> : done(id) ? <span className="tag">Completed ✓</span> : locked ? <span className="tag">Locked: finish {UNITS[i - 1].level} first</span> : <a href={`/unit/${id}`}><button>Start</button></a>}</div>; })}</div>)}</main></>);
}
