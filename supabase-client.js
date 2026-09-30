/**
 * QUANTUM CODERS // SUPABASE CLIENT HELPER
 * Safe browser client initialization with Zero Secret Exposure.
 * Uses public ANON key. Never exposes SUPABASE_SERVICE_ROLE_KEY to the browser.
 * Auto-fetches configuration from /api/config on Vercel deployments.
 */

(function () {
  const STORAGE_URL_KEY = 'qc_supabase_url';
  const STORAGE_ANON_KEY = 'qc_supabase_anon_key';
  const PROD_SUPABASE_URL = 'https://vcmqqdrujmzpalfqtmfu.supabase.co';
  const PROD_SUPABASE_ANON_KEY = 'sb_publishable_W7h47aHX8yNO4W086M_3-A_zgReVwfG';

  const getSavedUrl = () => {
    return (
      (window.QC_CONFIG && window.QC_CONFIG.SUPABASE_URL) ||
      localStorage.getItem(STORAGE_URL_KEY) ||
      PROD_SUPABASE_URL
    );
  };

  const getSavedAnonKey = () => {
    return (
      (window.QC_CONFIG && window.QC_CONFIG.SUPABASE_ANON_KEY) ||
      localStorage.getItem(STORAGE_ANON_KEY) ||
      PROD_SUPABASE_ANON_KEY
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
    let list = [];

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('events')
          .select('*')
          .is('deleted_at', null)
          .order('date', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          list = data;
        }
      } catch (err) {
        console.warn('[Quantum Coders] Supabase getEvents error:', err);
      }
    }

    // Try Vercel Serverless API if Supabase client returned nothing
    if (!list.length) {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const apiList = await res.json();
          if (Array.isArray(apiList) && apiList.length > 0) {
            list = apiList;
          }
        }
      } catch (e) {}
    }

    return list;
  };

  // Helper to insert or upsert event into Supabase
  const upsertEvent = async (eventObj) => {
    const isNew = Boolean(eventObj._isNew || eventObj.is_new_event);

    // 1. Call serverless API first (has service role permissions)
    try {
      const res = await fetch('/api/events', {
        method: isNew ? 'POST' : (eventObj.id ? 'PUT' : 'POST'),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventObj)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.id || data.event_code)) return data;
      }
    } catch (e) {}

    // 2. Direct Supabase client fallback
    if (supabaseClient) {
      try {
        const { _isNew, is_new_event, ...cleanObj } = eventObj;
        let query;
        if (cleanObj.id && !isNew) {
          query = supabaseClient.from('events').upsert([cleanObj], { onConflict: 'id' });
        } else {
          query = supabaseClient.from('events').insert([cleanObj]);
        }
        const { data, error } = await query.select().single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Quantum Coders] Supabase upsertEvent error:', err);
      }
    }

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

  // Helper to submit event pass registration directly to Supabase
  const submitEventRegistration = async (regPayload, eventPayload = null) => {
    if (!supabaseClient) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    try {
      const rawEventId = regPayload.event_id || (eventPayload && eventPayload.id);
      let targetEventUuid = null;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawEventId);

      if (isUuid) {
        const { data: supaEv } = await supabaseClient
          .from('events')
          .select('id')
          .eq('id', rawEventId)
          .maybeSingle();

        if (supaEv && supaEv.id) {
          targetEventUuid = supaEv.id;
        }
      }

      if (!targetEventUuid && (rawEventId || (eventPayload && eventPayload.event_code))) {
        const codeQuery = (eventPayload && eventPayload.event_code) || rawEventId;
        const { data: evByCode } = await supabaseClient
          .from('events')
          .select('id')
          .eq('event_code', String(codeQuery).toUpperCase())
          .maybeSingle();

        if (evByCode && evByCode.id) {
          targetEventUuid = evByCode.id;
        }
      }

      if (!targetEventUuid && eventPayload) {
        const dbEventRow = {
          event_code: (eventPayload.event_code || eventPayload.slug || eventPayload.id || `QC-${Date.now()}`).toUpperCase().substring(0, 50),
          name: eventPayload.name || eventPayload.title || 'Quantum Coders Sprint',
          description: eventPayload.description || 'Quantum Coders Technical Event',
          event_type: eventPayload.event_type || eventPayload.category || 'Workshop',
          banner_url: eventPayload.banner_url || eventPayload.cover_image || 'images/event%20images/Pydah%20hackathon.png',
          date: eventPayload.date || eventPayload.event_date || '2026-04-10',
          start_time: eventPayload.start_time || '10:00:00',
          end_time: eventPayload.end_time || '18:00:00',
          venue: eventPayload.venue || 'Campus Auditorium',
          organizer: 'Quantum Coders',
          maximum_slots: eventPayload.maximum_slots || eventPayload.max_capacity || 100,
          registration_deadline: eventPayload.registration_deadline || new Date('2026-12-31T23:59:59Z').toISOString(),
          status: 'PUBLISHED',
          is_published: true,
          is_registration_open: true,
          is_calendar_visible: true,
          is_pass_enabled: true,
          is_gallery_enabled: true
        };

        const { data: createdEv, error: evInsertErr } = await supabaseClient
          .from('events')
          .upsert([dbEventRow], { onConflict: 'event_code' })
          .select('id')
          .single();

        if (!evInsertErr && createdEv) {
          targetEventUuid = createdEv.id;
        }
      }

      if (!targetEventUuid) {
        const { data: anyEv } = await supabaseClient.from('events').select('id').limit(1);
        if (anyEv && anyEv.length > 0) {
          targetEventUuid = anyEv[0].id;
        }
      }

      if (!targetEventUuid) {
        return { success: false, message: 'Could not resolve event UUID in Supabase events table.' };
      }

      const cleanPhone = (regPayload.phone || '').replace(/[^0-9+]/g, '').trim();
      const dbRegistrationRow = {
        registration_id: regPayload.registration_id || `QC${Math.floor(100 + Math.random() * 900)}`,
        event_id: targetEventUuid,
        name: (regPayload.name || '').trim().toUpperCase(),
        section: (regPayload.section || '').trim().toUpperCase(),
        phone: cleanPhone,
        email: (regPayload.email || '').trim().toLowerCase(),
        year: (regPayload.year || '').trim(),
        status: regPayload.status || 'CONFIRMED',
        registration_type: regPayload.registration_type || 'STANDARD',
        custom_responses: regPayload.custom_responses || {},
        verification_hash: regPayload.verification_hash || `hash_${regPayload.registration_id}_${cleanPhone.slice(-4)}`
      };

      const { data: insertedReg, error: regErr } = await supabaseClient
        .from('registrations')
        .insert([dbRegistrationRow])
        .select()
        .single();

      if (regErr) {
        console.warn('[Quantum Coders] Supabase registration insert error:', regErr.message);
        return { success: false, error: regErr, message: regErr.message };
      }

      console.log('[Quantum Coders] Saved registration to Supabase public.registrations table:', insertedReg);
      return { success: true, registration: insertedReg };
    } catch (err) {
      console.warn('[Quantum Coders] Supabase registration exception:', err.message);
      return { success: false, error: err, message: err.message };
    }
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
    submitStudentRegistration,
    submitEventRegistration
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
