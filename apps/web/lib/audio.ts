export const isMuted = () => typeof window !== "undefined" && localStorage.getItem("lp_mute") === "1";
export const setMuted = (m: boolean) => localStorage.setItem("lp_mute", m ? "1" : "0");
export function canSpeak() { return typeof window !== "undefined" && "speechSynthesis" in window; }
export function speak(text: string, slow = false) {
  if (!canSpeak() || isMuted()) return; const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = slow ? 0.6 : 0.95;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
export function sfx(kind: "ok" | "bad" | "win") {
  if (typeof window === "undefined" || isMuted()) return;
  try { const C = window.AudioContext || (window as any).webkitAudioContext; const c = new C();
    const seq = kind === "bad" ? [220, 180] : kind === "win" ? [523, 659, 784, 1047] : [660, 880];
    seq.forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + i * 0.13; o.frequency.value = f; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.start(t); o.stop(t + 0.13); }); } catch {}
}
