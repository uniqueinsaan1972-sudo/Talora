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

## v0.4.0 status (honest)
Levels A1-C1 now each have ONE unit (1 lesson, 3 tests, 1 Mega Test). That is a thin first pass, not a full course: real A2-C1 levels need many more units.
Tenses taught so far: Present Simple (3rd person) and Present Continuous (A1), Past Simple (A2), Present Perfect (B1), Past Perfect (B2), Future Perfect (C1) = 5 of the 12. Still planned: Present Perfect Continuous, Past Continuous, Past Perfect Continuous, Future Simple, Future Continuous, Future Perfect Continuous, plus can/could/should/would, will vs going to, do/does/did drills.
Level locking is enforced by the database only for tests (Test 1 needs the previous Mega); lesson pages are locked in the interface only.
Level C1 content is mainly grammar with a few workplace examples; the real professional English units (emails, interviews, presentations) are not built.
Urdu and Hindi text in A2-C1 are drafts needing native review. Test questions were checked for answer consistency by script, but have not been reviewed by an English teacher.
The congratulations screen is not an official certificate.

## v0.4.2
Interface translations are a draft (wording needs native review) and cover only the main screens listed in CHANGELOG. Urdu interface text is not laid out right-to-left as a whole page; only lesson text blocks are.

## v0.5.0 status (honest)
No access to your GitHub repo, Vercel, signing keystore or an Android device: no APK/AAB was built, nothing was deployed or tested on a phone. docs/ANDROID_TWA.md lists the exact steps. Offline mode and RTL layout were only built and served locally, not exercised in a real browser.
Offline: only app shell and lesson pages work offline. Tests, XP, login, progress charts and sync need internet. A page never opened online or downloaded falls back to the start page. Urdu/Hindi Google Fonts load from Google, so a first offline launch uses system fonts (self-hosting is future work). The service worker runs only in production builds.
Language: the interface language is saved on the device only. Not yet translated: landing/login page, Word practice, Games, Placement, lesson prompts, error messages, course-path and module-status lists.
Not built: daily challenge, study-time tracking (daily goal is shown, not measured), reading/writing/listening/speaking lesson types, maskable adaptive icon. No RLS changes in this release.

## v0.6.0 status (honest)
Run migrations 0006 and 0007 in Supabase before using the Mega Test.
The question bank has only 48 questions (8 per level; 3 reading and 3 listening in total), so the Mega Test repeats questions across attempts and its level suggestion and skill scores rest on small samples. It is a practice exam, not an official proficiency test. Urdu/Hindi in translation questions are drafts.
Time taken is measured on the device and sent to the server (not verified by the server). Match-the-words questions, certificates and weekly/monthly charts beyond the 30-day XP chart are not built. "Total learning time", "words learned" and "daily goal progress" are not tracked, so they are not shown as numbers.
Listening uses the browser's text-to-speech (not recordings); if a device has none, the transcript is shown instead.
Share and PDF use the device's share sheet and print dialog; not tested on Android.
NOT built from the TALORA 2.0 prompt: Smart Translator (needs a server-side translation API key, e.g. Google Cloud Translation), Explain This Word, AI assistant (needs a server-side AI API key), the large vocabulary library (thousands of reviewed words with Urdu/Hindi), level C2, expanded A1-C1 content, saved-word collection, achievements and certificates, new APK/AAB, QA report for the whole prompt.
