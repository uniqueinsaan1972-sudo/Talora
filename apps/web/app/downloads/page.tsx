"use client";
import { useEffect, useState } from "react";
import { UNITS } from "../../lib/units";
import { getDownloaded, downloadUnits, downloadAll, removeUnit, Downloaded } from "../../lib/offline";
import { usePrefs, TopBar } from "../../lib/prefs";
import { tr } from "../../lib/i18n";
export default function Downloads() {
  const p = usePrefs(); const [dl, setDl] = useState<Downloaded>({}); const [busy, setBusy] = useState<string | null>(null); const [pct, setPct] = useState(0); const [err, setErr] = useState<Record<string, string>>({}); const [online, setOnline] = useState(true);
  const refresh = async () => setDl(await getDownloaded());
  useEffect(() => { refresh(); setOnline(navigator.onLine); const u = () => setOnline(navigator.onLine); window.addEventListener("online", u); window.addEventListener("offline", u); return () => { window.removeEventListener("online", u); window.removeEventListener("offline", u); }; }, []);
  async function run(key: string, f: (cb: (d: number, t: number) => void) => Promise<void>) { setBusy(key); setPct(0); setErr(e => ({ ...e, [key]: "" }));
    try { await f((d, t) => setPct(t ? Math.round((d / t) * 100) : 0)); } catch (e) { setErr(x => ({ ...x, [key]: (e as Error).message })); } setBusy(null); refresh(); }
  const state = (id: string) => (busy === id || busy === "all" ? "Downloading…" : dl[id] ? "Downloaded" : "Not downloaded");
  return (<><TopBar p={p} /><main className="stack"><h1>{tr("Downloads", p.ui)}</h1>
    <div className="msg">Downloaded lessons can be read without internet. Tests (graded on the server), XP, login and sync need internet. Lessons you finish offline are saved on this device and sent when you are back online.</div>
    {!online && <div className="msg">You are offline.</div>}
    <button disabled={!!busy || !online} onClick={() => run("all", cb => downloadAll(cb))}>{tr("Download all lessons", p.ui)}</button>{busy === "all" && <progress value={pct} max={100} />}{err.all && <div className="msg">{err.all} <button className="ghost" onClick={() => run("all", cb => downloadAll(cb))}>{tr("Retry", p.ui)}</button></div>}
    {UNITS.map(u => <div className="card stack" key={u.id}><b>{u.level}: {u.title}</b><span className="tag">{tr(state(u.id), p.ui)}</span>{busy === u.id && <progress value={pct} max={100} />}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{dl[u.id] ? <button className="ghost" disabled={!!busy} onClick={async () => { await removeUnit(u.id); refresh(); }}>{tr("Remove", p.ui)}</button> : <button disabled={!!busy || !online} onClick={() => run(u.id, cb => downloadUnits([u.id], cb))}>{tr("Download", p.ui)}</button>}</div>
      {err[u.id] && <div className="msg">{err[u.id]} <button className="ghost" onClick={() => run(u.id, cb => downloadUnits([u.id], cb))}>{tr("Retry", p.ui)}</button></div>}</div>)}</main></>);
}
