"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { tr } from "./i18n";
export type Lang = "roman_urdu" | "urdu" | "hindi";
export type Ui = "en" | "ur" | "hi";
export const UI_NAMES: Record<Ui, string> = { en: "🇬🇧 English", ur: "🇵🇰 اردو", hi: "🇮🇳 हिन्दी" };
const isUi = (v: string | null): v is Ui => v === "en" || v === "ur" || v === "hi";
export function useUi(): Ui { const [ui, setUi] = useState<Ui>("en"); useEffect(() => { const r = () => { const v = localStorage.getItem("lp_ui"); if (isUi(v)) setUi(v); }; r(); window.addEventListener("lp-ui", r); return () => window.removeEventListener("lp-ui", r); }, []); return ui; }
export const LANG_NAMES: Record<Lang, string> = { roman_urdu: "Roman Urdu", urdu: "اردو", hindi: "हिन्दी" };
export function usePrefs() {
  const [lang, setL] = useState<Lang>("roman_urdu"); const [theme, setT] = useState<"light" | "dark">("light"); const [large, setG] = useState(false); const ui = useUi();
  useEffect(() => { const l = localStorage.getItem("lp_lang") as Lang | null; if (l && l in LANG_NAMES) setL(l);
    if (localStorage.getItem("lp_theme") === "dark") setT("dark"); setG(localStorage.getItem("lp_large") === "1"); }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.large = large ? "1" : "0"; }, [theme, large]);
  useEffect(() => { const h = document.documentElement; h.dir = ui === "ur" ? "rtl" : "ltr"; h.lang = ui; h.dataset.ui = ui; }, [ui]);
  return { lang, theme, large, ui, setUi: (u: Ui) => { localStorage.setItem("lp_ui", u); window.dispatchEvent(new Event("lp-ui")); },
    setLang: (l: Lang) => { setL(l); localStorage.setItem("lp_lang", l);
      if (supabase) supabase.auth.getSession().then(({ data }) => { if (data.session) void supabase!.from("profiles").update({ explain_language: l }).eq("id", data.session.user.id).then(() => {}); }); },
    toggleTheme: () => { const t = theme === "light" ? "dark" : "light"; setT(t); localStorage.setItem("lp_theme", t); },
    toggleLarge: () => { setG(!large); localStorage.setItem("lp_large", large ? "0" : "1"); } };
}
export type Prefs = ReturnType<typeof usePrefs>;
export function TopBar({ p, children }: { p: Prefs; children?: React.ReactNode }) {
  return (<header className="bar"><a href="/dashboard" className="brand"><img src="/brand/app-icon.png" alt="" width={36} height={36} />TALORA</a>
    <nav>{children}<select aria-label="Interface language" value={p.ui} onChange={e => p.setUi(e.target.value as Ui)}>{(Object.keys(UI_NAMES) as Ui[]).map(k => <option key={k} value={k}>{UI_NAMES[k]}</option>)}</select></nav></header>);
}
