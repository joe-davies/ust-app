# CLAUDE.md — Union School of Theology app

Web app for Union School of Theology (UST), styled after ligonier.org's content-hub layout but
branded as UST. Audience: prospective and current students. Built as a PWA so it can later be
wrapped for iOS/Android with Capacitor.

## Stack
- Vite + React 19 + TypeScript (strict, `erasableSyntaxOnly`: no enums / parameter properties)
- Tailwind CSS v4 (tokens in `src/index.css` under `@theme`)
- React Router (`src/App.tsx`)
- Supabase: auth (passwordless email magic link), Postgres, RLS. Client in `src/lib/supabase.ts`
- vite-plugin-pwa (manifest in `vite.config.ts`)
- Hosting: Netlify (`netlify.toml`, SPA redirect, Node 22)

## Structure
- `src/nav.ts` — single source of truth for navigation AND placeholder routes
- `src/brand.ts` — logo URL, name, external apply/enquire links
- `src/auth/` — `AuthContext` (session + profile + isAdmin), `ProtectedRoute` (`adminOnly` prop)
- `src/pages/` — Home, AuthPages (SignUp, Login), Account, Admin (users), Teaching, Study, Community (events/people/communities/stories/TextPage), Placeholder
- `src/admin/` — `resources.ts` (config for every editable table), `AdminResource.tsx` (generic list/create/edit/delete), `AdminLayout.tsx` (tabs)
- `src/lib/` — `supabase.ts`, `data.ts` (`useQuery`, date/slug helpers), `types.ts`
- `src/components/ui.tsx` — PageShell, Async (loading/error), Prose, Card, Tag
- `supabase/migrations/` — SQL, run manually in the Supabase SQL editor, in order

## Conventions
- Never commit `.env`; keys live in `.env` locally and in Netlify environment variables.
- Users can only update `first_name`, `last_name`, `student_type` on their own profile (column
  grants in migration 0001). `role` can only be changed via SQL / service role.
- Admin-only tables must use `public.is_admin()` in their RLS policies.
- All content is database-driven and admin-editable. To add an editable content type: new table in a
  numbered migration (RLS: public read where `published`, `is_admin()` write), an entry in
  `src/admin/resources.ts`, and a public page. Text pages (fees, beliefs, give...) live in `public.pages` by slug.
- Body text is plain: paragraphs separated by a blank line (rendered by `Prose`).
- Replace a placeholder page by adding an explicit `<Route>` before the generated ones in `App.tsx`.

## Brand caveats
- Colours in `src/index.css` are APPROXIMATE, not from official guidelines. Fix them there.
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
   admin editors for every table.
3. **My Study — NEXT:** enrolled courses, deadlines/calendar, notes, reading lists, saved items.
4. **Polish:** offline, accessibility, Capacitor readiness, code-splitting (bundle is ~530 kB), password login option.

## Decisions made
- Sign-up fields: first name, last name, email, student type (prospective/current). No password:
  magic-link login. Adding passwords later is a small change in `AuthPages.tsx`.
- Excluded on purpose: separate store (link to UST shop), multi-language sites, collecting
  application data (link to UST's application form).
- Owner: Joe Davies (sole admin initially; others promoted via SQL).

## Commands
`npm run dev` · `npm run build` · `npm run lint`
