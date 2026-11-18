"use client";
import { usePathname } from "next/navigation";
import { useUi } from "../lib/prefs";
import { tr } from "../lib/i18n";
const I: Record<string, string> = { home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z", learn: "M4 19V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13", practice: "M13 2L4 14h7l-1 8 9-12h-7z", progress: "M5 20V10M12 20V4M19 20v-7", profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" };
const TABS = [["home", "Home", "/dashboard"], ["learn", "Learn", "/journey"], ["practice", "Practice", "/practice"], ["progress", "Progress", "/progress"], ["profile", "Profile", "/profile"]] as const;
export default function BottomNav() {
  const path = usePathname() ?? "/"; const ui = useUi(); if (path === "/") return null;
  const active = (h: string) => path === h || (h === "/journey" && path.startsWith("/unit")) || (h === "/practice" && /^\/(learn|games|placement|exam)/.test(path)) || (h === "/profile" && path === "/downloads");
  return (<nav className="tabs" aria-label="Main">{TABS.map(([k, l, h]) => <a key={k} href={h} aria-current={active(h) ? "page" : undefined}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={I[k]} /></svg><span>{tr(l, ui)}</span></a>)}</nav>);
}
