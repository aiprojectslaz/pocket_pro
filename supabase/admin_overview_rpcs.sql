-- Migration: admin overview RPC functions
-- Run in Supabase SQL Editor: Project → SQL Editor
--
-- These functions run with SECURITY DEFINER so the admin client
-- can read auth.users data without needing the service role key.

-- Returns one row per tenant with user count and earliest profile created_at.
-- Requires: profiles table has a created_at column (add if missing).
alter table profiles
  add column if not exists created_at timestamptz default now();

-- Returns per-tenant summary.
create or replace function admin_tenant_overview()
returns table (
  org_id       text,
  user_count   bigint,
  created_at   timestamptz
) language sql security definer as $$
  select
    p.org_id,
    count(*)                        as user_count,
    min(p.created_at)               as created_at
  from profiles p
  group by p.org_id
  order by user_count desc;
$$;

-- Returns recent users (up to 20) joining auth.users for email + login time.
create or replace function admin_recent_users()
returns table (
  id               uuid,
  email            text,
  org_id           text,
  last_sign_in_at  timestamptz,
  created_at       timestamptz
) language sql security definer as $$
  select
    p.id,
    u.email,
    p.org_id,
    u.last_sign_in_at,
    u.created_at
  from profiles p
  join auth.users u on u.id = p.id
  order by u.last_sign_in_at desc nulls last
  limit 20;
$$;
