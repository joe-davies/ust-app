-- Phase 2b: let admins edit other users from the app.
-- Run in the Supabase SQL Editor after 0001-0003.
--
-- Why a function and not an RLS policy: normal users must NOT be able to change `role`
-- (column grants in 0001 enforce that). This function runs with elevated rights but
-- checks public.is_admin() first, so only admins can use it.

create or replace function public.admin_update_profile(
  target     uuid,
  new_first  text,
  new_last   text,
  new_type   text,
  new_role   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can edit users';
  end if;

  if new_type not in ('prospective', 'current') then
    raise exception 'Invalid student type: %', new_type;
  end if;

  if new_role not in ('user', 'admin') then
    raise exception 'Invalid role: %', new_role;
  end if;

  -- Never allow the last admin to be demoted (would lock everyone out of /admin).
  if new_role = 'user'
     and (select role from public.profiles where id = target) = 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'Cannot demote the last remaining admin';
  end if;

  update public.profiles
     set first_name   = trim(coalesce(new_first, '')),
         last_name    = trim(coalesce(new_last, '')),
         student_type = new_type,
         role         = new_role
   where id = target;

  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

revoke all on function public.admin_update_profile(uuid, text, text, text, text) from public, anon;
grant execute on function public.admin_update_profile(uuid, text, text, text, text) to authenticated;
