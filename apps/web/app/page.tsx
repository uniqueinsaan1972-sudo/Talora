"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, SETUP_MSG } from "../lib/supabase";
import { usePrefs, TopBar, LANG_NAMES, Lang } from "../lib/prefs";
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
export default function Home() {
  const p = usePrefs(); const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup"); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ full_name: "", username: "", email: "", password: "", confirm: "", level: "A0", goal: "", minutes: 10 });
  const set = (k: string, v: string | number) => setF({ ...f, [k]: v });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    if (!supabase) return setMsg(SETUP_MSG);
    if (mode === "signup") {
      if (f.password.length < 8) return setMsg("Password must be at least 8 characters.");
      if (f.password !== f.confirm) return setMsg("Passwords do not match.");
      if (!/^[a-z0-9_]{3,20}$/.test(f.username)) return setMsg("Username: 3-20 characters, lowercase letters, numbers, underscore.");
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password });
      if (error) { setBusy(false); return setMsg(error.message); }
      localStorage.setItem("lp_pending_profile", JSON.stringify({ username: f.username, full_name: f.full_name, explain_language: p.lang, current_level: f.level, goal: f.goal || null, daily_minutes: Number(f.minutes) }));
      if (data.session) router.push("/dashboard"); else setMsg("Account created. Verify your email, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) setMsg(error.message); else router.push("/dashboard");
    }
    setBusy(false);
  }
  return (<><TopBar p={p} /><main>
    <section className="hero"><div className="stack"><h1>Learn English. Enjoy Every Step.</h1>
      <p>Short games, clear explanations in Roman Urdu, Urdu or Hindi, and no shame for wrong answers. Meet Dagoruna, your dragon guide.</p>
      <a href="/learn"><button>Try a lesson now</button></a></div>
      <img src="/brand/lingo-mascot.png" alt="Dagoruna, the blue baby dragon, holding a book" /></section>
    <section className="card stack" style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", gap: ".5rem" }}><button className={mode === "signup" ? "" : "ghost"} onClick={() => setMode("signup")}>Create account</button>
        <button className={mode === "login" ? "" : "ghost"} onClick={() => setMode("login")}>Log in</button></div>
      <form className="stack" onSubmit={submit}>
        {mode === "signup" && <><label>Full name<input required value={f.full_name} onChange={e => set("full_name", e.target.value)} /></label>
          <label>Username<input required value={f.username} onChange={e => set("username", e.target.value.toLowerCase())} /></label></>}
        <label>Email<input type="email" required value={f.email} onChange={e => set("email", e.target.value)} /></label>
        <label>Password<input type="password" required value={f.password} onChange={e => set("password", e.target.value)} /></label>
        {mode === "signup" && <><label>Confirm password<input type="password" required value={f.confirm} onChange={e => set("confirm", e.target.value)} /></label>
          <label>Which language explains best for you?<select value={p.lang} onChange={e => p.setLang(e.target.value as Lang)}>
            {(Object.keys(LANG_NAMES) as Lang[]).map(k => <option key={k} value={k}>{LANG_NAMES[k]}</option>)}</select></label>
          <label>Your English level (choose A0 if unsure)<select value={f.level} onChange={e => set("level", e.target.value)}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></label>
          <label>Why do you want to learn English?<input value={f.goal} onChange={e => set("goal", e.target.value)} /></label>
          <label>Daily study time (minutes)<select value={f.minutes} onChange={e => set("minutes", e.target.value)}>{[5, 10, 20, 30, 60].map(m => <option key={m}>{m}</option>)}</select></label></>}
        <button disabled={busy}>{mode === "signup" ? "Create account" : "Log in"}</button>
        {msg && <div className="msg" role="status">{msg}</div>}
      </form></section></main></>);
}
