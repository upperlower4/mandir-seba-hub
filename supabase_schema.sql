-- ============================================================
-- MANDIR SEVA HUB — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the main table
CREATE TABLE IF NOT EXISTS temples_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  location_name   TEXT,
  lat             FLOAT,
  lng             FLOAT,
  prasad_type     TEXT,
  occasion_type   TEXT CHECK (occasion_type IN ('Puja','Marriage','Annaprasan','Kirtan','Other')),
  puja_details    TEXT,
  description     TEXT,
  kirtan_start_date TIMESTAMPTZ,
  kirtan_end_date   TIMESTAMPTZ,
  expiry_hours    INTEGER NOT NULL DEFAULT 24,
  likes           INTEGER NOT NULL DEFAULT 0,
  reports         INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index for fast querying
CREATE INDEX IF NOT EXISTS idx_temples_status     ON temples_data(status);
CREATE INDEX IF NOT EXISTS idx_temples_created_at ON temples_data(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE temples_data ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — Anonymous read + insert + update (likes/reports only)
-- Allow anyone to read active/pending rows
CREATE POLICY "Public read"
  ON temples_data FOR SELECT
  USING (true);

-- Allow anyone to insert new events
CREATE POLICY "Public insert"
  ON temples_data FOR INSERT
  WITH CHECK (true);

-- Allow anonymous updates ONLY on likes and reports columns
CREATE POLICY "Public update likes and reports"
  ON temples_data FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. Realtime — enable publication so supabase-js can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE temples_data;

-- 6. Helper function: auto-set status to 'pending' when reports >= 5
CREATE OR REPLACE FUNCTION check_reports_threshold()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reports >= 5 THEN
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_threshold
  BEFORE UPDATE OF reports ON temples_data
  FOR EACH ROW
  EXECUTE FUNCTION check_reports_threshold();

-- ============================================================
-- SAMPLE SEED DATA (optional — remove in production)
-- ============================================================
INSERT INTO temples_data (name, location_name, lat, lng, prasad_type, occasion_type, puja_details, description, expiry_hours, likes, reports, status)
VALUES
  ('ISKCON Temple Juhu', 'Juhu, Mumbai, Maharashtra', 19.0990, 72.8263, 'Panchamrit', 'Puja', 'Mangala Aarti', 'Morning Mangala Aarti with special panchamrit prasad. All devotees welcome. Distribution starts at 5 AM.', 8, 12, 0, 'active'),
  ('Siddhivinayak Temple', 'Prabhadevi, Mumbai, Maharashtra', 19.0168, 72.8311, 'Modak', 'Puja', 'Ganesh Abhishek', 'Special Ganesh Chaturthi puja. Modak prasad for first 500 devotees. Come early for darshan.', 12, 34, 0, 'active'),
  ('Kashi Vishwanath Mandir', 'Varanasi, Uttar Pradesh', 25.3109, 83.0107, 'Puspanno', 'Puja', 'Rudrabhishek', 'Grand Rudrabhishek ceremony. Chappan bhog offered. Prasad distribution in the evening.', 24, 8, 0, 'active'),
  ('Shri Ram Mandir Ayodhya', 'Ayodhya, Uttar Pradesh', 26.7950, 82.1942, 'Khichuri', 'Kirtan', 'Ram Naam Kirtan', 'Three-day kirtan mahotsav. Renowned artists from across India. Langar seva for all.', 72, 55, 1, 'active');
