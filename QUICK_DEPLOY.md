# ⚡ Quick Deploy to Vercel

Super fast deployment guide!

## ✅ Pre-Flight Checklist (30 seconds)

- [ ] Supabase database schema deployed
- [ ] Google OAuth configured
- [ ] Code committed to GitHub
- [ ] `.env.local` NOT in git
- [ ] Build succeeds: `npm run build` ✅

## 🚀 Deploy in 3 Minutes

### 1. Push to GitHub (1 min)

```bash
git add .
git commit -m "feat: ready for production"
git push origin main
```

### 2. Deploy on Vercel (1 min)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import GitHub repo
4. Click **"Deploy"** (don't add env vars yet)

### 3. Add Environment Variables (1 min)

After first deploy, go to **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOAL_TOTAL=10000
```

Click **"Save"** → **"Redeploy"**

## 🔗 Update OAuth

Add to Google OAuth redirect URIs:
```
https://your-app.vercel.app
```

Add to Supabase URL Configuration:
- Site URL: `https://your-app.vercel.app`

## 🎉 Done!

Visit your app and sign in!

Make yourself admin:
```sql
SELECT make_admin('your@email.com');
```

---

**Full guide:** See `VERCEL_DEPLOYMENT.md`

