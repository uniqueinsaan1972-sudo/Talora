-- LINGUAPRO core schema: auth profile, XP, streaks, achievements. RLS enabled everywhere.
create type app_role as enum ('learner','admin');
create type explain_lang as enum ('roman_urdu','urdu','hindi');
create type cefr_level as enum ('A0','A1','A2','B1','B2','C1');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  full_name text not null check (char_length(full_name) between 1 and 100),
  avatar_path text,
  role app_role not null default 'learner',
  explain_language explain_lang not null default 'roman_urdu',
  current_level cefr_level not null default 'A0',
  goal text, daily_minutes int not null default 10 check (daily_minutes between 5 and 120),
  larger_text boolean not null default false, reduced_motion boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table xp_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  amount int not null check (amount between 1 and 100),
  source text not null, source_ref text,
  created_at timestamptz not null default now(),
  unique (user_id, source, source_ref)  -- blocks double-claiming the same lesson
);
create index on xp_transactions (user_id, created_at desc);
create table daily_activity (
  user_id uuid not null references profiles(id) on delete cascade,
  day date not null, xp int not null default 0, lessons_done int not null default 0,
  primary key (user_id, day)
);
create table user_streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0, longest_streak int not null default 0,
  last_active_day date, freezes_available int not null default 2  -- gentle recovery
);
create table achievements (
  id serial primary key, code text unique not null, title text not null, description text not null, xp_threshold int
);
create table user_achievements (
  user_id uuid references profiles(id) on delete cascade,
  achievement_id int references achievements(id), earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table profiles enable row level security;
alter table xp_transactions enable row level security;
alter table daily_activity enable row level security;
alter table user_streaks enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;

create function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create policy profiles_select on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_insert on profiles for insert with check (id = auth.uid() and role = 'learner');
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- users may never change their own role
revoke update on profiles from authenticated;
grant update (full_name, avatar_path, explain_language, current_level, goal, daily_minutes, larger_text, reduced_motion, updated_at) on profiles to authenticated;

create policy xp_select on xp_transactions for select using (user_id = auth.uid());
create policy da_select on daily_activity for select using (user_id = auth.uid());
create policy st_select on user_streaks for select using (user_id = auth.uid());
create policy ach_select on achievements for select using (true);
create policy ua_select on user_achievements for select using (user_id = auth.uid());
-- no insert/update/delete policies on XP, activity, streaks: only award_xp() can write them.

-- Server-side XP: client sends only a lesson reference; amount is capped and idempotent.
create function award_xp(p_source text, p_ref text, p_amount int)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'utc')::date; last date; cur int;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_amount < 1 or p_amount > 50 then raise exception 'invalid xp amount'; end if;
  insert into xp_transactions(user_id, amount, source, source_ref) values (uid, p_amount, p_source, p_ref)
    on conflict (user_id, source, source_ref) do nothing;
  if not found then return 0; end if;  -- already awarded
  insert into daily_activity(user_id, day, xp, lessons_done) values (uid, today, p_amount, 1)
    on conflict (user_id, day) do update set xp = daily_activity.xp + p_amount, lessons_done = daily_activity.lessons_done + 1;
  insert into user_streaks(user_id) values (uid) on conflict do nothing;
  select last_active_day, current_streak into last, cur from user_streaks where user_id = uid;
  if last is distinct from today then
    cur := case when last = today - 1 then cur + 1 else 1 end;
    update user_streaks set current_streak = cur, longest_streak = greatest(longest_streak, cur), last_active_day = today where user_id = uid;
  end if;
  return p_amount;
end $$;
revoke all on function award_xp(text,text,int) from public;
grant execute on function award_xp(text,text,int) to authenticated;
