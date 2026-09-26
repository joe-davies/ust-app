-- Phase 4a: password login + forced password change for admin-created users.
-- Run in the Supabase SQL Editor after 0001-0005.

alter table public.profiles add column if not exists must_change_password boolean not null default false;
alter table public.profiles add column if not exists temp_password_expires_at timestamptz;

-- The flags above are set by the server-side Netlify function (service role) only:
-- the column grants from 0001 mean signed-in users cannot update them directly.

-- A user clears their own "must change password" flag after they have changed it.
create or replace function public.complete_password_change()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  update public.profiles
     set must_change_password = false,
         temp_password_expires_at = null
   where id = auth.uid();
end;
$$;

revoke all on function public.complete_password_change() from public, anon;
grant execute on function public.complete_password_change() to authenticated;

-- Make the API notice the new columns immediately (otherwise Supabase can report
-- "Could not find the column ... in the schema cache" until it refreshes).
notify pgrst, 'reload schema';
