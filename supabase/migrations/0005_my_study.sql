-- Phase 3: My Study. Private per-student data.
-- Run in the Supabase SQL Editor after 0001-0004.
-- Every row belongs to one user (user_id defaults to the signed-in user) and RLS ensures
-- users can only ever see and change their own rows. Anonymous visitors get nothing.

create table if not exists public.my_courses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id  uuid references public.courses (id) on delete set null,
  title      text not null,
  status     text not null default 'in-progress' check (status in ('planned', 'in-progress', 'completed')),
  created_at timestamptz not null default now()
);
create unique index if not exists my_courses_user_course_uq on public.my_courses (user_id, course_id) where course_id is not null;

create table if not exists public.deadlines (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  my_course_id uuid references public.my_courses (id) on delete set null,
  title        text not null,
  kind         text not null default 'assignment' check (kind in ('assignment', 'exam', 'reading', 'other')),
  due_at       timestamptz not null,
  done         boolean not null default false,
  notes        text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists deadlines_user_due_idx on public.deadlines (user_id, due_at);

create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  my_course_id uuid references public.my_courses (id) on delete set null,
  title        text not null default '',
  body         text not null default '',
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create table if not exists public.reading_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  my_course_id uuid references public.my_courses (id) on delete set null,
  title        text not null,
  author       text not null default '',
  status       text not null default 'to-read' check (status in ('to-read', 'reading', 'done')),
  created_at   timestamptz not null default now()
);

create table if not exists public.saved_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_type  text not null check (item_type in ('content', 'course', 'event')),
  item_id    uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_touch on public.notes;
create trigger notes_touch before update on public.notes
  for each row execute function public.touch_updated_at();

do $$
declare t text;
begin
  foreach t in array array['my_courses', 'deadlines', 'notes', 'reading_items', 'saved_items']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
