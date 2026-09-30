/**
 * QUANTUM CODERS // SERVERLESS SUPABASE CLIENT (BACKEND ONLY)
 * Never import this file on the frontend!
 * Uses process.env.SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY securely on the server.
 */

let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.warn('[Quantum Coders] @supabase/supabase-js package not installed locally, using fallback store.');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-key';

let supabaseServerClient = null;

const isSupabaseConfigured = () => {
  return (
    createClient !== null &&
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('your-project') &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
};

const getSupabaseAdmin = () => {
  if (!isSupabaseConfigured() || !createClient) {
    return null;
  }
  if (!supabaseServerClient) {
    supabaseServerClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  }
  return supabaseServerClient;
};

// Safe fallback in-memory store for offline development and testing
const FALLBACK_STORE = {
  events: [
    {
      id: 'evt-001',
      event_code: 'QC-AI-2026',
      name: 'Deep Dive into LLMs & Agentic Systems',
      description: 'Hands-on architectural seminar and coding sprint exploring autonomous agentic workflows and local open-source LLM inference.',
      event_type: 'Workshop',
      banner_url: 'images/event%20images/Pydah%20hackathon.png',
      date: '2026-04-10',
      start_time: '10:00:00',
      end_time: '16:00:00',
      venue: 'High-Compute AI Lab & Auditorium',
      organizer: 'Quantum Coders AI Guild',
      eligibility: 'All B.Tech Engineering Students',
      maximum_slots: 100,
      registration_deadline: '2026-04-09T23:59:59Z',
      status: 'REGISTRATION OPEN',
      is_published: true,
      is_registration_open: true,
      is_calendar_visible: true,
      is_pass_enabled: true,
      is_gallery_enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'evt-002',
      event_code: 'QC-HACK-2026',
      name: 'Quantum Hack 2026: 36h Sprint',
      description: 'The flagship annual 36-hour hackathon bringing together builders, systems engineers, and designers across Andhra Pradesh.',
      event_type: 'Hackathon',
      banner_url: 'images/event%20images/Pydah%20hackathon%201.png',
      date: '2026-04-24',
      start_time: '09:00:00',
      end_time: '21:00:00',
      venue: 'Pydah Main Auditorium & Computing Centre',
      organizer: 'Quantum Coders Core Lead Cadre',
      eligibility: 'Open to all colleges',
      maximum_slots: 80,
      registration_deadline: '2026-04-22T23:59:59Z',
      status: 'REGISTRATION OPEN',
      is_published: true,
      is_registration_open: true,
      is_calendar_visible: true,
      is_pass_enabled: true,
      is_gallery_enabled: true,
      created_at: new Date().toISOString()
    }
  ],
  registrations: [],
  attendance: [],
  club_members: [],
  sections: {
    home: true,
    about: true,
    events: true,
    calendar: true,
    gallery: true,
    team: true,
    achievements: true,
    contact: true
  },
  otps: {}
};

module.exports = {
  getSupabaseAdmin,
  isSupabaseConfigured,
  FALLBACK_STORE
};
