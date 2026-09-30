/**
 * QUANTUM CODERS // SERVERLESS SUPABASE CLIENT (BACKEND ONLY)
 * Never import this file on the frontend!
 * Uses process.env.SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY securely on the server.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-key';

let supabaseServerClient = null;

const isSupabaseConfigured = () => {
  return (
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('your-project') &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
};

const getSupabaseAdmin = () => {
  if (!isSupabaseConfigured()) {
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
  club_members: [
    {
      id: 'APP-2026-4819',
      member_id: 'QC-2026-4819',
      full_name: 'ROHAN KUMAR',
      email: 'rohan.kumar@pydah.edu.in',
      phone: '+91 98480 22334',
      college: 'Pydah College of Engineering',
      year: '3rd Year',
      branch: 'CSE (AI & DS)',
      interest: 'AI / ML',
      statement: 'Built a local RAG assistant for our campus library. Eager to contribute to the club open-source LLM benchmarking initiative.',
      status: 'approved',
      applied_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'APP-2026-7201',
      member_id: null,
      full_name: 'ANANYA SHARMA',
      email: 'ananya.s@pydah.edu.in',
      phone: '+91 99123 45678',
      college: 'Pydah College of Engineering',
      year: '2nd Year',
      branch: 'Computer Science & Engineering',
      interest: 'FULL STACK',
      statement: 'Passionate about React and TypeScript micro-frontends. Want to build high-concurrency tooling for collegiate hackathons.',
      status: 'pending',
      applied_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      reviewed_at: null
    },
    {
      id: 'APP-2026-9054',
      member_id: null,
      full_name: 'VAMSI KRISHNA REDDY',
      email: 'vamsi.krishna@pydah.edu.in',
      phone: '+91 94401 88992',
      college: 'Pydah College of Engineering',
      year: '3rd Year',
      branch: 'Electronics & Communication',
      interest: 'SYSTEMS',
      statement: 'Experienced with ESP32 IoT gateways and Rust firmware. Looking to bridge hardware sensors with club edge compute clusters.',
      status: 'pending',
      applied_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      reviewed_at: null
    }
  ],
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
