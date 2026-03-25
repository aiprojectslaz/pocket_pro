-- Migration: extend profiles with user management fields
-- Run in Supabase SQL Editor: Project → SQL Editor

alter table profiles
  add column if not exists display_name text,
  add column if not exists is_admin     boolean not null default false,
  add column if not exists is_active    boolean not null default true;

-- RPC: list all users joining auth.users for email + last sign-in.
-- SECURITY DEFINER lets the authenticated admin read auth.users data.
create or replace function admin_list_users()
returns table (
  id               uuid,
  email            text,
  display_name     text,
  org_id           text,
  is_admin         boolean,
  is_active        boolean,
  last_sign_in_at  timestamptz,
  created_at       timestamptz
) language sql security definer as $$
  select
    p.id,
    u.email,
    p.display_name,
    p.org_id,
    p.is_admin,
    p.is_active,
    u.last_sign_in_at,
    p.created_at
  from profiles p
  join auth.users u on u.id = p.id
  order by u.last_sign_in_at desc nulls last;
$$;

-- NOTE: "Invite user" requires the Supabase service role key and cannot be
-- called from the browser client. Deploy an Edge Function that calls:
--   supabase.auth.admin.inviteUserByEmail(email, { data: { org_id, is_admin } })
-- then inserts/upserts the profiles row.
-- See: supabase/functions/admin-invite-user/ (create this directory).
