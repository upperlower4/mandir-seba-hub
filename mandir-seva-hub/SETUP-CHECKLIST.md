# Mandir Seva Hub — Setup Checklist

Use this after reading the main [README.md](./README.md).

---

## Done for you

- [x] **`.env` created** from `.env.example` in `mandir-seva-hub/`.  
  You still need to add your real Supabase and Google Maps keys (see below).

---

## What you need to do

### 1. Install Node.js (if needed)

- If `node -v` and `npm -v` work in your terminal, skip this.
- Otherwise: install from [nodejs.org](https://nodejs.org) (LTS), then restart the terminal.

### 2. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard: **SQL Editor** → New query.
3. Open `mandir-seva-hub/supabase_schema.sql`, copy all of it, paste into the editor, run it.
4. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon public** key

### 3. Google Maps (optional but recommended)

1. [Google Cloud Console](https://console.cloud.google.com) → create/select a project.
2. Enable **Maps JavaScript API** and **Places API**.
3. Create an API key (Credentials → Create credentials → API key).
4. (Optional) Restrict the key to your domain for production.

### 4. Put your keys in `.env`

Edit `mandir-seva-hub/.env` and replace:

- `VITE_SUPABASE_URL` → your Supabase Project URL  
- `VITE_SUPABASE_ANON_KEY` → your Supabase anon key  
- `VITE_GOOGLE_MAPS_KEY` → your Google Maps API key  

Save the file.

### 5. Install dependencies and run

In a terminal (from the project folder):

```bash
cd mandir-seva-hub
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Quick reference

| Item              | Location / action                          |
|-------------------|--------------------------------------------|
| Database schema   | Run `supabase_schema.sql` in Supabase SQL Editor |
| Env variables     | Edit `mandir-seva-hub/.env` with your keys |
| Install & run     | `npm install` then `npm run dev` in `mandir-seva-hub` |

The app will run with placeholder keys; Supabase features and Maps will work only after you add real keys.
