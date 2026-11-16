-- Server-graded tests, lesson progress, safer XP. Answer keys are NOT readable by clients (RLS on, no policies).
create function norm_answer(t text) returns text language sql immutable as
$$ select lower(btrim(regexp_replace(regexp_replace(coalesce(t,''), '[.,!?;:"]', '', 'g'), '\s+', ' ', 'g'))) $$;
create table test_catalog (test_id text primary key, unit_id text not null, kind text not null check (kind in ('test','mega')), xp int not null check (xp between 1 and 50), requires text[] not null default '{}');
create table test_keys (test_id text not null references test_catalog(test_id) on delete cascade, question_id text not null, answer text not null, primary key (question_id, answer));
create table test_attempts (id bigint generated always as identity primary key, user_id uuid not null references profiles(id) on delete cascade, test_id text not null references test_catalog(test_id), correct int not null, total int not null, percent int not null, passed boolean not null, wrong_questions text[] not null default '{}', created_at timestamptz not null default now());
create index on test_attempts (user_id, test_id, created_at desc);
create table lesson_catalog (lesson_id text primary key, xp int not null check (xp between 1 and 20));
create table lesson_progress (user_id uuid not null references profiles(id) on delete cascade, lesson_id text not null references lesson_catalog(lesson_id), completed_at timestamptz not null default now(), primary key (user_id, lesson_id));
alter table test_catalog enable row level security; alter table test_keys enable row level security; alter table test_attempts enable row level security;
alter table lesson_catalog enable row level security; alter table lesson_progress enable row level security;
create policy tc_read on test_catalog for select to authenticated using (true);
create policy lc_read on lesson_catalog for select to authenticated using (true);
create policy ta_read on test_attempts for select to authenticated using (user_id = auth.uid());
create policy lp_read on lesson_progress for select to authenticated using (user_id = auth.uid());
-- no insert/update/delete policies: only the functions below write.

create function submit_test(p_test text, p_answers jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); cat test_catalog%rowtype; q record; given text; ok int := 0; total int := 0; wrong text[] := '{}'; review jsonb := '[]'::jsonb;
  pct int; did_pass boolean; req text; first_pass boolean; gained int := 0;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into cat from test_catalog where test_id = p_test;
  if not found then raise exception 'unknown test'; end if;
  foreach req in array cat.requires loop
    if not exists (select 1 from test_attempts where user_id = uid and test_id = req and passed) then raise exception 'locked: pass % first', req; end if;
  end loop;
  for q in select distinct question_id from test_keys where test_id = p_test order by question_id loop
    total := total + 1; given := p_answers ->> q.question_id;
    if given is not null and exists (select 1 from test_keys k where k.question_id = q.question_id and norm_answer(k.answer) = norm_answer(given)) then ok := ok + 1;
    else wrong := wrong || q.question_id;
      review := review || jsonb_build_object('id', q.question_id, 'answer', (select min(k.answer) from test_keys k where k.question_id = q.question_id)); end if;
  end loop;
  if total = 0 then raise exception 'test has no questions'; end if;
  pct := round(ok * 100.0 / total); did_pass := pct >= 80;
  first_pass := not exists (select 1 from test_attempts where user_id = uid and test_id = p_test and passed);
  insert into test_attempts(user_id, test_id, correct, total, percent, passed, wrong_questions) values (uid, p_test, ok, total, pct, did_pass, wrong);
  if did_pass and first_pass then gained := award_xp('test', p_test, cat.xp); end if;
  return jsonb_build_object('correct', ok, 'total', total, 'percent', pct, 'passed', did_pass, 'xp', gained, 'review', review);
end $$;

create function complete_lesson(p_lesson text) returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); l lesson_catalog%rowtype;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into l from lesson_catalog where lesson_id = p_lesson;
  if not found then raise exception 'unknown lesson'; end if;
  insert into lesson_progress(user_id, lesson_id) values (uid, p_lesson) on conflict do nothing;
  return award_xp('lesson', p_lesson, l.xp);
end $$;

create function award_practice_xp() returns int language sql security definer set search_path = public as
$$ select award_xp('practice', to_char((now() at time zone 'utc')::date, 'YYYY-MM-DD'), 2) $$;

-- Closing a hole: clients could call award_xp with invented refs. Only the functions above may call it now.
revoke execute on function award_xp(text, text, int) from authenticated;
revoke all on function submit_test(text, jsonb), complete_lesson(text), award_practice_xp() from public;
grant execute on function submit_test(text, jsonb), complete_lesson(text), award_practice_xp() to authenticated;
