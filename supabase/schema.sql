-- ═══════════════════════════════════════════════════════════════════════════
-- ECE FORUM CLOUD DATABASE SCHEMA FOR SUPABASE (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Workshop',
    status TEXT NOT NULL DEFAULT 'Upcoming',
    date TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT '10:00 AM IST',
    venue TEXT NOT NULL DEFAULT 'PIET Campus',
    description TEXT,
    badge TEXT DEFAULT 'EVENT',
    image TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    total_seats INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Passes / Registrations Table
CREATE TABLE IF NOT EXISTS public.passes (
    pass_id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    event_venue TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_photo TEXT,
    department TEXT NOT NULL DEFAULT 'Electronics & Communication Engineering',
    year TEXT NOT NULL DEFAULT '3rd Year',
    phone TEXT,
    payment_id TEXT NOT NULL DEFAULT 'FREE_PASS',
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'PAID',
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED' or 'CHECKED_IN'
    checked_in_at TEXT,
    checked_in_by TEXT,
    registered_at TEXT NOT NULL,
    security_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Admins & Organizers Table
CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Event Organizer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Site Settings Table (Hero Telemetry Pill & Flagship Event Banner)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    cert_id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_photo TEXT,
    department TEXT NOT NULL DEFAULT 'Electronics & Communication Engineering',
    college_name TEXT NOT NULL DEFAULT 'PIET, Nagpur',
    cert_type TEXT NOT NULL DEFAULT 'PARTICIPATION', -- 'PARTICIPATION', 'WINNER_1ST', 'RUNNER_UP_2ND', 'RUNNER_UP_3RD', 'MERIT', 'APPRECIATION'
    title TEXT NOT NULL DEFAULT 'Certificate of Participation',
    rank_text TEXT DEFAULT 'Participant',
    description TEXT,
    template_id TEXT NOT NULL DEFAULT 'classic_gold', -- 'classic_gold', 'cyber_neon', 'sapphire_prestige', 'ruby_crimson', 'custom_upload'
    template_bg TEXT,
    signatories JSONB DEFAULT '[]'::jsonb,
    qr_data TEXT NOT NULL,
    security_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VALID', -- 'VALID', 'REVOKED'
    issued_at TEXT NOT NULL,
    issued_by TEXT NOT NULL DEFAULT 'ECE Forum Executive Council',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Public Read Site Settings" ON public.site_settings;
CREATE POLICY "Allow Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Write Site Settings" ON public.site_settings;
CREATE POLICY "Allow Public Write Site Settings" ON public.site_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update Site Settings" ON public.site_settings;
CREATE POLICY "Allow Public Update Site Settings" ON public.site_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow Public Read Admins" ON public.admins;
CREATE POLICY "Allow Public Read Admins" ON public.admins FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert Admins" ON public.admins;
CREATE POLICY "Allow Public Insert Admins" ON public.admins FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Delete Admins" ON public.admins;
CREATE POLICY "Allow Public Delete Admins" ON public.admins FOR DELETE USING (true);

-- 8. Create RLS Policies for Events, Passes, Announcements, Certificates
DROP POLICY IF EXISTS "Allow Public Read Events" ON public.events;
CREATE POLICY "Allow Public Read Events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert Events" ON public.events;
CREATE POLICY "Allow Public Insert Events" ON public.events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update Events" ON public.events;
CREATE POLICY "Allow Public Update Events" ON public.events FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow Public Delete Events" ON public.events;
CREATE POLICY "Allow Public Delete Events" ON public.events FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow Public Read Passes" ON public.passes;
CREATE POLICY "Allow Public Read Passes" ON public.passes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert Passes" ON public.passes;
CREATE POLICY "Allow Public Insert Passes" ON public.passes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update Passes" ON public.passes;
CREATE POLICY "Allow Public Update Passes" ON public.passes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow Public Delete Passes" ON public.passes;
CREATE POLICY "Allow Public Delete Passes" ON public.passes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow Public Read Announcements" ON public.announcements;
CREATE POLICY "Allow Public Read Announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert Announcements" ON public.announcements;
CREATE POLICY "Allow Public Insert Announcements" ON public.announcements FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Read Certificates" ON public.certificates;
CREATE POLICY "Allow Public Read Certificates" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert Certificates" ON public.certificates;
CREATE POLICY "Allow Public Insert Certificates" ON public.certificates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update Certificates" ON public.certificates;
CREATE POLICY "Allow Public Update Certificates" ON public.certificates FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow Public Delete Certificates" ON public.certificates;
CREATE POLICY "Allow Public Delete Certificates" ON public.certificates FOR DELETE USING (true);

-- 9. Insert Default Seed Data
INSERT INTO public.events (id, title, category, status, date, time, venue, description, badge, image, price, total_seats)
VALUES
    ('evt-1', 'SPACE & SINC Forum Installation Ceremony', 'Installation', 'Upcoming', 'July 30, 2026', '10:00 AM IST', 'PIET Auditorium', 'Official installation ceremony for SPACE & SINC departmental councils for session 2026-27.', 'FLAGSHIP CEREMONY', '/event_images/inst.webp', 150, 250),
    ('evt-2', 'TARANG 2K26 Freshers Gala & Tech Fiesta', 'Workshop', 'Upcoming', 'July 30, 2026', '10:30 AM IST', 'PIET Auditorium', 'Annual welcoming fiesta and hardware ice-breaker for 2nd year electronics students.', 'FRESHERS CELEBRATION', '/event_images/tarang.webp', 200, 300),
    ('evt-3', 'KiCAD 8 PCB Design & Fabrication Bootcamp', 'Workshop', 'Upcoming', 'Aug 12, 2026', '09:30 AM IST', 'ECE Simulation Lab 304', 'Hands-on schematic capture, routing, Gerber generation and CNC milling for custom 2-layer PCBs.', 'HANDS-ON BOOTCAMP', '/event_images/tarang.webp', 100, 60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, content)
VALUES (1, 'Registration Open for SPACE & SINC Forum Installation & TARANG 2K26 Fiesta!')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

