-- Course content (separate from progress) and personal vocabulary / spaced repetition.
create table courses (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, published boolean not null default false, created_at timestamptz not null default now());
create table units (id uuid primary key default gen_random_uuid(), course_id uuid not null references courses(id) on delete cascade, level cefr_level not null, position int not null, title text not null, published boolean not null default false, unique (course_id, position));
create table lessons (id uuid primary key default gen_random_uuid(), unit_id uuid not null references units(id) on delete cascade, position int not null, title text not null, objective text, published boolean not null default false, unique (unit_id, position));
create table lesson_translations (lesson_id uuid references lessons(id) on delete cascade, lang explain_lang, title text not null, explanation text not null, primary key (lesson_id, lang));
create table vocabulary (id uuid primary key default gen_random_uuid(), english text not null, part_of_speech text, category text, example_en text, published boolean not null default false, created_at timestamptz not null default now());
create table vocabulary_translations (vocabulary_id uuid references vocabulary(id) on delete cascade, lang explain_lang, meaning text not null, example text, primary key (vocabulary_id, lang));
create table saved_words (user_id uuid references profiles(id) on delete cascade, vocabulary_id uuid references vocabulary(id) on delete cascade, favourite boolean not null default false, learned boolean not null default false, created_at timestamptz not null default now(), primary key (user_id, vocabulary_id));
create table review_schedule (user_id uuid references profiles(id) on delete cascade, vocabulary_id uuid references vocabulary(id) on delete cascade, ease numeric not null default 2.5 check (ease >= 1.3), interval_days int not null default 0, reps int not null default 0, due date not null default current_date, primary key (user_id, vocabulary_id));
create index on review_schedule (user_id, due);
do $$ declare t text; begin
  foreach t in array array['courses','units','lessons','lesson_translations','vocabulary','vocabulary_translations','saved_words','review_schedule'] loop
    execute format('alter table %I enable row level security', t); end loop; end $$;
create policy courses_r on courses for select to authenticated using (published or is_admin());
create policy courses_w on courses for all to authenticated using (is_admin()) with check (is_admin());
create policy units_r on units for select to authenticated using (published or is_admin());
create policy units_w on units for all to authenticated using (is_admin()) with check (is_admin());
create policy lessons_r on lessons for select to authenticated using (published or is_admin());
create policy lessons_w on lessons for all to authenticated using (is_admin()) with check (is_admin());
create policy lt_r on lesson_translations for select to authenticated using (exists (select 1 from lessons l where l.id = lesson_id and (l.published or is_admin())));
create policy lt_w on lesson_translations for all to authenticated using (is_admin()) with check (is_admin());
create policy vocab_r on vocabulary for select to authenticated using (published or is_admin());
create policy vocab_w on vocabulary for all to authenticated using (is_admin()) with check (is_admin());
create policy vt_r on vocabulary_translations for select to authenticated using (exists (select 1 from vocabulary v where v.id = vocabulary_id and (v.published or is_admin())));
create policy vt_w on vocabulary_translations for all to authenticated using (is_admin()) with check (is_admin());
create policy sw_own on saved_words for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy rs_own on review_schedule for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
