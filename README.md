# The10KPromise 🛡️

A modern web application built to help protect 10,000 families in 12 months. Track progress, manage partners, and celebrate milestones together.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🎯 Core Features
- **Real-time Progress Tracking** - Live counter showing families protected
- **Google OAuth Authentication** - Secure sign-in with Google
- **Personal Dashboards** - Each partner tracks their individual progress
- **Leaderboard** - Top 10 performers with completion percentages
- **Personal Goal Setting** - Set and update personal targets
- **Confetti Celebrations** 🎉 - Celebrate every milestone!

### 👤 Partner Management
- **First-Time Profile Completion** - Guided onboarding for new partners
- **HGI Partner ID** - Unique identifier for each partner
- **Auto-name Splitting** - Automatically parse display names
- **Profile Status Tracking** - Complete/Incomplete indicators

### 🔐 Admin Features
- **Partner Management Dashboard** - View and edit all partners
- **CSV Bulk Import** - Upload protection records in bulk
- **Advanced Search & Filter** - Find partners by name, email, or HGI ID
- **Statistics Dashboard** - Overview of all partners and completions
- **Easy Admin Management** - Simple SQL functions for admin assignment

### 🎨 UI/UX
- **Modern Gradient Design** - Beautiful blue-purple gradients
- **Fully Responsive** - Works on mobile, tablet, and desktop
- **Real-time Updates** - Auto-refresh when data changes
- **Smooth Animations** - Polished transitions and effects
- **Professional Branding** - Logo integration and favicon

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/The10KPromise.git
cd The10KPromise
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the `schema.sql` file
3. Go to **SQL Editor** and run `admin_management_functions.sql` (for easy admin management)
4. Run the dashboard migration: `docs/migration_dashboard.sql`

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `https://yourdomain.com` (for production)
4. In Supabase:
   - Go to **Authentication → Providers → Google**
   - Enable Google and paste Client ID/Secret
   - In **URL Configuration**, set Site URL and Redirect URLs

### 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOAL_TOTAL=10000
```

Get these values from Supabase: **Settings → API**

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Setup

### Easy Method (Recommended)

After signing in once, run in Supabase SQL Editor:

```sql
SELECT make_admin('your@email.com');
```

That's it! ✅

### Manual Method

```sql
-- Get your user_id
SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Make admin
INSERT INTO public.admins (user_id, note) 
VALUES ('your-user-id-here', 'Owner');
```

See [`docs/EASY_ADMIN_MANAGEMENT.md`](docs/EASY_ADMIN_MANAGEMENT.md) for more admin commands.

## 📁 Project Structure

```
The10KPromise/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin route protection
│   │   │   ├── partners/           # Partner management
│   │   │   └── upload/             # CSV bulk upload
│   │   ├── assets/                 # Images and static files
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── icon.png                # Favicon
│   ├── components/
│   │   ├── AddProtectionDialog.tsx # Log protection modal
│   │   ├── Dashboard.tsx           # Personal dashboard
│   │   └── ProfileCompletionModal.tsx # First-time setup
│   └── lib/
│       └── supabaseClient.ts       # Supabase configuration
├── docs/                           # Documentation
├── schema.sql                      # Database schema
├── admin_management_functions.sql  # Admin helper functions
└── package.json
```

## 🗄️ Database Schema

### Tables
- **partners** - User profiles with HGI IDs and targets
- **protections** - Protection records
- **admins** - Admin users
- **staging_protections** - CSV import staging

### Views
- **protection_metrics** - Overall statistics
- **partner_stats** - Individual partner statistics
- **leaderboard** - Top performers

## 📚 Documentation

Comprehensive guides available in [`docs/`](docs/):

- **[Partner Onboarding Guide](docs/PARTNER_ONBOARDING_GUIDE.md)** - Complete onboarding flow
- **[Easy Admin Management](docs/EASY_ADMIN_MANAGEMENT.md)** - Simple admin commands
- **[Dashboard Setup](docs/DASHBOARD_SETUP.md)** - Dashboard features
- **[Admin Security](docs/ADMIN_SECURITY_UPDATE.md)** - Security implementation
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Technical overview

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel (recommended)

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy! 🚀

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOAL_TOTAL=10000
```

Don't forget to update Google OAuth redirect URIs with your production URL!

## 🎯 Usage

### For Partners

1. **Sign In** with Google
2. **Complete Profile** - Enter HGI Partner ID on first login
3. **Log Protections** - Click "+ Protect Family" button
4. **Track Progress** - View your personal dashboard and leaderboard ranking
5. **Update Goal** - Adjust your personal target anytime

### For Admins

1. **Manage Partners** - View and edit all partner information at `/admin/partners`
2. **Bulk Import** - Upload CSV files at `/admin/upload`
3. **Search & Filter** - Find specific partners quickly
4. **View Statistics** - Monitor overall progress and completions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your organization.

## 🎉 Acknowledgments

Built with ❤️ for protecting families and making a difference.

---

**Together, we will protect 10,000 families in 12 months!** 🛡️

For questions or support, please open an issue on GitHub.
