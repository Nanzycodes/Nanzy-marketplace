# Authentication with Supabase (free)

Use the **free Supabase tier** — no paid services.

## What Auth does in this project

| Feature | Route / file |
|---------|----------------|
| Sign up | `/auth/signup` → `signUp` Server Action |
| Login | `/auth/login` → `signIn` |
| Forgot password | `/auth/forgot-password` |
| Reset password | `/auth/reset-password` |
| Email callback | `/auth/callback` |
| Session refresh | `src/middleware.ts` |
| Header user menu | `UserMenu` (login / name / sign out) |

Without env keys, the app still runs (local JSON demo). Auth forms show a clear error pointing here.

## 1. Create a free project

1. [https://supabase.com](https://supabase.com) → New project  
2. Wait until the database is ready  

## 2. Copy API keys

**Project Settings → API**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Put these in **`.env.local`** (never commit).

## 3. Auth URL config

**Authentication → URL Configuration**

- Site URL: `http://localhost:3000`  
- Redirect URLs:  
  - `http://localhost:3000/auth/callback`  
  - `http://localhost:3000/auth/reset-password`  

For Vercel, add the production URLs too (see `DEPLOY.md`).

## 4. Optional: confirm email

**Authentication → Providers → Email**

- For demos you can disable “Confirm email” so signup can sign in immediately.  
- For production, leave confirmation on.

## 5. Database tables (free Postgres)

SQL Editor — run in order:

1. `supabase/schema.sql`  
2. `supabase/seed.sql`  
3. `supabase/marketplace-schema.sql`  

Profiles auto-create on signup via trigger (`handle_new_user`).

## 6. Make yourself admin

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 7. Test the flow

```bash
npm run dev
```

1. `/auth/signup` → create account  
2. Confirm email if required  
3. `/auth/login` → header shows your name  
4. Sign out from the menu  
5. Forgot password → email link → `/auth/reset-password`  

## API consumption pattern (Auth)

```
Browser form
  → Server Action (src/lib/auth-actions.ts)
  → Supabase Auth API (free)
  → Session cookie (via @supabase/ssr)
  → middleware refreshes session
  → Client UserMenu reads session
```

Secrets: only the **anon** key is public (`NEXT_PUBLIC_`). Never expose the **service_role** key in the frontend.

## Skills this demonstrates

- Auth forms + Server Actions  
- Cookie-based session with SSR (`@supabase/ssr`)  
- Middleware session refresh  
- Protected UX (UserMenu, optional role checks)  
- Free BaaS integration suitable for production prototypes  
EOF

## Protected routes

When Supabase env vars are set:

| Area | Behaviour |
|------|-----------|
| `/checkout/*` | Redirects to `/auth/login?next=/checkout` if logged out |
| `/seller/*` | Redirects to `/auth/login?next=/seller` if logged out |

When env vars are **missing** (local portfolio demo), these routes stay open so you can still walk through UI without an account.

After login, `?next=` returns the user to the page they wanted (open-redirect safe: relative paths only).

Implementation: `src/lib/auth/guards.ts` + route `layout.tsx` files.
