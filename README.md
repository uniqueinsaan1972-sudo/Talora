# TALORA
Learn English. Enjoy Every Step. One unified project: web app, Android starter, shared logic, Supabase database.

## Structure
- apps/web: Next.js 14 (App Router) web app: landing + signup/login, dashboard, vocabulary, flashcards, word quiz
- apps/mobile: Expo Android starter (vocabulary list only)
- packages/shared: tested logic (SM-2 spaced repetition, XP levels, streaks, quiz scoring)
- packages/ui-tokens: colours, themes, fonts
- content/: A0 greetings words (Roman Urdu, Urdu, Hindi) and course map
- supabase/migrations: 0001 (profiles, XP, streaks, RLS, award_xp) and 0002 (course content, vocabulary, SRS tables)

## Setup
1. Create a free project at supabase.com.
2. SQL Editor: run the files in supabase/migrations in order: 0001 to 0008 (0008 adds the assistant quota; 0006 and 0007 add the Mega Test; 0004 seeds A1 tests and answer keys, 0005 seeds A2-C1).
3. Copy .env.example to apps/web/.env.local. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (Project Settings, API). Never put the service-role key in a NEXT_PUBLIC variable.
4. Web: `cd apps/web && npm install && npm run dev`, open http://localhost:3000
5. Tests: `cd packages/shared && npm install && npx vitest run`
6. Production build: `cd apps/web && npm run build`
7. Android (untested): `cd apps/mobile && npm install && npx expo start --android`
Without Supabase keys the app still shows the vocabulary, flashcards and quiz, and shows a setup message for login.

## Module status
See the Module status card on the dashboard, KNOWN_LIMITATIONS.md and CHANGELOG.md.

## New in 0.3.0
Pages: /journey, /unit/a1-u1, /placement, /games. Content lives in content/ (lessons JSON, tests in content/src with answers, generated public tests + SQL keys via `python3 scripts/gen_tests.py`).
SQL smoke test: `cd supabase/tests && npm i @electric-sql/pglite && node sql_smoke.mjs`.

## Levels
Units are /unit/a1-u1, a2-u1, b1-u1, b2-u1, c1-u1. To change A2-C1 content edit scripts/units_a2_c1.py, then run `python3 scripts/units_a2_c1.py && python3 scripts/gen_tests.py` (regenerates public tests and migration 0005; if 0005 is already applied, add changes as a new migration instead).

## Deploy on Vercel
1. Import the repo. Project Settings -> General -> Root Directory: `apps/web` and keep "Include source files outside of the Root Directory" ON (the web app imports ../../packages/shared and ../../content).
2. Node.js Version: 22.x (also set by apps/web/package.json). Install command comes from apps/web/vercel.json (`npm install`), not pnpm.
3. Environment Variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Never add the service-role key.
4. In Supabase -> Authentication -> URL Configuration, add your Vercel URL as Site URL / redirect URL so email verification links work.
Mega Test content: edit scripts/gen_exam.py, run `python3 scripts/gen_exam.py`. If 0007 is already applied, put changes in a new migration.
## DAGORUNA assistant: environment variables (server only, set in Vercel)
ANTHROPIC_API_KEY (required), ANTHROPIC_MODEL (optional, default claude-haiku-5-5), ASSISTANT_DAILY_LIMIT (optional, default 100). Route test with mock servers: scripts/assistant_route_test.mjs.
Gemini (free): GEMINI_API_KEY (from aistudio.google.com), optional GEMINI_MODEL (default gemini-2.5-flash). If both keys are set Gemini is used unless AI_PROVIDER=anthropic.
