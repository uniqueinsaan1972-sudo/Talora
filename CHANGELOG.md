# Changelog
## 0.4.1 (deployment fix)
Fixed: Vercel build failed in `pnpm install` with ERR_INVALID_THIS / ERR_PNPM_META_FETCH_FAIL (a pnpm and Node-version problem; the project had no pnpm lockfile, so pnpm had to fetch every package's metadata). Added apps/web/vercel.json (install with npm) and `engines.node = 22.x` in apps/web/package.json so Vercel uses Node 22 and npm. Deploy with Root Directory = apps/web. See README "Deploy on Vercel". No app code changed.
## 0.4.0 (levels A2, B1, B2, C1 and the congratulations screen)
Added: four new levels, one unit each, in the same format as A1 (1 Dagoruna story lesson with Roman Urdu/Urdu/Hindi, grammar breakdown, why-explanation, 3 examples, rule-based sentence check; Test 1, 2, 3 with 5 questions each; Mega Test with 6 questions; 80% pass mark): A2 Past Simple, B1 Present Perfect, B2 Past Perfect, C1 Future Perfect (with workplace examples).
Added: level locking. Each level's Test 1 requires the previous level's Mega Test, enforced in the database (migration 0005). The unit page and journey map show the lock.
Added: /congratulations screen with confetti, Dagoruna celebrating and your total XP, shown only after the Mega Test of every available level is passed.
Changed: unit page is now one dynamic route /unit/[id] (A1 progress and URLs keep working); journey map shows Completed / Locked / Start from your real test results; dashboard "Continue journey" goes to the journey map; sentence checkers added for past simple, present perfect, past perfect and future perfect.
Authoring: scripts/units_a2_c1.py writes lessons and test sources; scripts/gen_tests.py makes the public test files and the answer-key SQL.
Verified (run): `tsc --noEmit`, `next build`, 25 shared unit tests, and the SQL smoke test over migrations 0001-0005: level lock, 80% pass mark, XP once, every test of every level passes with its own server-side keys in order, clients blocked from award_xp and answer keys.
Not verified: the new pages in a real browser against your Supabase project.
## 0.3.0 (Dagoruna learning upgrade, first slice)
Added: mascot renamed Dagoruna; 11 pose images (happy, excited, thinking, reading, sad, sleeping, surprised, listening, running, celebrating, school) cropped from the supplied sheet; Framer Motion page transitions, spring character entrances, confetti, tap animations (OS reduced-motion honoured); sound effects with Sound on/off; browser text-to-speech (Listen / Slow) on lesson sentences.
Added: guided unit A1-1 "Hello, Dagoruna!" at /unit/a1-u1: 2 story lessons (Dagoruna Goes to School, Dagoruna Is Sleeping) with Roman Urdu/Urdu/Hindi translation, grammar breakdown, why-explanation, examples, and a rule-based "write your own sentence" checker; Test 1, 2, 3 and a Mega Test (pass mark 80%); tests open after both lessons, Mega opens after Tests 1-3.
Added: server-side grading (migrations 0003, 0004): answer keys are hidden from clients, XP is awarded once per test, Mega prerequisites enforced in the database.
Added: placement test (/placement), journey map A1-C1 (/journey), Games page with Tic-Tac-Toe vs computer (easy/medium/hard).
Security fix: clients can no longer call award_xp() with invented references (it was farmable). XP now only comes from submit_test, complete_lesson and award_practice_xp (2 XP per day).
Changed: dashboard links and module status updated; word quiz now uses award_practice_xp.
Verified (actually run): `tsc --noEmit`, `next build`, 21 shared unit tests (placement, 80% scoring, unlock chain, tic-tac-toe AI incl. 200 games vs random, sentence checks), and a SQL smoke test of all 4 migrations in an in-memory Postgres (supabase/tests/sql_smoke.mjs): locked Mega, 80% pass mark, XP once, clients blocked from award_xp and answer keys.
Not done: see KNOWN_LIMITATIONS.md.
## 0.2.0 (rebrand to TALORA)
Changed: app name LINGUAPRO -> TALORA in navbar, browser title, PWA manifest, package names, Android package id (com.talora.app), tokens and docs. Mascot book cover and app icon now show an uppercase T instead of L (edited from the supplied sheet). New TALORA wordmark logo (logo-primary.png) using the existing open-book symbol. Unchanged: dragon, colours, layout, database, features, user progress. Supabase migrations were not touched (one SQL comment still says LINGUAPRO on purpose).
Verified: `tsc --noEmit`, `next build`, 9 shared unit tests.
## 0.1.0 (first unified release)
Added: monorepo; Supabase migrations 0001-0002 with RLS and server-side award_xp(); web app (signup/login/onboarding fields, dashboard with real XP/streak/weekly data, vocabulary search, flashcards, word quiz with server-validated XP once per day); light/dark theme, larger text, language switcher (Roman Urdu/Urdu/Hindi, RTL for Urdu); shared logic package with 9 passing unit tests; PWA manifest and icons; Expo starter; brand images cropped from the supplied sheet.
Verified: `tsc --noEmit` clean; `next build` succeeds; shared unit tests pass.
Remaining: see KNOWN_LIMITATIONS.md.
