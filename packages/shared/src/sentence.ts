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

// ---- A2-C1 checks (same rule-based approach) ----
const IRR = "went ate saw had was were did took made came got bought wrote gave met left found told said knew ran drank slept woke sat stood spoke read paid sent lost kept held";
const PAST_IRR = new RegExp(`^(${IRR.split(" ").join("|")})$`, "i");
const PART_IRR = new RegExp("^(been|gone|done|seen|made|taken|left|sent|met|paid|had|bought|written|eaten|known|got|told|said|found|kept|held|read|run|come|become|given|spoken|broken|chosen|lost|begun|drunk)$", "i");
const isPart = (w?: string) => !!w && (/(ed|en)$/i.test(w) || PART_IRR.test(w));
const ADV = /^(never|already|just|ever|not|also|still)$/i;
const skipAdv = (w: string[], i: number) => (ADV.test(w[i] ?? "") ? i + 1 : i);
export function checkPast(s: string): R {
  const b = basic(s); if (b) return b; const w = words(s);
  return w.slice(1).some(x => /^\w+ed$/i.test(x) || PAST_IRR.test(x)) ? { ok: true, msg: "Good! You used a past form (like played, went or ate)." } : { ok: false, msg: "Use a past verb: add -ed (played) or use an irregular form (went, ate, saw)." };
}
export function checkPerfect(s: string): R {
  const b = basic(s); if (b) return b; const w = words(s), s0 = w[0].toLowerCase();
  const exp = ["i", "you", "we", "they"].includes(s0) ? "have" : "has";
  if (w[1]?.toLowerCase() !== exp) return { ok: false, msg: `Use "${exp}" after "${w[0]}".` };
  return isPart(w[skipAdv(w, 2)]) ? { ok: true, msg: `Well done! "${exp} + past participle" links the past to now.` } : { ok: false, msg: "After have/has use a past participle (finished, written, gone, seen)." };
}
export function checkPastPerfect(s: string): R {
  const b = basic(s); if (b) return b; const w = words(s);
  if (w[1]?.toLowerCase() !== "had") return { ok: false, msg: `Use "had" after "${w[0]}" (had + past participle).` };
  return isPart(w[skipAdv(w, 2)]) ? { ok: true, msg: "Great! Past perfect shows the action that happened first." } : { ok: false, msg: "After had, use a past participle (finished, left, eaten, gone)." };
}
export function checkFuturePerfect(s: string): R {
  const b = basic(s); if (b) return b; const w = words(s).map(x => x.toLowerCase().replace(/,$/, "")); const i = w.findIndex((x, k) => x === "will" && w[k + 1] === "have");
  if (i < 0) return { ok: false, msg: 'Use "will have" + a past participle, for example: will have finished.' };
  return isPart(w[skipAdv(w, i + 2)]) ? { ok: true, msg: "Excellent! That is a correct future perfect sentence." } : { ok: false, msg: "After will have, use a past participle (completed, sent, left, written)." };
}
