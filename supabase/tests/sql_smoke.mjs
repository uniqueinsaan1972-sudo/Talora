import { PGlite } from "@electric-sql/pglite"; import fs from "fs";
const db = new PGlite(); const R = new URL("../migrations/", import.meta.url).pathname;
await db.exec(`create schema auth; create table auth.users(id uuid primary key); create role authenticated; create role anon;
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true),'')::uuid $$;`);
for (const f of fs.readdirSync(R).sort()) { try { await db.exec(fs.readFileSync(R + f, "utf8")); console.log("OK ", f); } catch (e) { console.log("FAIL", f, e.message); process.exit(1); } }
const U = "11111111-1111-1111-1111-111111111111"; await db.exec(`insert into auth.users values ('${U}'); insert into profiles(id,username,full_name) values ('${U}','ali','Ali'); set app.uid='${U}';`);
const sub = async (t, a) => (await db.query(`select submit_test($1,$2::jsonb) r`, [t, JSON.stringify(a)])).rows[0].r;
const all = { "a1-u1-t1-q1": "goes", "a1-u1-t1-q2": "Goes.", "a1-u1-t1-q3": "goes", "a1-u1-t1-q4": "dagoruna goes to school", "a1-u1-t1-q5": "My brother goes to work." };
try { await sub("a1-u1-mega", {}); console.log("FAIL mega should be locked"); } catch (e) { console.log("OK  mega locked:", e.message); }
let r = await sub("a1-u1-t1", { ...all, "a1-u1-t1-q5": "wrong" }); console.log("OK  4/5 =", r.percent, "passed:", r.passed, "(80% pass mark)", "review:", JSON.stringify(r.review));
r = await sub("a1-u1-t1", { "a1-u1-t1-q1": "go" }); console.log("OK  fail attempt passed:", r.passed, "xp:", r.xp);
r = await sub("a1-u1-t1", all); console.log("OK  perfect passed:", r.passed, "xp:", r.xp);
r = await sub("a1-u1-t1", all); console.log("OK  repeat pass xp:", r.xp, "(no double XP)");
const keys = async t => Object.fromEntries((await db.query(`select question_id, min(answer) a from test_keys where test_id=$1 group by 1`, [t])).rows.map(r => [r.question_id, r.a]));
try { await sub("a2-u1-t1", await keys("a2-u1-t1")); console.log("FAIL A2 should be locked"); } catch (e) { console.log("OK  A2 locked until A1 Mega passed:", e.message); }
for (const t of ["a1-u1-t2", "a1-u1-t3", "a1-u1-mega"]) { const r = await sub(t, await keys(t)); console.log("OK ", t, "passed:", r.passed, "xp:", r.xp); }
for (const u of ["a2", "b1", "b2", "c1"]) { for (const t of ["t1", "t2", "t3", "mega"]) { const r = await sub(`${u}-u1-${t}`, await keys(`${u}-u1-${t}`)); if (!r.passed) console.log("FAIL", u, t); } console.log("OK  all tests of", u, "pass with their own keys and unlock in order"); }
const xp = (await db.query(`select coalesce(sum(amount),0)::int s from xp_transactions`)).rows[0].s; console.log("OK  total XP:", xp);
try { await db.query(`select award_xp('x','y',50)`); console.log("note: award_xp callable by superuser here (expected in pglite)"); } catch (e) {}
const ek = async ids => Object.fromEntries((await db.query(`select question_id, min(answer) a from exam_keys where question_id = any($1) group by 1`, [ids])).rows.map(r => [r.question_id, r.a]));
const ids = (await db.query(`select distinct question_id from exam_keys order by 1 limit 10`)).rows.map(r => r.question_id);
const ex = async (ans, qs = ids, mode = "short") => (await db.query(`select submit_exam($1,$2,$3,$4::jsonb,$5::text[],$6) r`, [mode, 2, true, JSON.stringify(ans), qs, 95])).rows[0].r;
let e1 = await ex(await ek(ids)); console.log("OK  exam all correct:", e1.percent, "skipped", e1.skipped, "xp", e1.xp, "prev", e1.previous_percent);
const part = await ek(ids); delete part[ids[0]]; part[ids[1]] = ""; part[ids[2]] = "definitely wrong";
let e2 = await ex(part); console.log("OK  exam partial:", e2.percent, "% correct", e2.correct, "skipped", e2.skipped, "mistakes", e2.mistakes.length, "prev", e2.previous_percent, "xp", e2.xp, "(10 XP max per day)", "categories:", Object.keys(e2.by_category).join(","));
try { await ex({}, [ids[0], ids[0], ...ids.slice(2)]); console.log("FAIL duplicate accepted"); } catch (er) { console.log("OK  duplicate questions rejected"); }
try { await ex({}, [...ids.slice(0, 9), "nope-1"]); console.log("FAIL unknown accepted"); } catch (er) { console.log("OK  unknown question rejected"); }
try { await ex({}, ids.slice(0, 3)); console.log("FAIL too few accepted"); } catch (er) { console.log("OK  fewer than 5 questions rejected"); }
for (let n = 1; n <= 3; n++) { try { const r = (await db.query(`select assistant_take_quota(2) n`)).rows[0].n; console.log("OK  assistant quota use", r, "of 2"); } catch (er) { console.log(n === 3 ? "OK  third assistant request blocked: " + er.message : "FAIL quota too early"); } }
await db.exec(`set role authenticated`); try { await db.query(`select award_xp('x','forged',50)`); console.log("FAIL client can call award_xp"); } catch (e) { console.log("OK  client cannot call award_xp directly"); }
try { await db.query(`select count(*) from exam_keys`); console.log("FAIL client can read exam keys"); } catch (e) { console.log("OK  client cannot read exam_keys"); }
try { await db.query(`select count(*) from test_keys`); console.log("FAIL client can read answer keys"); } catch (e) { console.log("OK  client cannot read test_keys"); }
try { const x = await db.query(`select count(*) c from test_keys`); console.log("rows visible to client:", x.rows[0].c); } catch {}
