# 🚀 Git Push Commands

## ✅ Pre-Push Security Check

Make sure these are NOT in your repo:
```bash
# Check what will be committed
git status

# Make sure .env files are ignored
git check-ignore .env .env.local
# Should show: .env and .env.local (means they're ignored ✅)
```

## 📝 Complete Git Commands

### Step 1: Initialize Git (if not already done)
```bash
cd /Users/rajeshlingam/Documents/Protect10K/The10KPromise

# Initialize git
git init

# Set your name and email
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Step 2: Create Repository on GitHub

1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `The10KPromise`
4. Description: `Protect 10,000 families in 12 months - Next.js + Supabase`
5. **Keep it Private** (recommended) or Public
6. **Do NOT** initialize with README (you already have one)
7. Click "Create repository"

### Step 3: Add All Files
```bash
# Add all files
git add .

# Check what's being added (make sure no .env files!)
git status
```

### Step 4: Create First Commit
```bash
git commit -m "feat: initial commit - The10KPromise v1.0

✨ Features:
- Real-time progress tracking with dashboard
- Personal partner goals and leaderboard
- First-time profile completion with HGI Partner ID
- Admin partner management with search and edit
- CSV bulk import functionality
- Google OAuth authentication
- Modern gradient UI with logo
- Full Vercel deployment ready

🗄️ Tech Stack:
- Next.js 14 + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS

📚 Complete documentation included
🚀 Ready for production deployment"
```

### Step 5: Connect to GitHub
```bash
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/The10KPromise.git

# Verify remote
git remote -v
```

### Step 6: Push to GitHub
```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🔐 If You Need Authentication

### Option 1: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `The10KPromise`
4. Expiration: 90 days (or longer)
5. Scopes: Check `repo` (all)
6. Click "Generate token"
7. **Copy the token** (you won't see it again!)

When pushing, use:
- Username: Your GitHub username
- Password: **Paste the token** (not your GitHub password)

### Option 2: SSH Key (More Secure)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"
# Press Enter for default location
# Press Enter for no passphrase (or set one)

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy the output

# Add to GitHub:
# GitHub → Settings → SSH and GPG keys → New SSH key
# Paste the key and save

# Use SSH remote instead:
git remote remove origin
git remote add origin git@github.com:yourusername/The10KPromise.git
git push -u origin main
```

## 🎯 After First Push

Your repo is now on GitHub! 🎉

### Add Topics/Tags:
1. Go to your GitHub repo
2. Click "⚙️ Settings"
3. Under "Topics", add:
   - `nextjs`
   - `typescript`
   - `supabase`
   - `tailwindcss`
   - `dashboard`
   - `family-protection`

### Update Description:
"Protect 10,000 families in 12 months - Real-time tracking dashboard with partner management"

### Enable Features (Optional):
- Issues: ✅ (for bug tracking)
- Wiki: ❌ (not needed)
- Projects: ❌ (not needed)

## 🔄 Future Updates

After making changes:
```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve issue with X"

# Push to GitHub
git push
```

## 🆘 Troubleshooting

### "Repository not found"
- Check the repo URL is correct
- Make sure you created the repo on GitHub
- Check your GitHub username in the URL

### "Permission denied"
- Use Personal Access Token instead of password
- Or set up SSH key

### "File too large"
- Check for large files: `git ls-files -z | xargs -0 ls -lh | sort -k 5 -h -r | head -20`
- Add large files to .gitignore

### "Remote already exists"
```bash
# Remove old remote
git remote remove origin
# Add correct remote
git remote add origin https://github.com/yourusername/The10KPromise.git
```

## ✅ Final Checklist

Before pushing:
- [ ] .env files are in .gitignore ✅
- [ ] No API keys in code ✅
- [ ] Build succeeds: `npm run build` ✅
- [ ] README is complete ✅
- [ ] GitHub repo created
- [ ] Git remote added
- [ ] Ready to push! 🚀

## 📞 Need Help?

- [GitHub Docs](https://docs.github.com)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

---

**Your code is secure and ready for GitHub!** 🔒

