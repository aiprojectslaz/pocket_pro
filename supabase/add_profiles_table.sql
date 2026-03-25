-- Migration: create profiles table and backfill existing auth users
-- Run in Supabase SQL Editor: Project → SQL Editor

create table if not exists profiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  org_id  text not null default 'tps'
);

-- Backfill any existing auth users who don't yet have a profile row
insert into profiles (id, org_id)
select id, 'tps'
from auth.users
where id not in (select id from profiles);

-- New users get a profile row automatically
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, org_id)
  values (new.id, 'tps')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
