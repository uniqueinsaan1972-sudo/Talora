export type ReplyLang = "en" | "ur" | "hi";
const ROMAN = new Set("kya hai hain hota hoti hote mujhe mera meri matlab ka ki ke ko ne nahi nahin kaise kese batao bataiye samjhao samjhaiye mein aap tum kaun kyun kab kahan hoon tha thi aur yeh wo woh lafz jumla seekhna sikhna angrezi kaisay karte karta karti".split(" "));
// Script-based detection. Roman Urdu (Urdu in English letters) counts as Urdu, so the answer is given in Urdu script.
export function detectLang(text: string): ReplyLang {
  const dev = (text.match(/[\u0900-\u097F]/g) ?? []).length, ar = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  if (dev > 0 && dev >= ar) return "hi"; if (ar > 0) return "ur";
  const w = text.toLowerCase().match(/[a-z']+/g) ?? []; const roman = w.filter(x => ROMAN.has(x)).length;
  return roman >= 1 && roman / w.length >= 0.2 ? "ur" : "en";
}
export type ChatMsg = { role: "user" | "assistant"; content: string };
export type WordCtx = { en: string; urdu?: string; hindi?: string; example?: string };
export type ChatOk = { ok: true; messages: ChatMsg[]; word?: WordCtx; lang: ReplyLang }; export type ChatBad = { ok: false; error: string };
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export function validateChat(body: unknown): ChatOk | ChatBad {
  const b = body as { messages?: unknown; word?: unknown } | null; if (!b || !Array.isArray(b.messages)) return { ok: false, error: "messages required" };
  if (b.messages.length < 1 || b.messages.length > 9) return { ok: false, error: "1 to 9 messages allowed" };
  const messages: ChatMsg[] = []; let total = 0;
  for (const m of b.messages as { role?: unknown; content?: unknown }[]) {
    if ((m?.role !== "user" && m?.role !== "assistant") || typeof m.content !== "string") return { ok: false, error: "bad message" };
    const c = m.content.trim(); if (!c || c.length > 800) return { ok: false, error: "message must be 1-800 characters" }; total += c.length; messages.push({ role: m.role, content: c }); }
  if (total > 4000) return { ok: false, error: "conversation too long" }; if (messages[messages.length - 1].role !== "user") return { ok: false, error: "last message must be from the user" };
  let word: WordCtx | undefined; const w = b.word as Record<string, unknown> | undefined;
  if (w) { const en = s(w.en, 60); if (!/^[A-Za-z][A-Za-z '\-]{0,59}$/.test(en)) return { ok: false, error: "bad word" }; word = { en, urdu: s(w.urdu, 80) || undefined, hindi: s(w.hindi, 80) || undefined, example: s(w.example, 200) || undefined }; }
  return { ok: true, messages, word, lang: detectLang(messages[messages.length - 1].content) };
}
