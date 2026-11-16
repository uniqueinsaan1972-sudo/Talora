"use client";
import { useEffect, useMemo, useState } from "react";
import { checkAnswer, scoreQuiz, xpForScore, shuffle } from "@shared";
import data from "@content/a0_greetings.json";
import { supabase } from "../../lib/supabase";
import { usePrefs, TopBar, Lang } from "../../lib/prefs";
type Word = { en: string; roman_urdu: string; urdu: string; hindi: string; example: string };
const words = data.words as Word[];
const rtl = (l: Lang) => (l === "urdu" ? "rtl" : "");
type Q = { word: Word; options: string[] };
const makeQuiz = (l: Lang): Q[] => shuffle(words).slice(0, 5).map(w => ({ word: w, options: shuffle([w[l], ...shuffle(words.filter(x => x !== w)).slice(0, 3).map(x => x[l])]) }));
export default function Learn() {
  const p = usePrefs(); const [tab, setTab] = useState<"words" | "cards" | "quiz">("words");
  return (<><TopBar p={p}><a href="/dashboard"><button className="ghost">Dashboard</button></a></TopBar><main className="stack">
    <h1>{data.unit}</h1>
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{(["words", "cards", "quiz"] as const).map(t =>
      <button key={t} className={tab === t ? "" : "ghost"} onClick={() => setTab(t)}>{{ words: "Vocabulary", cards: "Flashcards", quiz: "Word quiz" }[t]}</button>)}</div>
    {tab === "words" && <Vocab lang={p.lang} />}{tab === "cards" && <Cards lang={p.lang} />}{tab === "quiz" && <Quiz lang={p.lang} />}
  </main></>);
}
function Vocab({ lang }: { lang: Lang }) {
  const [q, setQ] = useState(""); const list = words.filter(w => w.en.includes(q.toLowerCase()));
  return (<div className="stack"><input placeholder="Search words" aria-label="Search words" value={q} onChange={e => setQ(e.target.value)} />
    <div className="grid">{list.map(w => <div className="card" key={w.en}><h3>{w.en}</h3><div className={rtl(lang)}>{w[lang]}</div><small>{w.example}</small></div>)}</div></div>);
}
function Cards({ lang }: { lang: Lang }) {
  const [i, setI] = useState(0); const [back, setBack] = useState(false); const w = words[i];
  const go = (d: number) => { setBack(false); setI((i + d + words.length) % words.length); };
  return (<div className="stack"><div className="card flip" role="button" tabIndex={0} onClick={() => setBack(!back)} onKeyDown={e => e.key === "Enter" && setBack(!back)}>
    {back ? <div className={rtl(lang)}>{w[lang]}<br /><small>{w.example}</small></div> : <div>{w.en}<br /><small>Tap to flip</small></div>}</div>
    <div style={{ display: "flex", gap: ".5rem" }}><button className="ghost" onClick={() => go(-1)}>Previous</button><button onClick={() => go(1)}>Next</button><span className="tag">{i + 1} / {words.length}</span></div>
    <small>Flashcards here do not save review schedules yet (see KNOWN_LIMITATIONS).</small></div>);
}
function Quiz({ lang }: { lang: Lang }) {
  const [qs, setQs] = useState<Q[]>(() => makeQuiz(lang)); const [n, setN] = useState(0); const [pick, setPick] = useState<string | null>(null); const [res, setRes] = useState<boolean[]>([]); const [note, setNote] = useState("");
  useEffect(() => { setQs(makeQuiz(lang)); setN(0); setPick(null); setRes([]); setNote(""); }, [lang]);
  const done = res.length === qs.length; const score = useMemo(() => scoreQuiz(res), [res]);
  useEffect(() => { if (!done) return; if (!supabase) return setNote("Log in to save XP to your account.");
    (async () => { const { data: s } = await supabase!.auth.getSession(); if (!s.session) return setNote("Log in to save XP to your account.");
      const day = new Date().toISOString().slice(0, 10);
      const { data: xp, error } = await supabase!.rpc("award_practice_xp");
      setNote(error ? "Could not save XP: " + error.message : xp > 0 ? `+${xp} XP saved.` : "Today's quiz XP was already saved. Practice is still great!"); })(); }, [done]); // eslint-disable-line
  if (done) return (<div className="card stack"><h2>{score.correct} of {score.total} correct</h2><p>Every try helps you learn. Well done!</p>{note && <div className="msg">{note}</div>}
    <button onClick={() => { setQs(makeQuiz(lang)); setN(0); setPick(null); setRes([]); setNote(""); }}>Play again</button></div>);
  const q = qs[n]; const answer = q.word[lang];
  return (<div className="card stack"><span className="tag">Question {n + 1} of {qs.length}</span><h2>What does “{q.word.en}” mean?</h2>
    {q.options.map(o => <button key={o} className={"opt " + (pick ? (checkAnswer(o, [answer]) ? "right" : o === pick ? "wrong" : "") : "") + " " + rtl(lang)} onClick={() => !pick && setPick(o)}>{o}</button>)}
    {pick && <><div className="msg">{checkAnswer(pick, [answer]) ? "Correct! " : "Not quite. "}“{q.word.en}” = {answer}. Example: {q.word.example}</div>
      <button onClick={() => { setRes([...res, checkAnswer(pick, [answer])]); setPick(null); setN(Math.min(n + 1, qs.length - 1)); }}>{n + 1 === qs.length ? "See result" : "Next"}</button></>}</div>);
}
