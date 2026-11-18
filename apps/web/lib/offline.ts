import { mergeQueue } from "@shared";
import { UNITS } from "./units";
import type { SupabaseClient } from "@supabase/supabase-js";
const DB = "talora-offline";
const open = () => new Promise<IDBDatabase>((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function get<T>(k: string, d: T): Promise<T> { try { const db = await open(); return await new Promise<T>(res => { const q = db.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res((q.result as T) ?? d); q.onerror = () => res(d); }); } catch { return d; } }
async function set(k: string, v: unknown) { const db = await open(); return new Promise<void>((res, rej) => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); }
export type Downloaded = Record<string, { at: string }>;
export const getDownloaded = () => get<Downloaded>("downloaded", {});
export const setDownloaded = (d: Downloaded) => set("downloaded", d);
export const saveSnapshot = (uid: string, s: { passed: string[]; done: string[] }) => set("snap:" + uid, s);
export const loadSnapshot = (uid: string) => get<{ passed: string[]; done: string[] } | null>("snap:" + uid, null);
export async function enqueueLesson(lesson: string) { await set("queue", mergeQueue(await get<string[]>("queue", []), lesson)); }
export const queuedLessons = () => get<string[]>("queue", []);
// Sends lessons finished offline to the server (server awards XP, once per lesson).
export async function flushQueue(sb: SupabaseClient): Promise<number> {
  const q = await queuedLessons(); if (!q.length || !navigator.onLine) return 0; let left = [...q];
  for (const l of q) { const { error } = await sb.rpc("complete_lesson", { p_lesson: l }); if (!error || /unknown lesson/.test(error.message)) left = left.filter(x => x !== l); else break; }
  await set("queue", left); return q.length - left.length;
}
const CORE = ["/dashboard", "/journey", "/practice", "/progress", "/profile", "/learn", "/games", "/placement", "/downloads"];
const POSES = ["happy", "excited", "thinking", "reading", "sad", "sleeping", "surprised", "listening", "running", "celebrating", "school"].map(p => `/dagoruna/${p}.png`);
async function send(urls: string[], assets: string[], onProgress?: (d: number, t: number) => void) {
  if (!("serviceWorker" in navigator)) throw new Error("This browser does not support offline downloads.");
  const reg = await navigator.serviceWorker.ready; if (!reg.active) throw new Error("Offline support is not ready yet. Reload the app once and try again.");
  await new Promise<void>((res, rej) => { const ch = new MessageChannel(); ch.port1.onmessage = e => { if (e.data.type === "progress") onProgress?.(e.data.done, e.data.total); else if (e.data.type === "done") res(); else if (e.data.type === "error") rej(new Error(e.data.message)); }; reg.active!.postMessage({ type: "DOWNLOAD", urls, assets }, [ch.port2]); });
}
export async function downloadUnits(ids: string[], onProgress?: (d: number, t: number) => void, withCore = false) {
  if (!navigator.onLine) throw new Error("You need internet to download lessons.");
  await send([...(withCore ? CORE : []), ...ids.map(i => `/unit/${i}`)], withCore ? POSES : [], onProgress);
  const d = await getDownloaded(); for (const i of ids) d[i] = { at: new Date().toISOString() }; await setDownloaded(d);
}
export const downloadAll = (onProgress?: (d: number, t: number) => void) => downloadUnits(UNITS.map(u => u.id), onProgress, true);
export async function removeUnit(id: string) { const d = await getDownloaded(); delete d[id]; await setDownloaded(d); try { await (await caches.open("talora-v2-pages")).delete(`/unit/${id}`); } catch {} }
