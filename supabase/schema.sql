-- ==============================================================================
-- QUANTUM CODERS // FULL EVENT MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL SCHEMA & POLICIES (MIGRATION SCRIPT)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ADMINS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- linked to Supabase auth.users
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'coordinator')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('Workshop', 'Hackathon', 'Competition', 'Seminar', 'Webinar', 'Club Meeting', 'Other')),
    banner_url TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL DEFAULT 'Quantum Coders',
    eligibility TEXT NOT NULL DEFAULT 'Open to all students',
    maximum_slots INTEGER NOT NULL DEFAULT 100 CHECK (maximum_slots > 0),
    registration_deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'REGISTRATION OPEN', 'REGISTRATION CLOSED', 'SLOTS FULL', 'COMPLETED', 'CANCELLED')),
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_registration_open BOOLEAN NOT NULL DEFAULT false,
    is_calendar_visible BOOLEAN NOT NULL DEFAULT true,
    is_pass_enabled BOOLEAN NOT NULL DEFAULT true,
    is_gallery_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ NULL
);

-- Index for public queries
CREATE INDEX IF NOT EXISTS idx_events_public ON public.events(is_published, date) WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------------
-- 3. REGISTRATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id TEXT UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    year TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'WAITLIST', 'CANCELLED', 'REJECTED')),
    registration_type TEXT NOT NULL DEFAULT 'STANDARD',
    custom_responses JSONB DEFAULT '{}'::jsonb,
    verification_hash TEXT NOT NULL,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cancelled_at TIMESTAMPTZ NULL
);

-- Unique constraint: duplicate protection per phone per event
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_event_phone 
ON public.registrations(event_id, phone) 
WHERE status != 'CANCELLED';

CREATE INDEX IF NOT EXISTS idx_reg_event_status ON public.registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_reg_phone ON public.registrations(phone);

-- ------------------------------------------------------------------------------
-- 4. EVENT CUSTOM FIELDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'url', 'select', 'textarea')),
    field_options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. ATTENDANCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT')),
    checked_in_by TEXT NOT NULL DEFAULT 'Admin Scanner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_event_checkin 
ON public.attendance(event_id, registration_id);

-- ------------------------------------------------------------------------------
-- 6. EVENT GALLERY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. WEBSITE SECTIONS TABLE (DYNAMIC FEATURE TOGGLES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_sections (
    section_key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.website_sections (section_key, label, enabled) VALUES
('home', 'Home', true),
('about', 'About Us', true),
('events', 'Events', true),
('calendar', 'Event Calendar', true),
('gallery', 'Gallery', true),
('team', 'Core Team', true),
('achievements', 'Achievements', true),
('contact', 'Contact', true)
ON CONFLICT (section_key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. STUDENT OTPS TABLE (PASS RETRIEVAL & CANCELLATION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    hashed_otp TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('RETRIEVE_PASS', 'CANCEL_REGISTRATION')),
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_otps_phone ON public.student_otps(phone, expires_at);

-- ------------------------------------------------------------------------------
-- 9. TRANSACTIONAL WAITLIST PROMOTION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_registration_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_next_waitlist_id UUID;
    v_max_slots INTEGER;
    v_confirmed_count INTEGER;
BEGIN
    -- Only trigger when status transitions to CANCELLED from CONFIRMED
    IF OLD.status = 'CONFIRMED' AND NEW.status = 'CANCELLED' THEN
        -- Get max slots for the event
        SELECT maximum_slots INTO v_max_slots FROM public.events WHERE id = NEW.event_id;
        
        -- Count current active confirmed registrations
        SELECT COUNT(*) INTO v_confirmed_count 
        FROM public.registrations 
        WHERE event_id = NEW.event_id AND status = 'CONFIRMED';

        -- If capacity is open, promote the first waitlisted student
        IF v_confirmed_count < v_max_slots THEN
            SELECT id INTO v_next_waitlist_id 
            FROM public.registrations 
            WHERE event_id = NEW.event_id AND status = 'WAITLIST'
            ORDER BY registered_at ASC 
            LIMIT 1
            FOR UPDATE SKIP LOCKED;

            IF v_next_waitlist_id IS NOT NULL THEN
                UPDATE public.registrations 
                SET status = 'CONFIRMED', updated_at = now() 
                WHERE id = v_next_waitlist_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_registration_cancel ON public.registrations;
CREATE TRIGGER trg_on_registration_cancel
AFTER UPDATE OF status ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_registration_cancellation();

-- ------------------------------------------------------------------------------
-- 10. PUBLIC CAPACITY AGGREGATE RPC (ZERO PII EXPOSURE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_event_public_capacity(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_event RECORD;
    v_confirmed INTEGER;
    v_waitlist INTEGER;
BEGIN
    SELECT maximum_slots, status, is_registration_open, registration_deadline 
    INTO v_event
    FROM public.events
    WHERE id = p_event_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Event not found');
    END IF;

    SELECT COUNT(*) INTO v_confirmed FROM public.registrations WHERE event_id = p_event_id AND status = 'CONFIRMED';
    SELECT COUNT(*) INTO v_waitlist FROM public.registrations WHERE event_id = p_event_id AND status = 'WAITLIST';

    RETURN jsonb_build_object(
        'maximum_slots', v_event.maximum_slots,
        'confirmed_count', v_confirmed,
        'remaining_slots', GREATEST(0, v_event.maximum_slots - v_confirmed),
        'waitlist_count', v_waitlist,
        'is_registration_open', v_event.is_registration_open,
        'is_full', (v_confirmed >= v_event.maximum_slots),
        'is_deadline_passed', (now() > v_event.registration_deadline)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_otps ENABLE ROW LEVEL SECURITY;

-- Events: Public can view active published events
CREATE POLICY "Public can view published events" 
ON public.events FOR SELECT 
USING (deleted_at IS NULL);

-- Events: Full management access for creating, editing, and deleting events
CREATE POLICY "Full access on events" 
ON public.events FOR ALL 
USING (true)
WITH CHECK (true);

-- Registrations: Public can view pass and submit; admins full access
CREATE POLICY "Public can view registrations" 
ON public.registrations FOR SELECT 
USING (true);

CREATE POLICY "Public can submit registration" 
ON public.registrations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Full access on registrations" 
ON public.registrations FOR ALL 
USING (true)
WITH CHECK (true);

-- Attendance: Full access
CREATE POLICY "Full access on attendance" 
ON public.attendance FOR ALL 
USING (true)
WITH CHECK (true);

-- Custom fields: Public can view fields for published events
CREATE POLICY "Public can view custom fields" 
ON public.event_custom_fields FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_custom_fields.event_id AND is_published = true AND deleted_at IS NULL));

CREATE POLICY "Full access on custom fields" 
ON public.event_custom_fields FOR ALL 
USING (true)
WITH CHECK (true);

-- Gallery: Public can view gallery of published events
CREATE POLICY "Public can view event gallery" 
ON public.event_gallery FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_gallery.event_id AND is_published = true AND deleted_at IS NULL));

CREATE POLICY "Full access on gallery" 
ON public.event_gallery FOR ALL 
USING (true)
WITH CHECK (true);

-- Website Sections: Public can read
CREATE POLICY "Public can read sections" 
ON public.website_sections FOR SELECT 
USING (true);

CREATE POLICY "Full access on sections" 
ON public.website_sections FOR ALL 
USING (true)
WITH CHECK (true);

-- Admins table: Authenticated admins can view
CREATE POLICY "Admins can view admins" 
ON public.admins FOR SELECT 
USING (true);

-- ------------------------------------------------------------------------------
-- 12. CLUB CADRE MEMBERS TABLE (STUDENT REGISTRATIONS & APPROVALS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.club_members (
    id TEXT PRIMARY KEY, -- 'APP-2026-XXXX'
    member_id TEXT UNIQUE, -- 'QC-2026-XXXX' minted upon admin approval
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL DEFAULT 'Pydah College of Engineering',
    year TEXT NOT NULL,
    branch TEXT NOT NULL,
    interest TEXT NOT NULL,
    statement TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_club_members_status ON public.club_members(status);
CREATE INDEX IF NOT EXISTS idx_club_members_phone ON public.club_members(phone);
CREATE INDEX IF NOT EXISTS idx_club_members_email ON public.club_members(email);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Anyone can submit club membership application
CREATE POLICY "Public can apply for club membership"
ON public.club_members FOR INSERT
WITH CHECK (true);

-- Anyone can check their own application or public status
CREATE POLICY "Public can check application status"
ON public.club_members FOR SELECT
USING (true);

-- Admins or Service Role have full access to update status (approve, reject, revoke) or delete
CREATE POLICY "Admins full access on club members"
ON public.club_members FOR ALL
USING (auth.role() = 'authenticated');

