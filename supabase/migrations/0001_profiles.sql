-- Phase 1: profiles, roles and row-level security.
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  first_name   text not null default '',
  last_name    text not null default '',
  student_type text not null default 'prospective'
               check (student_type in ('prospective', 'current')),
  role         text not null default 'user'
               check (role in ('user', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper used by every admin-only policy in later phases.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Users read and edit their own profile; admins can read everyone.
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin());

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Users may only change these columns. In particular they can NOT change `role`.
revoke update on public.profiles from authenticated, anon;
grant update (first_name, last_name, student_type) on public.profiles to authenticated;

-- Create a profile automatically whenever someone signs up.
-- Sign-up data (first_name, last_name, student_type) arrives in raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, student_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    case
      when new.raw_user_meta_data ->> 'student_type' in ('prospective', 'current')
        then new.raw_user_meta_data ->> 'student_type'
      else 'prospective'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Make yourself the first admin AFTER you have signed up in the app:
--   update public.profiles set role = 'admin' where email = 'joe@data-flow.co.uk';
