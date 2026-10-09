# Deploy to Vercel (free)

## 1. Push to GitHub

```bash
cd nanzy-clothes
git init
git add .
git commit -m "Nanzy Clothes marketplace — portfolio ready"
git remote add origin https://github.com/YOUR_USERNAME/nanzy-clothes.git
git branch -M main
git push -u origin main
```

Never commit `.env.local`.

## 2. Import on Vercel

1. [vercel.com](https://vercel.com) → sign in with GitHub  
2. **Add New Project** → import repo  
3. Framework: **Next.js**  

## 3. Environment variables

**Without Supabase** (Explore APIs + UI demo still work):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

**With Supabase Auth (free):**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `NEXT_PUBLIC_APP_URL` | your Vercel URL |

Optional Paystack test keys: see `.env.example`.

## 4. Supabase redirect URLs

Add production callback/reset URLs under Authentication → URL Configuration (see `AUTH.md`).

## 5. Deploy

Click **Deploy**. Test `/`, `/explore`, dark mode, mobile menu, `/auth/login`.

## Note on demo JSON DB

Writes to `data/demo-db.json` work **locally**. On Vercel the filesystem is read-only — use Supabase for persistent multi-user data.

## Custom domain

Vercel → Settings → Domains → add domain → update `NEXT_PUBLIC_APP_URL` + Supabase URLs.
