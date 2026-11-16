"use client";
import journey from "@content/journey.json";
import { usePrefs, TopBar } from "../../lib/prefs";
export default function Journey() {
  const p = usePrefs();
  return (<><TopBar p={p}><a href="/dashboard"><button className="ghost">Dashboard</button></a></TopBar><main className="stack"><h1>Your English journey</h1>
    <p>From “Hello” to professional English. Only units marked with a Start button can be studied now; the rest are planned and not unlocked.</p>
    {journey.levels.map(l => <div className="card stack" key={l.level}><h2>{l.level}: {l.title}</h2>{l.units.map(u => <div key={u.title} style={{ display: "flex", justifyContent: "space-between", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
      <span>{u.title}</span>{u.status === "available" ? <a href="/unit/a1-u1"><button>Start</button></a> : <span className="tag">Planned</span>}</div>)}</div>)}</main></>);
}
