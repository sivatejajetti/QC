/**
 * QUANTUM CODERS // SERVERLESS SUPABASE CLIENT (BACKEND ONLY)
 * Never import this file on the frontend!
 * Uses process.env.SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY securely on the server.
 */

// Provide WebSocket polyfill if missing in Node runtime (e.g. Node 20 on Vercel without experimental flag)
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {};
}

let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.warn('[Quantum Coders] @supabase/supabase-js package not installed locally, using fallback store.');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vcmqqdrujmzpalfqtmfu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

let supabaseServerClient = null;

const isSupabaseConfigured = () => {
  return (
    createClient !== null &&
    Boolean(SUPABASE_URL) &&
    !SUPABASE_URL.includes('your-project') &&
    Boolean(SUPABASE_KEY) &&
    !SUPABASE_KEY.includes('your-key')
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
  events: [],
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
