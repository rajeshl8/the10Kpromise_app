# 🚀 Vercel Deployment Guide

Complete guide to deploy The10KPromise to Vercel.

## 📋 Pre-Deployment Checklist

### 1. **Supabase Setup** ✅
Make sure these are complete:
- [ ] Database schema deployed (`schema.sql`)
- [ ] Dashboard migration run (`migration_dashboard.sql`)
- [ ] Admin functions installed (`admin_management_functions.sql`)
- [ ] Google OAuth configured in Supabase
- [ ] RLS policies enabled

### 2. **Code Ready** ✅
- [ ] All code committed to Git
- [ ] `.env.local` is NOT committed (check `.gitignore`)
- [ ] `env.example` has placeholders only
- [ ] No console.logs or debug code
- [ ] App runs locally: `npm run dev`
- [ ] Build succeeds: `npm run build`

## 🌐 Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
# If not already done
git init
git add .
git commit -m "feat: ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/The10KPromise.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. Select **The10KPromise** repo

### Step 3: Configure Project

Vercel will auto-detect Next.js. Verify these settings:

**Framework Preset:** `Next.js`
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install` (auto-detected)

Click **"Deploy"** (we'll add environment variables after first deploy)

### Step 4: Add Environment Variables

After first deploy, go to **Project Settings → Environment Variables** and add:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |
| `NEXT_PUBLIC_GOAL_TOTAL` | `10000` | All |

**Where to find Supabase values:**
- Supabase Dashboard → Settings → API
- Copy the URL and `anon` key

💡 **Tip:** Add to all environments (Production, Preview, Development)

### Step 5: Update Google OAuth Redirect URIs

1. Get your Vercel deployment URL (e.g., `https://the10kpromise.vercel.app`)
2. Go to **Google Cloud Console** → OAuth 2.0 Client
3. Add authorized redirect URIs:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   https://the10kpromise.vercel.app
   ```

4. In **Supabase** → Authentication → URL Configuration:
   - Site URL: `https://the10kpromise.vercel.app`
   - Redirect URLs: Add your Vercel URL

### Step 6: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Check **"Use existing Build Cache"** (optional)
4. Click **"Redeploy"**

### Step 7: Test Your Deployment! 🎉

Visit your Vercel URL and test:
- [ ] Home page loads
- [ ] Google sign-in works
- [ ] Profile completion modal appears
- [ ] Dashboard displays correctly
- [ ] Can log a protection
- [ ] Real-time updates work
- [ ] Admin features work (if you're admin)

## 🔧 Vercel Configuration Files

### vercel.json (Already Created)
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

This is optional - Vercel auto-detects Next.js projects.

## 🌍 Custom Domain (Optional)

### Add Your Domain

1. In Vercel, go to **Project Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `the10kpromise.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-10 minutes)

### Update OAuth After Domain Setup

Update redirect URIs in:
- Google Cloud Console
- Supabase Authentication settings

## ⚡ Performance Optimizations

### Automatic Optimizations (Included)
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting and lazy loading
- ✅ Automatic static optimization
- ✅ Edge caching
- ✅ Gzip/Brotli compression

### Edge Functions (Optional)
The app is already optimized, but you can enable:
- Edge Runtime for faster response times
- Middleware for authentication (if needed)

## 🔄 Continuous Deployment

**Auto-Deploy Enabled by Default**

Every push to `main` branch will:
1. Trigger automatic deployment
2. Run build process
3. Deploy to production
4. Invalidate cache

**Preview Deployments**
- Every pull request gets a preview URL
- Test changes before merging
- Share with team for review

## 🐛 Troubleshooting

### Build Fails

**Check these:**
```bash
# Test locally first
npm run build

# Check for TypeScript errors
npm run lint
```

**Common Issues:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution:** Fix locally, commit, push again

### OAuth Not Working

**Issues:**
1. Redirect URI not configured
2. Wrong Supabase URL
3. Environment variables not set

**Fix:**
- Verify all redirect URIs match exactly
- Check environment variables in Vercel
- Redeploy after changes

### Real-time Features Not Working

**Check:**
- Supabase URL and anon key are correct
- RLS policies are enabled
- Network requests succeed (check browser console)

### Favicon Not Showing

**Fix:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Wait a few minutes for CDN cache to update

### Images Not Loading

**Verify:**
- Images are in `src/app/assets/` or `public/`
- Using Next.js `Image` component correctly
- Image paths are correct

## 📊 Monitoring & Analytics

### Vercel Analytics (Recommended)

Enable in Vercel Dashboard:
1. Go to **Analytics** tab
2. Click **"Enable Analytics"**
3. Get real-time performance insights

### Add Custom Analytics (Optional)

Add to `src/app/layout.tsx`:
```typescript
// Google Analytics
// Vercel Analytics
// Or any other analytics service
```

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use Vercel environment variables
- ✅ Rotate keys if exposed

### Supabase Security
- ✅ RLS policies enabled
- ✅ Only necessary permissions granted
- ✅ Admin functions are secure

### HTTPS
- ✅ Automatic with Vercel
- ✅ SSL certificates auto-renewed

## 📈 Scaling

Vercel scales automatically:
- **Serverless functions** - Auto-scale with traffic
- **Edge Network** - Global CDN
- **No configuration needed** - Just works!

## 💰 Pricing

**Hobby Plan (Free):**
- ✅ Perfect for this app
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL

**Pro Plan ($20/month):**
- More bandwidth
- Better performance analytics
- Team collaboration features

## 🎯 Post-Deployment

### Make Your First Admin

1. Sign in to your deployed app
2. In Supabase SQL Editor, run:
```sql
SELECT make_admin('your@email.com');
```
3. Refresh and verify admin access

### Share With Team

1. Copy your Vercel URL
2. Share with partners
3. They sign in with Google
4. Complete profile on first login
5. Start protecting families! 🛡️

## ✅ Deployment Complete!

Your app is now:
- 🚀 Live on Vercel
- 🌐 Accessible worldwide
- 🔒 Secure with HTTPS
- ⚡ Fast with edge caching
- 📱 Mobile responsive

## 📞 Support

**Vercel Issues:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**Supabase Issues:**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

**App Issues:**
- Check GitHub issues
- Review documentation in `docs/`

---

**🎉 Congratulations! Your app is deployed!**

Share your Vercel URL and start protecting families! 🛡️

