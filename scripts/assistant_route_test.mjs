// Integration test of /api/dagoruna with MOCK Supabase (port 4010) and MOCK Anthropic (port 4011). No real keys or accounts are used.
// Run twice: PROVIDER=gemini (server env GEMINI_API_KEY=test GEMINI_BASE_URL=http://localhost:4011) and PROVIDER=anthropic (ANTHROPIC_API_KEY=test ANTHROPIC_BASE_URL=http://localhost:4011).
// Usage: build the web app with NEXT_PUBLIC_SUPABASE_URL=http://localhost:4010 NEXT_PUBLIC_SUPABASE_ANON_KEY=anon, then start it on :3077 with
// ANTHROPIC_API_KEY=test ANTHROPIC_BASE_URL=http://localhost:4011 ASSISTANT_DAILY_LIMIT=3 and run: node scripts/assistant_route_test.mjs
import http from "http";
let used = 0, lastBody = null, lastHeaders = null;
const srv = (port, h) => new Promise(r => { const s = http.createServer((q, s2) => { let b = ""; q.on("data", d => b += d); q.on("end", () => h(q, s2, b)); }).listen(port, r); });
await srv(4010, (q, s, b) => { const ok = (q.headers.authorization ?? "") === "Bearer good";
  if (q.url.startsWith("/auth/v1/user")) { s.writeHead(ok ? 200 : 401, { "content-type": "application/json" }); return s.end(JSON.stringify(ok ? { id: "u1", aud: "authenticated", role: "authenticated", email: "a@b.c" } : { message: "bad" })); }
  if (q.url.startsWith("/rest/v1/rpc/assistant_take_quota")) { used++; if (used > 3) { s.writeHead(400, { "content-type": "application/json" }); return s.end(JSON.stringify({ message: "quota", code: "P0001" })); } s.writeHead(200, { "content-type": "application/json" }); return s.end(String(used)); }
  s.writeHead(404); s.end(); });
const G = process.env.PROVIDER === "gemini"; let lastUrl = "";
await srv(4011, (q, s, b) => { lastBody = JSON.parse(b); lastHeaders = q.headers; lastUrl = q.url; s.writeHead(200, { "content-type": "application/json" }); s.end(JSON.stringify(G ? { candidates: [{ content: { parts: [{ text: "Synonym ka matlab hota hai ..." }] } }] } : { content: [{ type: "text", text: "Synonym ka matlab hota hai ..." }] })); });
const SYS = () => (G ? lastBody.systemInstruction.parts[0].text : lastBody.system), LAST = () => (G ? lastBody.contents.at(-1).parts[0].text : lastBody.messages.at(-1).content);
const call = (body, tok = "good") => fetch("http://localhost:3077/api/dagoruna", { method: "POST", headers: { "content-type": "application/json", ...(tok ? { authorization: "Bearer " + tok } : {}) }, body: typeof body === "string" ? body : JSON.stringify(body) });
const T = (n, c) => console.log(c ? "PASS" : "FAIL", n);
T("no token -> 401", (await call({ messages: [{ role: "user", content: "hi" }] }, "")).status === 401);
T("bad token -> 401", (await call({ messages: [{ role: "user", content: "hi" }] }, "bad")).status === 401);
T("bad json -> 400", (await call("{nope")).status === 400);
T("empty messages -> 400", (await call({ messages: [] })).status === 400);
T("script in word -> 400", (await call({ messages: [{ role: "user", content: "hi" }], word: { en: "<b>" } })).status === 400);
let r = await call({ messages: [{ role: "user", content: "Synonym kya hota hai?" }], word: { en: "subtle", urdu: "باریک" } }); let d = await r.json();
T("valid question -> 200 + reply", r.status === 200 && d.reply.length > 0);
T("api key sent server-side only", G ? lastHeaders["x-goog-api-key"] === "test" && lastUrl.startsWith("/v1beta/models/gemini-2.5-flash:generateContent") : lastHeaders["x-api-key"] === "test" && lastHeaders["anthropic-version"] === "2023-06-01");
T("Roman Urdu detected as ur in system prompt", SYS().includes("last message: ur"));
T("scope rule + word data in system prompt", SYS().includes("ONLY help with learning English") && SYS().includes('"en":"subtle"'));
if (G) T("roles mapped for Gemini (user/model)", lastBody.contents.every(c => c.role === "user" || c.role === "model"));
T("user messages forwarded", LAST() === "Synonym kya hota hai?");
r = await call({ messages: [{ role: "user", content: "What is a synonym?" }] }); T("second ok", r.status === 200); T("English detected as en", SYS().includes("last message: en"));
r = await call({ messages: [{ role: "user", content: "Synonym का मतलब क्या होता है?" }] }); T("third ok", r.status === 200); T("Hindi detected as hi", SYS().includes("last message: hi"));
r = await call({ messages: [{ role: "user", content: "one more" }] }); T("over daily quota -> 429 quota", r.status === 429 && (await r.json()).error === "quota");
process.exit(0);
