-- Migration: tenants table
-- Run in Supabase SQL Editor: Project → SQL Editor

create table if not exists tenants (
  id                   uuid primary key default gen_random_uuid(),
  org_id               text unique not null,
  org_name             text not null,
  content_label        text not null default 'Procedure',
  content_label_plural text not null default 'Procedures',
  brand_primary        text not null default '#1a2744',
  brand_secondary      text not null default '#2d3f6b',
  logo_url             text,
  custom_domain        text,
  footer_tagline       text,
  created_at           timestamptz default now()
);

-- Seed the default TPS tenant
insert into tenants (org_id, org_name, brand_primary, brand_secondary, footer_tagline)
values ('tps', 'Toronto Police Service', '#1a2744', '#2d3f6b', 'Toronto Police Service')
on conflict (org_id) do nothing;
