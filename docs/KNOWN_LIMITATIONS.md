# Known limitations (Phase 1)
- SQL migration and tokens are written but NOT yet executed against a live Supabase project; RLS tests with two users are still to do.
- apps/web and apps/mobile do not exist yet.
- Streak freeze logic (freezes_available) is stored but not yet applied in award_xp().
- No course content yet; Urdu/Hindi text will need native-speaker review.

# Update: shared logic added
- packages/shared (SM-2 spaced repetition, XP levels, streak with freeze, quiz scoring): 9 unit tests PASS.
- content/a0_greetings.json: only 9 words. Urdu/Hindi need native review.
- Still NOT built: apps/web, apps/mobile, games UI, admin CMS, audio/speaking, Playwright and RLS tests.
