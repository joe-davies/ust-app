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
- `src/pages/` — Home, AuthPages (SignUp, Login), Account, Admin, Placeholder
- `supabase/migrations/` — SQL, run manually in the Supabase SQL editor, in order

## Conventions
- Never commit `.env`; keys live in `.env` locally and in Netlify environment variables.
- Users can only update `first_name`, `last_name`, `student_type` on their own profile (column
  grants in migration 0001). `role` can only be changed via SQL / service role.
- Admin-only tables must use `public.is_admin()` in their RLS policies.
- Content must be database-driven and admin-editable; no hard-coded content in components once
  a section reaches Phase 2 (Home currently uses static dummy arrays).
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
2. **Content + admin — NEXT:** tables + seed of dummy content (articles, series, devotionals,
   videos, podcasts, Q&As, topics, courses, events, news, faculty, learning communities,
   testimonials), public pages reading from DB, admin CRUD forms, course picker quiz.
3. **My Study:** enrolled courses, deadlines/calendar, notes, reading lists, saved items.
4. **Polish:** search, offline, accessibility, Capacitor readiness, Home wired to DB.

## Decisions made
- Sign-up fields: first name, last name, email, student type (prospective/current). No password:
  magic-link login. Adding passwords later is a small change in `AuthPages.tsx`.
- Excluded on purpose: separate store (link to UST shop), multi-language sites, collecting
  application data (link to UST's application form).
- Owner: Joe Davies (sole admin initially; others promoted via SQL).

## Commands
`npm run dev` · `npm run build` · `npm run lint`
