# CLAUDE.md — Union School of Theology app

Web app for Union School of Theology (UST), styled after ligonier.org's content-hub layout but
branded as UST. Audience: prospective and current students. Built as a PWA so it can later be
wrapped for iOS/Android with Capacitor.

## Stack
- Vite + React 19 + TypeScript (strict, `erasableSyntaxOnly`: no enums / parameter properties)
- Tailwind CSS v4 (tokens in `src/index.css` under `@theme`)
- React Router (`src/App.tsx`)
- Supabase: auth (email + password; forgot-password emails a link), Postgres, RLS. Client in `src/lib/supabase.ts`
- vite-plugin-pwa (manifest in `vite.config.ts`)
- Hosting: Netlify (`netlify.toml`, SPA redirect, Node 22)

## Structure
- `src/nav.ts` — single source of truth for navigation AND placeholder routes
- `src/brand.ts` — logo URL, name, external apply/enquire links
- `src/auth/` — `AuthContext` (session + profile + isAdmin), `ProtectedRoute` (`adminOnly` prop)
- `src/pages/` — Home, AuthPages (SignUp, Login), Account, Admin (users), Teaching, Study, Community (events/people/communities/stories/TextPage), Placeholder
- `src/admin/` — `resources.ts` (config for every editable table), `AdminResource.tsx` (generic list/create/edit/delete), `AdminLayout.tsx` (tabs)
- `src/lib/` — `supabase.ts`, `data.ts` (`useQuery`, date/slug helpers), `types.ts`
- `netlify/functions/admin-create-user.ts`, `admin-delete-user.ts` — server-side admin actions (service-role key, env only). Both start with `requireAdmin()` from `netlify/lib/admin.ts` (verifies the token + admin role). Tested with mocks; `tsconfig.netlify.json` typechecks them (`npx tsc -p tsconfig.netlify.json`)
- `src/lib/functions.ts` — `callFunction()` used by the Admin page to call those functions with the user's token
- `supabase/email-templates/invite.html` — paste into Supabase's "Invite user" template (verify link + temp password)
- `src/mystudy/` — My Study (login required): `useOwnRows` CRUD hook, `SavedContext` (+ `SaveButton`), Overview, MyCourses, Deadlines (list + month calendar, includes saved events), Notes, Reading, Saved
- `src/components/ui.tsx` — PageShell, Async (loading/error), Prose, Card, Tag
- `supabase/migrations/` — SQL, run manually in the Supabase SQL editor, in order

## Conventions
- Never commit `.env`; keys live in `.env` locally and in Netlify environment variables.
- Users can only update `first_name`, `last_name`, `student_type` on their own profile (column
  grants in migration 0001). `role` can only be changed via SQL / service role.
- Admin-only tables must use `public.is_admin()` in their RLS policies.
- Admins edit other users via the `admin_update_profile` RPC (migration 0004), NOT by loosening RLS/column
  grants on `profiles`. It refuses non-admins and demoting the last admin. Deleting users goes through the
  `admin-delete-user` function (admin only, never your own account; cascades to profile + all study data via foreign keys).
  Changing a user's email is done in the Supabase dashboard.
- All content is database-driven and admin-editable. To add an editable content type: new table in a
  numbered migration (RLS: public read where `published`, `is_admin()` write), an entry in
  `src/admin/resources.ts`, and a public page. Text pages (fees, beliefs, give...) live in `public.pages` by slug.
- Per-student tables (my_courses, deadlines, notes, reading_items, saved_items; migration 0005) have
  `user_id uuid default auth.uid()` and ONE RLS policy `user_id = auth.uid()` for authenticated only. Never expose
  them to anon and never write a policy that lets one user read another's rows. Client code never sets user_id.
- The service-role key lives ONLY in Netlify env (`SUPABASE_SERVICE_ROLE_KEY`), never `VITE_`-prefixed, never in client code.
- ACCOUNTS ARE INVITE-ONLY. There is no sign-up page (`/signup` redirects to `/login`); "Allow new users to sign up" must stay OFF in
  Supabase. The function does NOT set `email_confirm`: users verify via the invitation link (Supabase "Confirm email" stays ON), and
  `MustChangeGate` also refuses sessions with no `email_confirmed_at`.
- Admin-created users: profile flag `must_change_password` (+ `temp_password_expires_at`, 7 days) set by the function; `MustChangeGate`
  redirects them to `/set-password`; `complete_password_change()` RPC clears it. Expiry/forced change are enforced in the app (a
  courtesy guard, not a hard boundary). The temp password is passed once in invite metadata and wiped straight after.
- Body text is plain: paragraphs separated by a blank line (rendered by `Prose`).
- Replace a placeholder page by adding an explicit `<Route>` before the generated ones in `App.tsx`.

## Brand caveats
- Colours in `src/index.css` are APPROXIMATE, not from official guidelines. Fix them there.
- The logo PNG is transparent and its lower text is mid-blue, so on the dark blue header/footer it is
  rendered solid white via Tailwind `brightness-0 invert` (Layout.tsx). Remove those classes if you
  switch to an official white/reversed logo file.
- Logo is hotlinked from UST's Squarespace CDN. Better: save the official file to `public/` and
  point `BRAND.logoUrl` at it.
- PWA icon is a placeholder "U" SVG (`public/icon.svg`); replace with official icon
  (add 192px and 512px PNGs for best Android/iOS support).

## Phases
1. **Foundation — DONE:** scaffold, branding, layout/nav, sign-up + login, profiles, admin role,
   admin user list, Netlify config.
2. **Content + admin — DONE (untested against live Supabase until migrations 0002/0003 are run):**
   tables + dummy seed, teaching library (search, topics, scripture, series), courses + course
   picker quiz, events, faculty, Learning Communities, student stories, text pages, Home from DB,
   admin editors for every table, plus in-app user editing (name, student type, role; migration 0004).
3. **My Study — DONE:** my courses, deadlines + month calendar, notes, reading lists, saved items (Save buttons on
   teaching, courses, events), overview page. Migration 0005; RLS isolation tested locally.
4. **Polish — NEXT:** offline, accessibility, Capacitor readiness, code-splitting (bundle is ~530 kB). (Password login + admin-created users: DONE, migration 0006.)

## Decisions made
- Admins create users (first name, last name, email, student type). Login is email + password; there is no magic-link login and no
  public sign-up. "Forgot password? Email me a link" is the fallback (link goes to `/set-password`).
- Excluded on purpose: separate store (link to UST shop), multi-language sites, collecting
  application data (link to UST's application form).
- Owner: Joe Davies (sole admin initially; others promoted via SQL).

## Commands
`npm run dev` · `npm run build` · `npm run lint`
