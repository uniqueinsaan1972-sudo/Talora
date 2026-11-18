-- TALORA Mega Test: server-graded exams with saved reports. Answer keys are not readable by clients.
create table exam_keys (question_id text not null, category text not null, level int not null check (level between 0 and 5), answer text not null, primary key (question_id, answer));
alter table exam_keys enable row level security;
create table exam_attempts (id bigint generated always as identity primary key, user_id uuid not null references profiles(id) on delete cascade, mode text not null check (mode in ('short','standard','mega')), level int not null check (level between -1 and 5), timed boolean not null default false,
  correct int not null, total int not null, skipped int not null, percent int not null, seconds int not null, by_category jsonb not null, by_level jsonb not null, mistakes jsonb not null, question_ids text[] not null, created_at timestamptz not null default now());
create index on exam_attempts (user_id, created_at desc);
alter table exam_attempts enable row level security;
create policy ea_read on exam_attempts for select to authenticated using (user_id = auth.uid());
create function submit_exam(p_mode text, p_level int, p_timed boolean, p_answers jsonb, p_questions text[], p_seconds int) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); qid text; given text; meta record; ok int := 0; sk int := 0; total int; bycat jsonb := '{}'::jsonb; bylvl jsonb := '{}'::jsonb; mist jsonb := '[]'::jsonb; hit boolean; blank boolean;
  prev int; pct int; new_id bigint; gained int := 0; secs int := greatest(0, least(coalesce(p_seconds, 0), 14400)); lv text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_mode not in ('short', 'standard', 'mega') then raise exception 'bad mode'; end if;
  total := coalesce(array_length(p_questions, 1), 0);
  if total < 5 or total > 60 then raise exception 'bad question count'; end if;
  if (select count(distinct x) from unnest(p_questions) x) <> total then raise exception 'duplicate questions'; end if;
  foreach qid in array p_questions loop
    select category, level into meta from exam_keys where question_id = qid limit 1;
    if not found then raise exception 'unknown question %', qid; end if;
    given := p_answers ->> qid; blank := given is null or btrim(given) = '';
    hit := not blank and exists (select 1 from exam_keys k where k.question_id = qid and norm_answer(k.answer) = norm_answer(given));
    if hit then ok := ok + 1; end if;
    if blank then sk := sk + 1; end if;
    if not hit then mist := mist || jsonb_build_object('id', qid, 'given', coalesce(given, ''), 'answer', (select min(k.answer) from exam_keys k where k.question_id = qid)); end if;
    lv := meta.level::text;
    bycat := jsonb_set(bycat, array[meta.category], jsonb_build_object('c', coalesce((bycat -> meta.category ->> 'c')::int, 0) + (case when hit then 1 else 0 end), 't', coalesce((bycat -> meta.category ->> 't')::int, 0) + 1), true);
    bylvl := jsonb_set(bylvl, array[lv], jsonb_build_object('c', coalesce((bylvl -> lv ->> 'c')::int, 0) + (case when hit then 1 else 0 end), 't', coalesce((bylvl -> lv ->> 't')::int, 0) + 1), true);
  end loop;
  pct := round(ok * 100.0 / total);
  select percent into prev from exam_attempts where user_id = uid and mode = p_mode order by created_at desc, id desc limit 1;
  insert into exam_attempts(user_id, mode, level, timed, correct, total, skipped, percent, seconds, by_category, by_level, mistakes, question_ids)
    values (uid, p_mode, p_level, coalesce(p_timed, false), ok, total, sk, pct, secs, bycat, bylvl, mist, p_questions) returning id into new_id;
  if pct >= 50 then gained := award_xp('exam', to_char((now() at time zone 'utc')::date, 'YYYY-MM-DD'), 10); end if;  -- at most 10 XP per day from exams
  return jsonb_build_object('id', new_id, 'correct', ok, 'total', total, 'skipped', sk, 'percent', pct, 'seconds', secs, 'by_category', bycat, 'by_level', bylvl, 'mistakes', mist, 'previous_percent', prev, 'xp', gained);
end $$;
revoke all on function submit_exam(text, int, boolean, jsonb, text[], int) from public;
grant execute on function submit_exam(text, int, boolean, jsonb, text[], int) to authenticated;
