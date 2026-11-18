-- DAGORUNA assistant: per-user daily quota (enforced by the server route, counted in the database so it works across serverless instances).
create table assistant_usage (user_id uuid not null references profiles(id) on delete cascade, day date not null default ((now() at time zone 'utc')::date), count int not null default 0, primary key (user_id, day));
alter table assistant_usage enable row level security;
create policy au_read on assistant_usage for select to authenticated using (user_id = auth.uid());
create function assistant_take_quota(p_limit int) returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_limit < 1 or p_limit > 1000 then raise exception 'bad limit'; end if;
  insert into assistant_usage(user_id, day, count) values (uid, (now() at time zone 'utc')::date, 1)
    on conflict (user_id, day) do update set count = assistant_usage.count + 1 where assistant_usage.count < p_limit returning count into n;
  if n is null then raise exception 'quota'; end if;
  return n;
end $$;
revoke all on function assistant_take_quota(int) from public;
grant execute on function assistant_take_quota(int) to authenticated;
