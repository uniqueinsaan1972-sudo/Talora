"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { usePrefs, TopBar, UI_NAMES, LANG_NAMES, Ui, Lang } from "../../lib/prefs";
import { isMuted, setMuted } from "../../lib/audio";
import { tr } from "../../lib/i18n";
import Dagoruna from "../../components/Dagoruna";
export default function Profile() {
  const p = usePrefs(); const router = useRouter(); const [who, setWho] = useState<{ email: string; name: string } | null>(null); const [mute, setMute] = useState(false);
  useEffect(() => { setMute(isMuted()); (async () => { if (!supabase) return; const { data: s } = await supabase.auth.getSession(); if (!s.session) return router.replace("/");
    const { data } = await supabase.from("profiles").select("full_name").eq("id", s.session.user.id).maybeSingle(); setWho({ email: s.session.user.email ?? "", name: data?.full_name ?? "" }); })(); }, [router]);
  const out = async () => { await supabase?.auth.signOut(); router.replace("/"); };
  return (<><TopBar p={p} /><main className="stack"><div className="card hero"><div className="stack"><h1>{who?.name || tr("Profile", p.ui)}</h1><p>{who?.email}</p></div><Dagoruna pose="happy" size={130} /></div>
    <div className="card stack"><h3>{tr("Interface language", p.ui)}</h3><select aria-label="Interface language" value={p.ui} onChange={e => p.setUi(e.target.value as Ui)}>{(Object.keys(UI_NAMES) as Ui[]).map(k => <option key={k} value={k}>{UI_NAMES[k]}</option>)}</select>
      <h3>{tr("Lesson explanations", p.ui)}</h3><select aria-label="Lesson explanations" value={p.lang} onChange={e => p.setLang(e.target.value as Lang)}>{(Object.keys(LANG_NAMES) as Lang[]).map(k => <option key={k} value={k}>{LANG_NAMES[k]}</option>)}</select></div>
    <div className="card stack"><h3>{tr("Appearance", p.ui)}</h3><button className="ghost" aria-pressed={p.theme === "dark"} onClick={p.toggleTheme}>{tr("Dark theme", p.ui)}: {p.theme === "dark" ? "✓" : "–"}</button>
      <button className="ghost" aria-pressed={p.large} onClick={p.toggleLarge}>{tr("Larger text", p.ui)}: {p.large ? "✓" : "–"}</button>
      <button className="ghost" aria-pressed={!mute} onClick={() => { setMuted(!mute); setMute(!mute); }}>{tr("Sound", p.ui)}: {mute ? "–" : "✓"}</button></div>
    <a href="/downloads"><button className="ghost" style={{ width: "100%" }}>{tr("Downloads", p.ui)}</button></a>
    <div className="card stack"><h3>{tr("Account", p.ui)}</h3><button onClick={out}>{tr("Log out", p.ui)}</button></div></main></>);
}
