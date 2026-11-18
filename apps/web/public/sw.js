// TALORA service worker: caches the app shell and downloaded lessons. Network is always tried first for pages.
const V = "talora-v2", STATIC = V + "-static", PAGES = V + "-pages";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => { for (const k of await caches.keys()) if (!k.startsWith(V)) await caches.delete(k); await self.clients.claim(); })()));
const isAsset = u => /^\/(_next\/static|dagoruna|brand|icons)\//.test(u.pathname);
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (isAsset(u)) { e.respondWith(caches.open(STATIC).then(async c => (await c.match(r)) || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))); return; }
  if (r.mode === "navigate") e.respondWith(caches.open(PAGES).then(async c => { try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; } catch { return (await c.match(r, { ignoreSearch: true })) || (await c.match("/")) || Response.error(); } }));
});
self.addEventListener("message", e => {
  const d = e.data; if (!d || d.type !== "DOWNLOAD") return; const port = e.ports[0];
  e.waitUntil((async () => { try {
    const pc = await caches.open(PAGES), sc = await caches.open(STATIC), assets = new Set(d.assets || []);
    for (const p of d.urls || []) { const res = await fetch(p, { cache: "no-store" }); if (!res.ok) throw new Error("Could not download " + p); const html = await res.clone().text(); await pc.put(p, res); for (const m of html.matchAll(/\/_next\/static\/[^"'\\\s<>]+/g)) assets.add(m[0]); }
    const list = [...assets]; let done = 0;
    for (const a of list) { if (!(await sc.match(a))) { const r = await fetch(a); if (!r.ok) throw new Error("Could not download " + a); await sc.put(a, r); } port.postMessage({ type: "progress", done: ++done, total: list.length }); }
    port.postMessage({ type: "done" });
  } catch (err) { port.postMessage({ type: "error", message: String((err && err.message) || err) }); } })());
});
