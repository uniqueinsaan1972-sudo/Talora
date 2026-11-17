"use client";
import { useEffect, useState } from "react";
import { UNITS } from "../../lib/units";
import { supabase } from "../../lib/supabase";
import Dagoruna, { Confetti } from "../../components/Dagoruna";
import { sfx } from "../../lib/audio";
import { usePrefs, TopBar } from "../../lib/prefs";
export default function Congrats() {
  const p = usePrefs(); const [st, setSt] = useState<{ passed: string[]; xp: number; name: string } | null>(null); const [msg, setMsg] = useState("");
  useEffect(() => { (async () => { if (!supabase) return setMsg("Supabase is not configured."); const { data: s } = await supabase.auth.getSession(); if (!s.session) return setMsg("Log in to see your progress.");
    const uid = s.session.user.id; const [a, x, pr] = await Promise.all([supabase.from("test_attempts").select("test_id").eq("user_id", uid).eq("passed", true), supabase.from("xp_transactions").select("amount").eq("user_id", uid), supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle()]);
    setSt({ passed: [...new Set((a.data ?? []).map((r: { test_id: string }) => r.test_id))], xp: (x.data ?? []).reduce((t: number, r: { amount: number }) => t + r.amount, 0), name: pr.data?.full_name ?? "" }); })(); }, []);
  const all = !!st && UNITS.every(u => st.passed.includes(`${u.id}-mega`));
  useEffect(() => { if (all) sfx("win"); }, [all]);
  return (<><TopBar p={p}><a href="/journey"><button className="ghost">Journey</button></a></TopBar><main className="stack">
    {msg && <div className="msg">{msg}</div>}{st && all && <><Confetti /><div className="card stack" style={{ textAlign: "center", justifyItems: "center" }}><Dagoruna pose="celebrating" size={240} />
      <h1>Congratulations{st.name ? `, ${st.name}` : ""}!</h1><p>You passed the Mega Test of every available level: A1, A2, B1, B2 and C1. Dagoruna is so proud of you!</p><div className="stat">{st.xp} XP</div>
      <p>{UNITS.map(u => u.level).join(" ✓ · ")} ✓</p><small>More units for every level are still being built. This screen is not an official certificate.</small><a href="/games"><button>Relax with a game</button></a></div></>}
    {st && !all && <div className="card stack"><Dagoruna pose="reading" size={160} /><h2>Keep going!</h2>{UNITS.map(u => <p key={u.id}>{u.level}: {st.passed.includes(`${u.id}-mega`) ? "Completed ✓" : "Not finished yet"}</p>)}<a href="/journey"><button>Back to the journey</button></a></div>}</main></>);
}
