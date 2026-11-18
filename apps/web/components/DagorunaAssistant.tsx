"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { detectLang, ReplyLang, WordCtx } from "@shared";
import { supabase } from "../lib/supabase";
import { useUi } from "../lib/prefs";
type Msg = { role: "user" | "assistant"; text: string; lang: ReplyLang };
type Pose = "happy" | "listening" | "thinking" | "excited" | "surprised";
const WELCOME = { en: "Hi! I'm DAGORUNA, your personal English-learning buddy! Ask me anything about English. Let's learn together!", ur: "السلام علیکم! میں ڈیگورونا ہوں، آپ کا انگلش سیکھنے کا ساتھی! انگلش کے بارے میں کچھ بھی پوچھیں۔ آئیں مل کر سیکھیں!", hi: "नमस्ते! मैं डेगोरुना हूँ, आपका अंग्रेज़ी सीखने का साथी! अंग्रेज़ी के बारे में कुछ भी पूछिए। आइए साथ मिलकर सीखें!" };
const ERR: Record<string, Record<ReplyLang, string>> = {
  not_configured: { en: "My brain is not connected yet. Ask the app owner to finish the assistant setup.", ur: "میرا دماغ ابھی جڑا نہیں ہے۔ ایپ کے مالک سے اسسٹنٹ کی سیٹنگ مکمل کرنے کو کہیں۔", hi: "मेरा दिमाग़ अभी जुड़ा नहीं है। ऐप के मालिक से असिस्टेंट की सेटिंग पूरी करने को कहें।" },
  unauthorized: { en: "Please log in to talk with me.", ur: "مجھ سے بات کرنے کے لیے لاگ اِن کریں۔", hi: "मुझसे बात करने के लिए लॉग इन करें।" },
  quota: { en: "You have used today's questions. Come back tomorrow, and keep practising!", ur: "آج کے سوالات ختم ہو گئے۔ کل واپس آئیں اور مشق جاری رکھیں!", hi: "आज के सवाल पूरे हो गए। कल वापस आइए और अभ्यास जारी रखिए!" },
  slow_down: { en: "Please wait a moment before the next question.", ur: "اگلے سوال سے پہلے ذرا انتظار کریں۔", hi: "अगले सवाल से पहले ज़रा रुकिए।" },
  offline: { en: "I need internet to answer. Please reconnect and try again.", ur: "جواب دینے کے لیے انٹرنیٹ چاہیے۔ دوبارہ جڑیں اور کوشش کریں۔", hi: "जवाब देने के लिए इंटरनेट चाहिए। दोबारा जुड़िए और कोशिश कीजिए।" },
  other: { en: "Sorry, I could not answer right now. Please try again in a moment.", ur: "معذرت، ابھی جواب نہیں دے سکا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔", hi: "माफ़ कीजिए, अभी जवाब नहीं दे सका। थोड़ी देर बाद फिर कोशिश कीजिए।" },
};
const BCP: Record<ReplyLang, string> = { en: "en-US", ur: "ur-PK", hi: "hi-IN" }; const RATE = { slow: 0.65, normal: 0.95, fast: 1.2 };
const ACTIONS: [string, string][] = [["Explain this word", "Explain this word."], ["More examples", "Give me 3 more example sentences with this word."], ["Make a sentence", "Help me make my own sentence with this word, and correct it."], ["Explain in Urdu", "Explain this word in Urdu."], ["Explain in Hindi", "Explain this word in Hindi."], ["Test me", "Test me on this word with one short question."]];
type SR = { lang: string; interimResults: boolean; onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
export default function DagorunaAssistant() {
  const ui = useUi(); const [open, setOpen] = useState(false); const [msgs, setMsgs] = useState<Msg[]>([]); const [input, setInput] = useState(""); const [busy, setBusy] = useState(false); const [listening, setListening] = useState(false); const [speaking, setSpeaking] = useState(false);
  const [word, setWord] = useState<WordCtx | null>(null); const [notice, setNotice] = useState(""); const [perm, setPerm] = useState(""); const [err, setErr] = useState(false); const [cfg, setCfg] = useState({ voice: true, textOnly: false, speed: "normal" as keyof typeof RATE, mic: "en-US" });
  const end = useRef<HTMLDivElement>(null), rec = useRef<SR | null>(null), msgsRef = useRef<Msg[]>([]); msgsRef.current = msgs; const sendRef = useRef<(t: string, w?: WordCtx | null) => void>(() => {});
  useEffect(() => { try { const c = localStorage.getItem("lp_dg_cfg"); if (c) setCfg(x => ({ ...x, ...JSON.parse(c) })); const h = localStorage.getItem("lp_dg_chat"); if (h) setMsgs(JSON.parse(h)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("lp_dg_cfg", JSON.stringify(cfg)); } catch {} }, [cfg]);
  useEffect(() => { try { localStorage.setItem("lp_dg_chat", JSON.stringify(msgs.slice(-20))); } catch {} end.current?.scrollIntoView({ block: "end" }); }, [msgs, open]);
  useEffect(() => { navigator.permissions?.query({ name: "microphone" as PermissionName }).then(s => { setPerm(s.state); s.onchange = () => setPerm(s.state); }).catch(() => {}); }, []);
  const stop = useCallback(() => { if ("speechSynthesis" in window) speechSynthesis.cancel(); setSpeaking(false); }, []);
  const speak = useCallback((text: string, lang: ReplyLang) => { setNotice(""); if (!("speechSynthesis" in window)) return setNotice("Voice output is not supported on this device. You can read the answer."); stop();
    const v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith(lang)); if (!v && lang !== "en") return setNotice(lang === "ur" ? "No Urdu voice is installed on this device. You can read the answer." : "No Hindi voice is installed on this device. You can read the answer.");
    const u = new SpeechSynthesisUtterance(text); u.lang = BCP[lang]; if (v) u.voice = v; u.rate = RATE[cfg.speed]; u.pitch = 1; u.onstart = () => setSpeaking(true); u.onend = u.onerror = () => setSpeaking(false); speechSynthesis.speak(u); }, [cfg.speed, stop]);
  const send = useCallback(async (text: string, w?: WordCtx | null) => { const t = text.trim(); if (!t || busy) return; stop(); setErr(false); const lang = detectLang(t); const history = [...msgsRef.current, { role: "user" as const, text: t, lang }]; setMsgs(history); setInput(""); setBusy(true);
    const fail = (k: string) => { setErr(true); setMsgs(m => [...m, { role: "assistant", text: ERR[k][lang], lang }]); setBusy(false); };
    if (!navigator.onLine) return fail("offline"); const { data: s } = supabase ? await supabase.auth.getSession() : { data: { session: null } }; if (!s.session) return fail("unauthorized");
    try { const r = await fetch("/api/dagoruna", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${s.session.access_token}` }, body: JSON.stringify({ messages: history.slice(-9).map(m => ({ role: m.role, content: m.text.slice(0, 800) })), word: w ?? undefined }) });
      const d = await r.json().catch(() => ({})); if (!r.ok) return fail(["not_configured", "unauthorized", "quota", "slow_down"].includes(d.error) ? d.error : "other");
      const rl = detectLang(d.reply); setMsgs(m => [...m, { role: "assistant", text: d.reply, lang: rl }]); setBusy(false); if (cfg.voice && !cfg.textOnly) speak(d.reply, rl); } catch { fail("other"); } }, [busy, cfg.voice, cfg.textOnly, speak, stop]);
  sendRef.current = (t, w) => void send(t, w);
  useEffect(() => { const h = (e: Event) => { const d = (e as CustomEvent<{ word?: WordCtx; prompt?: string }>).detail ?? {}; setOpen(true); if (d.word) { setWord(d.word); sendRef.current(d.prompt ?? "Explain this word.", d.word); } }; window.addEventListener("dagoruna:ask", h); return () => window.removeEventListener("dagoruna:ask", h); }, []);
  function mic() { const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }; const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!C) return setNotice("Voice input is not supported in this browser. Please type your question."); if (listening) { rec.current?.stop(); return; } stop(); setNotice("");
    const r = new C(); r.lang = cfg.mic; r.interimResults = false; r.onresult = e => { const t = e.results[0][0].transcript; setListening(false); sendRef.current(t, word); };
    r.onerror = e => { setListening(false); setNotice(e.error === "not-allowed" || e.error === "service-not-allowed" ? "Microphone permission was denied. Allow it in your browser or phone settings, or type your question." : e.error === "no-speech" ? "I did not hear anything. Tap the microphone and try again." : "Voice input failed. Please type your question."); }; r.onend = () => setListening(false); rec.current = r; try { r.start(); setListening(true); } catch { setNotice("Could not start the microphone."); } }
  const last = [...msgs].reverse().find(m => m.role === "assistant"); const pose: Pose = err ? "surprised" : listening ? "listening" : busy ? "thinking" : speaking ? "excited" : "happy"; const st = err ? "err" : listening ? "listen" : busy ? "think" : speaking ? "speak" : "idle";
  if (!open) return <button className={`dg-fab dg-${st}`} aria-label="Open DAGORUNA assistant" onClick={() => setOpen(true)}><img src={`/dagoruna/${pose}.png`} alt="" width={64} height={64} /></button>;
  const dir = (l: ReplyLang) => (l === "ur" ? "rtl" : "ltr");
  return (<div className="dg-panel" role="dialog" aria-label="DAGORUNA assistant">
    <div className="dg-head"><img className={`dg-face dg-${st}`} src={`/dagoruna/${pose}.png`} alt="" width={48} height={48} /><b style={{ flex: 1 }}>DAGORUNA</b>
      {(listening || speaking) && <span className="dg-wave" aria-hidden><i /><i /><i /><i /><i /></span>}
      <button className="ghost dg-sm" onClick={() => { setMsgs([]); setWord(null); stop(); }} aria-label="Clear conversation">Clear</button><button className="ghost dg-sm" onClick={() => { stop(); rec.current?.stop(); setOpen(false); }} aria-label="Minimize">–</button></div>
    <details className="dg-set"><summary>Settings</summary><label><input type="checkbox" checked={cfg.textOnly} onChange={e => setCfg({ ...cfg, textOnly: e.target.checked })} /> Text-only mode</label><label><input type="checkbox" checked={cfg.voice} disabled={cfg.textOnly} onChange={e => setCfg({ ...cfg, voice: e.target.checked })} /> Speak answers</label>
      <label>Speed <select value={cfg.speed} onChange={e => setCfg({ ...cfg, speed: e.target.value as keyof typeof RATE })}><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
      <label>Microphone language <select value={cfg.mic} onChange={e => setCfg({ ...cfg, mic: e.target.value })}><option value="en-US">English</option><option value="ur-PK">اردو</option><option value="hi-IN">हिन्दी</option></select></label><small>Microphone: {perm || "not asked yet"}. It only turns on when you tap the mic button.</small><small>Your questions are sent to an AI service to get answers. Please do not share private information.</small></details>
    <div className="dg-msgs" aria-live="polite"><div className="dg-b dg-a" dir={dir(ui)}>{WELCOME[ui]}</div>{msgs.map((m, i) => <div key={i} className={"dg-b " + (m.role === "user" ? "dg-u" : "dg-a")} dir={dir(m.lang)} lang={m.lang}>{m.text}</div>)}
      {busy && <div className="dg-b dg-a dg-dots" aria-label="DAGORUNA is thinking"><i /><i /><i /></div>}<div ref={end} /></div>
    {notice && <div className="msg" role="status" style={{ margin: "0 .6rem" }}>{notice}</div>}
    {word && <div className="dg-w"><b>{word.en}</b><button className="ghost dg-sm" onClick={() => speak(word.en, "en")}>Pronounce</button><div className="dg-chips">{ACTIONS.map(([l, p]) => <button key={l} className="ghost dg-sm" disabled={busy} onClick={() => send(p, word)}>{l}</button>)}</div></div>}
    <div className="dg-bar">{last && !cfg.textOnly && (speaking ? <button className="ghost dg-sm" onClick={stop} aria-label="Stop speaking">Stop</button> : <button className="ghost dg-sm" onClick={() => speak(last.text, last.lang)} aria-label="Replay answer">Replay</button>)}</div>
    <form className="dg-in" onSubmit={e => { e.preventDefault(); send(input, word); }}>{!cfg.textOnly && <button type="button" className={listening ? "" : "ghost"} aria-pressed={listening} aria-label={listening ? "Stop listening" : "Ask with microphone"} onClick={mic}>{listening ? "■" : "🎤"}</button>}
      <input aria-label="Type your question" value={input} maxLength={800} placeholder="Ask about English…" onChange={e => setInput(e.target.value)} /><button disabled={busy || !input.trim()}>Send</button></form></div>);
}
