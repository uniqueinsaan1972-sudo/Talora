"use client";
import { usePrefs, TopBar } from "../../lib/prefs";
import { tr } from "../../lib/i18n";
import Dagoruna from "../../components/Dagoruna";
export default function Practice() {
  const p = usePrefs(); const C = [["/exam", "Mega Test", "Vocabulary, grammar, translation, reading, listening"], ["/learn", "Word practice", "A0 words, flashcards, quiz"], ["/games", "Games", "Tic-Tac-Toe"], ["/placement", "Placement test", "A1 to C1"]];
  return (<><TopBar p={p} /><main className="stack"><div className="card hero"><h1>{tr("Practice hub", p.ui)}</h1><Dagoruna pose="excited" size={130} /></div>
    <div className="grid">{C.map(([h, t, d]) => <a key={h} href={h} style={{ textDecoration: "none", color: "inherit" }}><div className="card"><h3>{tr(t, p.ui)}</h3><small>{d}</small></div></a>)}
      <div className="card"><h3>{tr("Daily challenge", p.ui)}</h3><span className="tag">{tr("Planned", p.ui)}</span></div></div></main></>);
}
