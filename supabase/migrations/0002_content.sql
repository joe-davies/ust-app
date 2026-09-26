-- Phase 2: content tables. Run in the Supabase SQL Editor AFTER 0001_profiles.sql.
-- Everyone can read published rows; only admins (public.is_admin()) can write.

create table if not exists public.series (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text not null default '',
  author      text not null default '',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- One table for the whole teaching library and news.
create table if not exists public.content_items (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('article','devotional','video','podcast','qa','news')),
  title        text not null,
  slug         text not null unique,
  author       text not null default '',
  summary      text not null default '',
  body         text not null default '',
  media_url    text not null default '',
  image_url    text not null default '',
  read_minutes int  not null default 3,
  topics       text[] not null default '{}',
  scripture    text not null default '',
  series_id    uuid references public.series (id) on delete set null,
  featured     boolean not null default false,
  published    boolean not null default true,
  published_at timestamptz not null default now()
);

create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  level       text not null check (level in ('foundation','ba','ma','gdip','mth','phd','short','language')),
  title       text not null,
  slug        text not null unique,
  summary     text not null default '',
  description text not null default '',
  duration    text not null default '',
  mode        text not null default '',
  next_start  text not null default '',
  apply_url   text not null default '',
  sort_order  int  not null default 0,
  published   boolean not null default true
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  kind        text not null default 'other' check (kind in ('open-day','conference','lecture','other')),
  description text not null default '',
  starts_at   timestamptz not null,
  location    text not null default '',
  url         text not null default '',
  featured    boolean not null default false,
  published   boolean not null default true
);

create table if not exists public.people (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null default '',
  bio        text not null default '',
  photo_url  text not null default '',
  sort_order int  not null default 0,
  published  boolean not null default true
);

create table if not exists public.communities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  location      text not null default '',
  description   text not null default '',
  contact_email text not null default '',
  sort_order    int  not null default 0,
  published     boolean not null default true
);

create table if not exists public.testimonials (
  id        uuid primary key default gen_random_uuid(),
  quote     text not null,
  name      text not null default '',
  programme text not null default '',
  published boolean not null default true
);

-- Editable text pages: fees, accommodation, beliefs, give, etc. Body = paragraphs separated by blank lines.
create table if not exists public.pages (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  title     text not null,
  body      text not null default '',
  published boolean not null default true
);

do $$
declare t text;
begin
  foreach t in array array['series','content_items','courses','events','people','communities','testimonials','pages']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "public read published" on public.%I for select using (published or public.is_admin())', t);
    execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

create index if not exists content_items_kind_idx on public.content_items (kind, published_at desc);
create index if not exists events_starts_idx on public.events (starts_at);
