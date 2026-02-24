# 🛕 Mandir Seva Hub

A production-ready React app for real-time temple prasad & kirtan event tracking.
Built with **Supabase**, **Leaflet + OpenStreetMap** (free, no API key), **Tailwind CSS**, and **Lucide React**.

---

## 📁 Project Structure

```
mandir-seva-hub/
├── supabase_schema.sql          ← Run this in Supabase SQL Editor FIRST
├── .env.example                 ← Copy to .env and fill your keys
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── src/
    ├── main.jsx                 ← Entry point
    ├── App.jsx                  ← Root component (search, filters, feed, map)
    ├── index.css
    ├── hooks/
    │   └── useTemples.js        ← Data hook: fetch, realtime, like, report, add
    ├── lib/
    │   └── supabaseClient.js    ← Supabase client + all DB helpers
    └── components/
        ├── TempleCard.jsx       ← Accordion card with like/report
        ├── MapContainer.jsx      ← Leaflet + OSM map + Nominatim location search
        ├── AddTempleForm.jsx    ← 3-step form with validation
        └── SupportModal.jsx     ← Developer support popup
```

---

## 🚀 Quick Start

### Step 1 — Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase_schema.sql`
3. Copy your **Project URL** and **anon public key** from Settings → API

### Step 2 — Environment

```bash
cp .env.example .env
# Edit .env with your actual Supabase keys:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

**No map API key needed.** The app uses Leaflet + OpenStreetMap and Nominatim (free, no signup).

### Step 3 — Install & Run

```bash
npm install
npm run dev
# → Opens at http://localhost:5173
```

---

## 🗄️ Supabase RLS Policies

The schema sets up:
- **Public read** — anyone can read all rows
- **Public insert** — anonymous users can post events
- **Public update** — anonymous users can update `likes` and `reports`
- **DB trigger** — auto-sets `status = 'pending'` when `reports >= 5`

No auth required. All writes work for anonymous users.

---

## ✨ Features

| Feature | Implementation |
|---|---|
| Real-time feed | Supabase `postgres_changes` subscription |
| Auto-expiry | Frontend filters: `created_at + expiry_hours < now()` |
| Community reports | Session-tracked, DB trigger flips status to `pending` |
| Blur on 5+ reports | Card CSS `filter: blur(3px)` + warning banner |
| **Map** | **Leaflet + OpenStreetMap** — custom saffron markers, popups |
| **Location search** | **Nominatim** (OSM) — type & search, no API key |
| Near Me filter | Haversine distance sort, top 15 results |
| Like/Report dedupe | sessionStorage prevents double-clicks |
| 3-step form | Validates each step before advancing |
| Occasion sub-fields | Shows "Which Puja?" only when Puja selected |
| Kirtan date range | Date picker pair shown for Kirtan occasion |

---

## 🎨 Theme

- **Primary:** Saffron `#FF9933`
- **Background:** Warm cream `#fff8f0`
- **Typography:** Playfair Display (headings) + Lato (body)
- **Icons:** Lucide React throughout

---

## 🔧 Production Deployment

```bash
npm run build        # outputs to dist/
npm run preview      # preview the build locally
```

Deploy `dist/` to **Vercel**, **Netlify**, or any static host.

Set **Supabase** environment variables in your hosting dashboard (not in `.env`). No map keys required.

---

## 📝 Notes

- Maps and location search are **free** (Leaflet, OpenStreetMap, Nominatim). No Google Cloud or API key needed.
- The app works without Supabase credentials but shows a connection error — add your keys to enable live data.
- RLS policies allow full anonymous CRUD — tighten these for production if needed.

---

*🙏 Jai Shri Ram · Built with devotion for the community*
