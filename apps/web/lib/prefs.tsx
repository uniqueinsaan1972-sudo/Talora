"use client";
import { useEffect, useState } from "react";
import { isMuted, setMuted } from "./audio";
export type Lang = "roman_urdu" | "urdu" | "hindi";
export const LANG_NAMES: Record<Lang, string> = { roman_urdu: "Roman Urdu", urdu: "اردو", hindi: "हिन्दी" };
export function usePrefs() {
  const [lang, setL] = useState<Lang>("roman_urdu"); const [theme, setT] = useState<"light" | "dark">("light"); const [large, setG] = useState(false);
  useEffect(() => { const l = localStorage.getItem("lp_lang") as Lang | null; if (l && l in LANG_NAMES) setL(l);
    if (localStorage.getItem("lp_theme") === "dark") setT("dark"); setG(localStorage.getItem("lp_large") === "1"); }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.large = large ? "1" : "0"; }, [theme, large]);
  return { lang, theme, large,
    setLang: (l: Lang) => { setL(l); localStorage.setItem("lp_lang", l); },
    toggleTheme: () => { const t = theme === "light" ? "dark" : "light"; setT(t); localStorage.setItem("lp_theme", t); },
    toggleLarge: () => { setG(!large); localStorage.setItem("lp_large", large ? "0" : "1"); } };
}
export type Prefs = ReturnType<typeof usePrefs>;
export function TopBar({ p, children }: { p: Prefs; children?: React.ReactNode }) {
  const [mute, setMute] = useState(false); useEffect(() => setMute(isMuted()), []);
  return (<header className="bar"><a href="/" className="brand"><img src="/brand/app-icon.png" alt="" width={36} height={36} />TALORA</a>
    <nav>{children}
      <select aria-label="Explanation language" value={p.lang} onChange={e => p.setLang(e.target.value as Lang)}>
        {(Object.keys(LANG_NAMES) as Lang[]).map(k => <option key={k} value={k}>{LANG_NAMES[k]}</option>)}</select>
      <button className="ghost" onClick={p.toggleTheme} aria-label="Toggle dark theme">{p.theme === "light" ? "Dark" : "Light"}</button>
      <button className="ghost" aria-pressed={mute} onClick={() => { setMuted(!mute); setMute(!mute); }}>{mute ? "Sound off" : "Sound on"}</button>
      <button className="ghost" onClick={p.toggleLarge} aria-pressed={p.large}>Larger text</button></nav></header>);
}
