// Rule-based checks (not AI). They only know simple patterns; see KNOWN_LIMITATIONS.
type R = { ok: boolean; msg: string };
const words = (s: string) => s.trim().replace(/[.!?]$/, "").split(/\s+/);
const basic = (t: string): R | null => !/^[A-Z]/.test(t.trim()) ? { ok: false, msg: "Start with a capital letter." } : !/[.!?]$/.test(t.trim()) ? { ok: false, msg: "End the sentence with a full stop." } : words(t).length < 3 ? { ok: false, msg: "Write a slightly longer sentence." } : null;
export function checkGoes(s: string): R {
  const b = basic(s); if (b) return b; const w = words(s), subj = w[0].toLowerCase(), verb = w[1].toLowerCase();
  if (["i", "you", "we", "they"].includes(subj)) return { ok: false, msg: "Use he, she, it or one person's name here, so the verb takes -s or -es." };
  const fix: Record<string, string> = { go: "goes", study: "studies", do: "does", have: "has" };
  if (fix[verb] || ["play", "work", "eat", "read", "walk", "live"].includes(verb)) return { ok: false, msg: `With one person use "${fix[verb] ?? verb + "s"}", not "${verb}".` };
  return /s$/.test(verb) ? { ok: true, msg: "Great sentence! The verb correctly takes -s or -es." } : { ok: false, msg: "The verb should end with -s or -es (goes, plays, studies)." };
}
const AUX: Record<string, string> = { i: "am", he: "is", she: "is", it: "is", we: "are", you: "are", they: "are" };
export function checkContinuous(s: string): R {
  const b = basic(s); if (b) return b; const w = words(s), exp = AUX[w[0].toLowerCase()] ?? "is";
  if (w[1]?.toLowerCase() !== exp) return { ok: false, msg: `Use "${exp}" after "${w[0]}".` };
  return /ing$/i.test(w[2] ?? "") ? { ok: true, msg: `Well done! "${w[0]} ${exp} + verb-ing" shows an action happening now.` } : { ok: false, msg: "After am/is/are, use a verb ending in -ing (sleeping, cooking)." };
}
