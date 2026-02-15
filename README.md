# DDD Intervention & Execution Tracker

**Data Driven Districts — Interventions & MERL Stream**

A shared web application for tracking DDD-informed interventions and building contribution evidence chains (Data Insight → Decision → Action → Outcome).

---

## Setup Guide (30 minutes total)

### Step 1: Create Supabase Database (10 minutes)

1. Go to [supabase.com](https://supabase.com) and click **Start your project**
2. Sign up with your GitHub account (or email)
3. Click **New Project**
   - **Name**: `ddd-tracker`
   - **Database Password**: Choose a strong password (save it somewhere)
   - **Region**: Select the closest to South Africa — `West EU (London)` or `Central EU (Frankfurt)`
   - Click **Create new project** (takes 1-2 minutes to provision)
4. Once ready, go to **SQL Editor** in the left sidebar
5. Click **New Query**
6. Open the file `supabase-migration.sql` from this project
7. Copy the ENTIRE contents and paste into the SQL editor
8. Click **Run** (green play button)
9. You should see "Success. No rows returned" — this means all tables are created and seed data is loaded

### Step 2: Get Your API Keys (2 minutes)

1. In Supabase, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL**: looks like `https://abcdefg.supabase.co`
   - **anon public key**: a long string starting with `eyJ...`
3. You'll need these in Step 4

### Step 3: Deploy to Vercel (10 minutes)

**Option A — Deploy from GitHub (recommended):**
1. Create a GitHub account if you don't have one at [github.com](https://github.com)
2. Create a new repository called `ddd-tracker`
3. Upload all files from this project to the repository
4. Go to [vercel.com](https://vercel.com) and sign up with GitHub
5. Click **Add New → Project**
6. Select your `ddd-tracker` repository
7. Before clicking Deploy, expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Project URL from Step 2
   - `VITE_SUPABASE_ANON_KEY` = your anon key from Step 2
8. Click **Deploy**
9. In ~60 seconds you'll get a live URL like `ddd-tracker.vercel.app`

**Option B — Deploy without GitHub:**
1. Install Vercel CLI: `npm install -g vercel`
2. Create a `.env` file (copy from `.env.example`) and fill in your Supabase keys
3. Run `npm install` then `npm run build`
4. Run `vercel --prod` and follow the prompts
5. When asked about environment variables, add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Step 4: Verify It Works (5 minutes)

1. Open your Vercel URL in the browser
2. You should see the DDD Tracker dashboard with 10 interventions pre-loaded
3. The green dot next to the mode toggle confirms database connection
4. Click **Interventions** tab → click any row → you should see the contribution chain
5. Try adding a new intervention — it should save and appear for everyone

### Step 5: Share with Team

Share the Vercel URL with your team:
- **Internal team (PMs)**: Full URL — they use Internal mode to register interventions and log execution
- **External stakeholders (DBE)**: Same URL — they click "Stakeholder View" for read-only access
- No accounts or passwords needed — anyone with the URL can access it

---

## Features

### Internal Mode (Programme Managers)
- Register and edit interventions
- Log decisions (what DDD data → what insight → what was decided)
- Track actions (what was done, by whom, status)
- Record outcomes (measurable changes linked to actions)
- Export all data to CSV
- Full contribution chain view per intervention

### Stakeholder View (DBE Officials, External)
- Dashboard with summary statistics
- Browse all interventions (read-only)
- View contribution evidence chains
- No editing capabilities

### Real-time Sync
All users see the same data. When a PM registers an intervention or logs a decision, it appears for everyone within seconds.

---

## Architecture

```
Browser (any device) → React App (Vercel) → Supabase (PostgreSQL)
                                            ↕ Real-time subscriptions
```

- **Frontend**: React + Vite (hosted on Vercel, free tier)
- **Database**: Supabase PostgreSQL (free tier: 500MB, 50,000 rows)
- **Real-time**: Supabase Realtime channels for live updates
- **Auth**: None required (open access via URL)

---

## Project Structure

```
ddd-tracker-app/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── vercel.json             # Deployment config
├── .env.example            # Environment variable template
├── supabase-migration.sql  # Database schema + seed data
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main application (tabs, routing, state)
│   ├── components.jsx      # UI components (badges, cards, chain view)
│   ├── constants.js        # Colours, provinces, dropdown options
│   ├── data.js             # Supabase CRUD operations
│   └── supabase.js         # Supabase client initialisation
└── README.md               # This file
```

---

## Free Tier Limits

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| Supabase DB | 500 MB, 50,000 rows | ~50 interventions + execution data = well under 1% |
| Supabase API | 500,000 requests/month | Easily sufficient |
| Supabase Realtime | 200 concurrent connections | More than enough |
| Vercel Hosting | 100 GB bandwidth/month | Minimal for a data app |

You won't hit any limits with normal DDD programme usage.

---

## Future Enhancements

- Add user authentication (Supabase Auth) for role-based access
- Province-specific views with row-level security
- Automated email notifications via Supabase Edge Functions
- Dashboard charts and trend visualisation
- Mobile-optimised layout for field visits
- Integration with DDD dashboards via API

---

## Support

Built for the DDD Interventions & MERL Stream.
Contact: Sean Huni (Interventions & MERL Manager)
