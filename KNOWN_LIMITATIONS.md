# Known limitations (v0.1.0)
Verified by running: web typecheck, web production build, 9 shared unit tests. NOT verified: login/signup against a live Supabase project, RLS with two accounts, the Android app, browsers, responsive layouts.
## Not built (planned)
Grammar Academy, Listening Studio, Speaking Studio, Writing Studio, Story Mode, Conversation Practice, saved flashcard SRS UI (logic and tables exist), Daily Challenges, Study Planner, Leaderboards, Admin CMS UI (tables and admin RLS exist), profile photo upload, password reset page, placement test, Edge Functions, Playwright and RLS tests, Tailwind/Framer Motion/Zod (plain CSS used), pnpm workspace linking (web imports shared code by path alias), seed.sql (web reads bundled JSON, not the vocabulary tables).
## Content and design
- Only 9 words in A0. Urdu and Hindi need native-speaker review before release.
- Mascot and logo are cropped from the supplied sheet: not transparent, low resolution, no separate poses or animation. Proper vector logo and icon set still needed.
- No audio exists; no fake audio is shown.
## Security notes
- XP is server-validated and idempotent per day for the quiz; a user can still earn it once per day only. Streak freezes are stored but not applied in award_xp().
- Session is stored by supabase-js in browser storage (no server-side cookies yet). Profile creation happens on first dashboard visit using signup data held in localStorage.
- No rate limiting beyond Supabase defaults.

## Rebrand notes (v0.2.0)
- The T on the book is a raster edit of the original image: same low resolution, not a vector. A clean high-resolution mascot re-render with the T is still recommended.
- The small L badge on the dragon's backpack pocket was left unchanged because you asked not to change the backpack. It still shows an L, and the two smaller poses and the laptop in the original sheet are not used by the app.
- Existing browsers keep their saved preferences (storage keys still start with lp_). Database name, tables and user data are unchanged.

## v0.3.0 status (honest)
Working: unit A1-1 (2 lessons + 4 tests), placement test, Tic-Tac-Toe, journey map, TTS, sound, animations.
NOT built yet (marked Planned in the app): the other units of A1-C1, the full 12-tense course (only Present Simple 3rd person and Present Continuous are taught so far), daily routine and other conversation simulations, Introduce Yourself module, Professional English, the other 9 games, game-break reminders, study-time tracking, weekly grammar mastery and test-history screens, flashcard swipe and saved known/difficult words, per-lesson artwork for food/travel/eating, admin CMS UI, microphone recording and speech recognition (needs an external service; no fake scores shown).
Content: only 2 lessons and 20 test questions exist. Urdu and Hindi are drafts needing native review. Placement bank has 3 questions per level and is graded in the browser (it only suggests a level).
Art: poses are crops from the original sheet (not transparent, low resolution). Only some poses of the original exist, so there is no eating, travel or speaking pose. The celebrating pose medal, running pose backpack and the sleeping/other tiles still show the old L; only the main book and app icon were changed to T.
Tests: the answers for wrong questions are shown after a graded attempt, so retaking the same questions can be memorised (question rotation is future work). Lessons must be completed before tests only in the interface; the database enforces the Test 1-3 then Mega order. No instant right/wrong flash per question inside graded tests because the answers are only on the server.
Sentence checker: simple rules (capital, full stop, -s/-es, am/is/are + -ing), not full grammar analysis.
Mobile app is unchanged (vocabulary list only). The signup profile is still created on first dashboard visit.
