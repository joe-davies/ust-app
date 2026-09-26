# UST App

Union School of Theology web app (React + TypeScript + Vite + Supabase, PWA). See `CLAUDE.md`
for architecture and the phase plan.

## Local setup
```bash
git clone https://github.com/joe-davies/ust-app.git
cd ust-app
npm install
cp .env.example .env      # then fill in your Supabase values
npm run dev
```

## Supabase setup (once)
1. Create a free project at https://supabase.com.
2. Project Settings > API: copy the **Project URL** and **anon public key** into `.env`.
3. SQL Editor > New query: run each file in `supabase/migrations/` in order: `0001_profiles.sql`,
   `0002_content.sql`, `0003_seed.sql` (dummy content; safe to re-run), `0004_admin_users.sql`, `0005_my_study.sql`, then `0006_password_flow.sql`.
4. Authentication > URL Configuration: set **Site URL** to your Netlify URL and add
   `http://localhost:5173/**` and your Netlify URL `/**` under **Redirect URLs**.
5. Sign up in the app, then make yourself admin (SQL editor):
   `update public.profiles set role = 'admin' where email = 'you@example.com';`

## Deploy to Netlify
1. Netlify > Add new site > Import from Git > pick `joe-davies/ust-app`.
2. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`).
3. Site configuration > Environment variables: add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Then add the Netlify URL to Supabase's Redirect URLs (step 4 above).

## Accounts: invite-only, with email verification
There is **no public sign-up**. Only admins create accounts (**Admin > Users > Add user**). A Netlify Function
(`netlify/functions/admin-create-user.ts`) creates the account with Supabase's service-role key (checking the caller is
an admin) and Supabase emails an invitation through your SMTP containing a **"Verify my email" link** and a temporary
password. The person cannot use the app until they have (1) verified their email and (2) chosen their own password
(`MustChangeGate`, `/set-password`). Clicking the link verifies them, signs them in and takes them to choose a password.
The temporary password is a fallback (e.g. an email scanner used up the link): it works only once the email is verified.

One-time setup:
1. Run `0006_password_flow.sql` in the Supabase SQL editor (**before** using Add user; it ends with `notify pgrst, 'reload schema'`).
   If Add user says "Could not find the 'must_change_password' column ... in the schema cache", run that file, then
   `notify pgrst, 'reload schema';`. If the account was already created, the function now removes it so you can retry.
2. Supabase > Authentication > Emails > Templates > **Invite user**: paste `supabase/email-templates/invite.html`.
3. Supabase > Authentication > **Sign In / Providers** > **User Signups**: turn **"Allow new users to sign up" OFF**.
   This is what actually stops the public from creating accounts (the app no longer has a sign-up page, but the
   Supabase API would still accept sign-ups if this stays on). Admin invitations still work.
4. Supabase > Authentication > Sign In / Providers > **Email**: keep **"Confirm email" ON** so unverified emails cannot log in.
5. Netlify > Site configuration > Environment variables: add **`SUPABASE_SERVICE_ROLE_KEY`** (Supabase > Project
   Settings > API Keys > the `service_role` / secret key). Tick "Contains secret values" and limit the scope to
   Functions/Runtime. `SUPABASE_URL` is optional (falls back to `VITE_SUPABASE_URL`). Then redeploy.
   NEVER prefix this key with `VITE_` and never put it in `.env` for the browser app.
6. Supabase Authentication > URL Configuration: your Netlify address must be in **Redirect URLs** (`https://your-site/**`).
7. Optional: set minimum password length to 8 (Sign In / Providers > Email). Supabase's custom-SMTP hourly email limit
   (Authentication > Rate limits) may need raising.
The function only runs on Netlify (or locally with `netlify dev`); with plain `npm run dev` the Add user form shows a
message saying the service is unavailable.

Deleting a user: **Admin > Users > Delete** (asks for confirmation). This calls `netlify/functions/admin-delete-user.ts`, which
permanently removes the account, their profile and all their notes, deadlines, courses, reading lists and saved items. You
cannot delete your own account. It uses the same `SUPABASE_SERVICE_ROLE_KEY` as Add user, so no extra setup is needed.
A deleted person's current login session can remain valid for up to an hour (Supabase's token lifetime), but they have no
data and can no longer log in.
