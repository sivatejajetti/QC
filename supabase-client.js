/**
 * QUANTUM CODERS // SUPABASE CLIENT HELPER
 * Safe browser client initialization with Zero Secret Exposure.
 * Uses public ANON key. Never exposes SUPABASE_SERVICE_ROLE_KEY to the browser.
 * Auto-fetches configuration from /api/config on Vercel deployments.
 */

(function () {
  const STORAGE_URL_KEY = 'qc_supabase_url';
  const STORAGE_ANON_KEY = 'qc_supabase_anon_key';

  const getSavedUrl = () => {
    return (
      (window.QC_CONFIG && window.QC_CONFIG.SUPABASE_URL) ||
      localStorage.getItem(STORAGE_URL_KEY) ||
      ''
    );
  };

  const getSavedAnonKey = () => {
    return (
      (window.QC_CONFIG && window.QC_CONFIG.SUPABASE_ANON_KEY) ||
      localStorage.getItem(STORAGE_ANON_KEY) ||
      ''
    );
  };

  let supabaseClient = null;

  const initSupabase = () => {
    const url = getSavedUrl();
    const key = getSavedAnonKey();

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        if (
          url &&
          !url.includes('your-supabase-project') &&
          !url.includes('your-project') &&
          key &&
          !key.includes('your-public-anon-key') &&
          !key.includes('your-key')
        ) {
          supabaseClient = window.supabase.createClient(url, key);
          console.log('[Quantum Coders] Online Supabase client connected to:', url);
          return true;
        } else {
          supabaseClient = null;
        }
      } catch (err) {
        console.warn('[Quantum Coders] Supabase initialization failed:', err);
        supabaseClient = null;
      }
    }
    return false;
  };

  // Automatically fetch public config from Vercel /api/config
  const autoFetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.isConfigured && cfg.supabaseUrl && cfg.supabaseAnonKey) {
          window.QC_CONFIG = window.QC_CONFIG || {};
          window.QC_CONFIG.SUPABASE_URL = cfg.supabaseUrl;
          window.QC_CONFIG.SUPABASE_ANON_KEY = cfg.supabaseAnonKey;
          const connected = initSupabase();
          if (connected) {
            window.dispatchEvent(
              new CustomEvent('qc_supabase_connected', { detail: { url: cfg.supabaseUrl } })
            );
          }
        }
      }
    } catch (e) {
      // In local static mode or offline
    }
  };

  const saveCredentials = (url, anonKey) => {
    if (!url || !anonKey) {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_ANON_KEY);
      supabaseClient = null;
      return { success: false, message: 'Cleared credentials.' };
    }
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
    initSupabase();
    return { success: Boolean(supabaseClient), message: supabaseClient ? 'Supabase connected!' : 'Client initialization failed.' };
  };

  const testConnection = async () => {
    if (!supabaseClient) {
      return { ok: false, isMissingSchema: false, message: 'Supabase client is not initialized. Please verify Project URL and Anon Key.' };
    }
    try {
      // Query events table
      const { data, error } = await supabaseClient
        .from('events')
        .select('id')
        .limit(1);

      if (error) {
        const msg = (error.message || '').toLowerCase();
        const code = error.code || '';
        if (
          code === '42P01' ||
          code === 'PGRST205' ||
          code === 'PGRST204' ||
          code === 'PGRST200' ||
          msg.includes('schema cache') ||
          msg.includes('could not find the table') ||
          msg.includes('relation') ||
          msg.includes('does not exist')
        ) {
          return {
            ok: false,
            isMissingSchema: true,
            message: "Connected to Supabase project! However, the 'public.events' table has not been created yet in Postgres. Run supabase/schema.sql in your Supabase SQL Editor to initialize your database."
          };
        }
        return { ok: false, isMissingSchema: false, message: `Supabase query error: ${error.message}` };
      }
      return { ok: true, isMissingSchema: false, message: 'Successfully connected to Supabase PostgreSQL database!' };
    } catch (err) {
      return { ok: false, isMissingSchema: false, message: `Connection test error: ${err.message}` };
    }
  };

  // Helper to fetch events directly from Supabase
  const getEvents = async () => {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('events')
          .select('*')
          .is('deleted_at', null)
          .order('date', { ascending: true });

        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (err) {
        console.warn('[Quantum Coders] Supabase getEvents error:', err);
      }
    }

    // Try Vercel Serverless API
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) return list;
      }
    } catch (e) {}

    return [];
  };

  // Helper to insert or upsert event into Supabase
  const upsertEvent = async (eventObj) => {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('events')
          .upsert([eventObj], { onConflict: 'id' })
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Quantum Coders] Supabase upsertEvent error:', err);
      }
    }

    // Call serverless API
    try {
      const res = await fetch('/api/events', {
        method: eventObj.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventObj)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return null;
  };

  // Helper to fetch club members
  const getStudents = async (query = '') => {
    if (supabaseClient) {
      try {
        let q = supabaseClient.from('club_members').select('*').order('applied_at', { ascending: false });
        if (query) {
          q = q.or(`id.ilike.%${query}%,member_id.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`);
        }
        const { data, error } = await q;
        if (!error && Array.isArray(data)) return data;
      } catch (err) {}
    }

    try {
      const url = query ? `/api/students?query=${encodeURIComponent(query)}` : '/api/students';
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}

    return [];
  };

  // Helper to submit club registration
  const submitStudentRegistration = async (studentPayload) => {
    // Try Serverless API first
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentPayload)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback: direct Supabase insert
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('club_members')
          .insert([studentPayload])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {}
    }

    return null;
  };

  const QC_SUPABASE = {
    getClient: () => supabaseClient,
    isConfigured: () => Boolean(supabaseClient),
    init: initSupabase,
    autoFetchConfig,
    getUrl: getSavedUrl,
    getAnonKey: getSavedAnonKey,
    saveCredentials,
    testConnection,
    getEvents,
    upsertEvent,
    getStudents,
    submitStudentRegistration
  };

  window.QC_SUPABASE = QC_SUPABASE;
  window.SupabaseClient = QC_SUPABASE; // Alias for compatibility

  // Attempt auto-initialization & remote config fetch
  const setup = () => {
    initSupabase();
    autoFetchConfig();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
