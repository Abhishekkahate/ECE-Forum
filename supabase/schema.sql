-- ═══════════════════════════════════════════════════════════════════════════
-- ECE FORUM CLOUD DATABASE SCHEMA FOR SUPABASE (PostgreSQL)
-- Production-Ready, Bandwidth-Optimized, Fully Indexed
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Workshop',
    status TEXT NOT NULL DEFAULT 'Upcoming',
    date TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT '10:00 AM IST',
    venue TEXT NOT NULL DEFAULT 'PCE-NAGPUR Campus',
    description TEXT,
    badge TEXT DEFAULT 'EVENT',
    image TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    total_seats INTEGER NOT NULL DEFAULT 100,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Passes / Registrations Table (With Full Multi-Registration & Payment Proof Fields)
CREATE TABLE IF NOT EXISTS public.passes (
    pass_id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL DEFAULT '10:00 AM IST',
    event_venue TEXT NOT NULL DEFAULT 'PCE-NAGPUR Campus',
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_photo TEXT,
    college_name TEXT NOT NULL DEFAULT 'PCE-NAGPUR',
    department TEXT NOT NULL DEFAULT 'Electronics & Communication Engineering',
    year TEXT NOT NULL DEFAULT '3rd Year',
    phone TEXT,
    registration_type TEXT NOT NULL DEFAULT 'individual',
    team_name TEXT,
    team_members JSONB DEFAULT '[]'::jsonb,
    payment_id TEXT NOT NULL DEFAULT 'FREE_PASS',
    amount NUMERIC NOT NULL DEFAULT 0,
    original_amount NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    coupon_code TEXT,
    payment_status TEXT NOT NULL DEFAULT 'PAID',
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CHECKED_IN', 'UNVERIFIED', 'REJECTED'
    admin_verified BOOLEAN DEFAULT false,
    verified_at TEXT,
    verified_by TEXT,
    rejection_reason TEXT,
    payment_screenshot TEXT,
    checked_in_at TEXT,
    checked_in_by TEXT,
    registered_at TEXT NOT NULL,
    security_hash TEXT NOT NULL,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Schema Migration for Existing Deployments of Passes
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS college_name TEXT NOT NULL DEFAULT 'PCE-NAGPUR';
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS registration_type TEXT NOT NULL DEFAULT 'individual';
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS original_amount NUMERIC DEFAULT 0;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT false;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS verified_at TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

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

-- 5. Create Site Settings Table (Hero Config, Telemetry, Gallery Archive, Coupons)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Certificates Table (Bandwidth-Optimized)
CREATE TABLE IF NOT EXISTS public.certificates (
    cert_id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_photo TEXT,
    department TEXT NOT NULL DEFAULT 'Electronics & Communication Engineering',
    college_name TEXT NOT NULL DEFAULT 'PCE-NAGPUR',
    cert_type TEXT NOT NULL DEFAULT 'PARTICIPATION', -- 'PARTICIPATION', 'WINNER_1ST', 'RUNNER_UP_2ND', 'RUNNER_UP_3RD', 'MERIT', 'APPRECIATION'
    title TEXT NOT NULL DEFAULT 'Certificate of Participation',
    rank_text TEXT DEFAULT 'Participant',
    description TEXT,
    template_id TEXT NOT NULL DEFAULT 'classic_gold', -- 'classic_gold', 'cyber_neon', 'sapphire_prestige', 'ruby_crimson', 'custom_upload'
    template_bg TEXT,
    certificate_image TEXT,
    canvas_config JSONB DEFAULT '{}'::jsonb,
    signatories JSONB DEFAULT '[]'::jsonb,
    qr_data TEXT NOT NULL,
    security_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VALID', -- 'VALID', 'REVOKED'
    issued_at TEXT NOT NULL,
    issued_by TEXT NOT NULL DEFAULT 'ECE Forum Executive Council',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Schema Migration for Existing Deployments of Certificates
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_image TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS canvas_config JSONB DEFAULT '{}'::jsonb;

-- 7. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_passes_user_email ON public.passes (user_email);
CREATE INDEX IF NOT EXISTS idx_passes_event_id ON public.passes (event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_email ON public.certificates (user_email);
CREATE INDEX IF NOT EXISTS idx_certificates_event_id ON public.certificates (event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_security_hash ON public.certificates (security_hash);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events (created_at DESC);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies
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

DROP POLICY IF EXISTS "Allow Public Update Admins" ON public.admins;
CREATE POLICY "Allow Public Update Admins" ON public.admins FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow Public Delete Admins" ON public.admins;
CREATE POLICY "Allow Public Delete Admins" ON public.admins FOR DELETE USING (true);

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

-- 10. Default Seed Data
INSERT INTO public.events (id, title, category, status, date, time, venue, description, badge, image, price, total_seats)
VALUES
    ('evt-1', 'SPACE & SINC Forum Installation Ceremony', 'Installation', 'Upcoming', 'July 30, 2026', '10:00 AM IST', 'PCE-NAGPUR Auditorium', 'Official installation ceremony for SPACE & SINC departmental councils for session 2026-27.', 'FLAGSHIP CEREMONY', '/event_images/inst.webp', 150, 250),
    ('evt-2', 'TARANG 2K26 Freshers Gala & Tech Fiesta', 'Workshop', 'Upcoming', 'July 30, 2026', '10:30 AM IST', 'PCE-NAGPUR Auditorium', 'Annual welcoming fiesta and hardware ice-breaker for 2nd year electronics students.', 'FRESHERS CELEBRATION', '/event_images/tarang.webp', 200, 300),
    ('evt-3', 'KiCAD 8 PCB Design & Fabrication Bootcamp', 'Workshop', 'Upcoming', 'Aug 12, 2026', '09:30 AM IST', 'ECE Simulation Lab 304', 'Hands-on schematic capture, routing, Gerber generation and CNC milling for custom 2-layer PCBs.', 'HANDS-ON BOOTCAMP', '/event_images/tarang.webp', 100, 60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, content)
VALUES (1, 'Registration Open for SPACE & SINC Forum Installation & TARANG 2K26 Fiesta!')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO public.admins (id, name, email, password, role)
VALUES
    ('admin-1', 'ECE Executive Admin', 'admin@ece.com', 'admin123', 'Forum President & Executive Council')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES
    ('hero_flagship', '{"badge": "OFFICIAL COUNCIL PORTAL 2026-27", "title": "SPACE & SINC", "subtitle": "Department of Electronics & Communication Engineering", "flagshipEventId": "evt-1"}'::jsonb),
    ('coupon_codes', '[{"code": "WELCOME10", "type": "PERCENTAGE", "value": 10, "maxUses": 100, "usedCount": 0, "active": true}]'::jsonb)
ON CONFLICT (key) DO NOTHING;
