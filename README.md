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
3. SQL Editor > New query: paste `supabase/migrations/0001_profiles.sql` and Run.
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
