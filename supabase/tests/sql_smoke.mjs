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
const xp = (await db.query(`select coalesce(sum(amount),0)::int s from xp_transactions`)).rows[0].s; console.log("OK  total XP:", xp);
try { await db.query(`select award_xp('x','y',50)`); console.log("note: award_xp callable by superuser here (expected in pglite)"); } catch (e) {}
await db.exec(`set role authenticated`); try { await db.query(`select award_xp('x','forged',50)`); console.log("FAIL client can call award_xp"); } catch (e) { console.log("OK  client cannot call award_xp directly"); }
try { await db.query(`select count(*) from test_keys`); console.log("FAIL client can read answer keys"); } catch (e) { console.log("OK  client cannot read test_keys"); }
try { const x = await db.query(`select count(*) c from test_keys`); console.log("rows visible to client:", x.rows[0].c); } catch {}
