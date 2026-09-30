/**
 * QUANTUM CODERS // EVENTS API
 * Vercel Serverless Function: GET, POST, PUT, DELETE for events.
 */

const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();

  try {
    // -------------------------------------------------------------------------
    // GET: Fetch Events
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      const { id, admin } = req.query;

      // 1. Single Event by ID or Event Code
      if (id) {
        if (supabase) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
          let q = supabase.from('events').select('*').is('deleted_at', null);
          if (isUuid) {
            q = q.eq('id', id);
          } else {
            q = q.eq('event_code', id);
          }

          const { data: event, error } = await q.maybeSingle();

          if (error || !event) {
            // Check fallback store
            const fallbackEv = FALLBACK_STORE.events.find((e) => (e.id === id || e.event_code === id) && !e.deleted_at);
            if (!fallbackEv) {
              return res.status(404).json({ error: 'Event not found' });
            }
            return res.status(200).json(normalizeEventResponse(fallbackEv));
          }

          // Count registrations
          const { count: confirmedCount } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'CONFIRMED');

          const { count: waitlistCount } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'WAITLIST');

          // Fetch custom fields
          const { data: customFields } = await supabase
            .from('event_custom_fields')
            .select('*')
            .eq('event_id', event.id)
            .order('display_order', { ascending: true });

          // Fetch event gallery
          const { data: gallery } = await supabase
            .from('event_gallery')
            .select('*')
            .eq('event_id', event.id)
            .order('display_order', { ascending: true });

          const now = new Date();
          const deadline = new Date(event.registration_deadline);
          const maxSlots = event.maximum_slots || 100;
          const conf = confirmedCount || 0;
          const isFull = conf >= maxSlots;
          const isDeadlinePassed = now > deadline;

          return res.status(200).json({
            ...normalizeEventResponse(event),
            confirmed_count: conf,
            waitlist_count: waitlistCount || 0,
            remaining_slots: Math.max(0, maxSlots - conf),
            is_full: isFull,
            is_deadline_passed: isDeadlinePassed,
            custom_fields: customFields || [],
            gallery: gallery || []
          });
        } else {
          // Fallback Store Single Event
          const event = FALLBACK_STORE.events.find((e) => (e.id === id || e.event_code === id) && !e.deleted_at);
          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }
          const confirmedCount = FALLBACK_STORE.registrations.filter((r) => r.event_id === event.id && r.status === 'CONFIRMED').length;
          const waitlistCount = FALLBACK_STORE.registrations.filter((r) => r.event_id === event.id && r.status === 'WAITLIST').length;
          const maxSlots = event.maximum_slots || event.max_capacity || 100;

          return res.status(200).json({
            ...normalizeEventResponse(event),
            confirmed_count: confirmedCount,
            waitlist_count: waitlistCount,
            remaining_slots: Math.max(0, maxSlots - confirmedCount),
            is_full: confirmedCount >= maxSlots,
            is_deadline_passed: new Date() > new Date(event.registration_deadline),
            custom_fields: [],
            gallery: []
          });
        }
      }

      // 2. List Events
      if (supabase) {
        let query = supabase.from('events').select('*');
        if (!admin) {
          query = query.is('deleted_at', null).order('date', { ascending: true });
        } else {
          query = query.is('deleted_at', null).order('created_at', { ascending: false });
        }

        const { data: events, error } = await query;
        if (error) {
          console.warn('[Events API] Supabase error, falling back to local store:', error.message);
        } else {
          // Augment with slot counts
          const augmented = await Promise.all(
            events.map(async (ev) => {
              const { count: confirmedCount } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', ev.id)
                .eq('status', 'CONFIRMED');

              const { count: waitlistCount } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', ev.id)
                .eq('status', 'WAITLIST');

              const maxSlots = ev.maximum_slots || ev.max_capacity || 100;
              const conf = confirmedCount || 0;

              return {
                ...normalizeEventResponse(ev),
                confirmed_count: conf,
                waitlist_count: waitlistCount || 0,
                remaining_slots: Math.max(0, maxSlots - conf),
                is_full: conf >= maxSlots,
                is_deadline_passed: new Date() > new Date(ev.registration_deadline)
              };
            })
          );

          return res.status(200).json(augmented);
        }
      }

      // Fallback Store List
      const list = FALLBACK_STORE.events
        .filter((e) => !e.deleted_at && (admin || e.is_published))
        .map((ev) => {
          const confirmedCount = FALLBACK_STORE.registrations.filter((r) => r.event_id === ev.id && r.status === 'CONFIRMED').length;
          const waitlistCount = FALLBACK_STORE.registrations.filter((r) => r.event_id === ev.id && r.status === 'WAITLIST').length;
          const maxSlots = ev.maximum_slots || ev.max_capacity || 100;
          return {
            ...normalizeEventResponse(ev),
            confirmed_count: confirmedCount,
            waitlist_count: waitlistCount,
            remaining_slots: Math.max(0, maxSlots - confirmedCount),
            is_full: confirmedCount >= maxSlots,
            is_deadline_passed: new Date() > new Date(ev.registration_deadline)
          };
        });

      return res.status(200).json(list);
    }

    // -------------------------------------------------------------------------
    // POST: Create Event (Admin)
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const payload = req.body || {};
      const name = (payload.name || payload.title || '').trim();
      const date = (payload.date || payload.event_date || '').trim();
      let start_time = (payload.start_time || '10:00:00').trim();
      let end_time = (payload.end_time || '18:00:00').trim();
      if (start_time.length === 5) start_time += ':00';
      if (end_time.length === 5) end_time += ':00';

      const venue = (payload.venue || 'Campus Auditorium').trim();
      const event_type = sanitizeEventType(payload.event_type || payload.category);
      const banner_url = payload.banner_url || payload.cover_image || 'images/event%20images/Pydah%20hackathon.png';
      const maximum_slots = parseInt(payload.maximum_slots || payload.max_capacity, 10) || 100;
      const description = (payload.description || '').trim();
      const organizer = (payload.organizer || 'Quantum Coders').trim();
      const eligibility = (payload.eligibility || 'Open to all students').trim();
      const status = payload.status || 'PUBLISHED';
      const is_published = status === 'DRAFT' ? false : (payload.is_published !== false);
      const is_registration_open = status === 'DRAFT' || status === 'REGISTRATION CLOSED' ? false : (payload.is_registration_open !== false);
      const is_calendar_visible = payload.is_calendar_visible !== false;
      const custom_fields = payload.custom_fields || [];

      if (!name || !date) {
        return res.status(400).json({ error: 'Missing required event fields: name/title and date are required.' });
      }

      const event_code = `QC-${(name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) || 'EVENT').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const isPayloadUuid = typeof payload.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.id);

      const newEvent = {
        ...(isPayloadUuid ? { id: payload.id } : {}),
        event_code,
        name,
        description,
        event_type,
        banner_url,
        date,
        start_time,
        end_time,
        venue,
        organizer,
        eligibility,
        maximum_slots,
        registration_deadline: payload.registration_deadline || `${date}T23:59:59Z`,
        status: status || (is_published ? (is_registration_open ? 'REGISTRATION OPEN' : 'PUBLISHED') : 'DRAFT'),
        is_published,
        is_registration_open,
        is_calendar_visible,
        is_pass_enabled: payload.is_pass_enabled !== false,
        is_gallery_enabled: payload.is_gallery_enabled !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        try {
          const { data, error } = await supabase.from('events').insert([newEvent]).select().single();
          if (!error && data) {
            // Insert custom fields if any
            if (Array.isArray(custom_fields) && custom_fields.length > 0) {
              const fieldsToInsert = custom_fields.map((f, idx) => ({
                event_id: data.id,
                field_name: f.field_name,
                field_type: f.field_type || 'text',
                field_options: f.field_options || [],
                is_required: Boolean(f.is_required),
                display_order: idx
              }));
              await supabase.from('event_custom_fields').insert(fieldsToInsert);
            }

            const normData = normalizeEventResponse(data);
            FALLBACK_STORE.events.unshift(normData);
            return res.status(201).json(normData);
          }
          console.warn('[Events API] Supabase insert warning:', error ? error.message : 'Unknown error');
        } catch (dbErr) {
          console.warn('[Events API] Supabase insert exception:', dbErr.message);
        }
      }

      newEvent.id = payload.id || `evt-${Date.now()}`;
      FALLBACK_STORE.events.unshift(newEvent);
      return res.status(201).json(normalizeEventResponse(newEvent));
    }

    // -------------------------------------------------------------------------
    // PUT: Update Event (Admin)
    // -------------------------------------------------------------------------
    if (req.method === 'PUT') {
      const payload = req.body || {};
      const { id, confirmed_warning, ...updates } = payload;

      if (!id) {
        return res.status(400).json({ error: 'Missing event ID' });
      }

      // Check if event has registrations and critical fields changed
      let hasRegistrations = false;
      let existingEvent = null;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

      if (supabase) {
        let q = supabase.from('events').select('*');
        if (isUuid) q = q.eq('id', id);
        else q = q.eq('event_code', id);

        const { data: ev } = await q.maybeSingle();
        existingEvent = ev;

        if (existingEvent) {
          const { count } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', existingEvent.id);
          hasRegistrations = (count || 0) > 0;
        }
      } else {
        existingEvent = FALLBACK_STORE.events.find((e) => e.id === id || e.event_code === id);
        if (existingEvent) {
          hasRegistrations = FALLBACK_STORE.registrations.some((r) => r.event_id === existingEvent.id);
        }
      }

      // If event was not found in database, insert it instead of failing with 404
      if (!existingEvent) {
        let startTime = (updates.start_time || '10:00:00').trim();
        let endTime = (updates.end_time || '18:00:00').trim();
        if (startTime.length === 5) startTime += ':00';
        if (endTime.length === 5) endTime += ':00';
        const evDate = updates.date || updates.event_date || new Date().toISOString().split('T')[0];
        const evName = (updates.name || updates.title || 'Quantum Coders Event').trim();
        const evType = sanitizeEventType(updates.event_type || updates.category);

        const createdPayload = {
          ...(isUuid ? { id } : {}),
          event_code: (updates.event_code || updates.slug || `QC-${Date.now()}`).toUpperCase().substring(0, 50),
          name: evName,
          description: updates.description || 'Quantum Coders technical event',
          event_type: evType,
          banner_url: updates.banner_url || updates.cover_image || 'images/event%20images/Pydah%20hackathon.png',
          date: evDate,
          start_time: startTime,
          end_time: endTime,
          venue: updates.venue || 'Campus Auditorium',
          organizer: updates.organizer || 'Quantum Coders',
          eligibility: updates.eligibility || 'Open to all students',
          maximum_slots: parseInt(updates.maximum_slots || updates.max_capacity, 10) || 100,
          registration_deadline: updates.registration_deadline || `${evDate}T23:59:59Z`,
          status: updates.status || 'PUBLISHED',
          is_published: updates.status === 'DRAFT' ? false : (updates.is_published !== false),
          is_registration_open: updates.status === 'DRAFT' ? false : (updates.is_registration_open !== false),
          is_calendar_visible: updates.is_calendar_visible !== false,
          is_pass_enabled: updates.is_pass_enabled !== false,
          is_gallery_enabled: updates.is_gallery_enabled !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (supabase) {
          try {
            const { data, error } = await supabase.from('events').insert([createdPayload]).select().single();
            if (!error && data) {
              const normData = normalizeEventResponse(data);
              FALLBACK_STORE.events.unshift(normData);
              return res.status(201).json(normData);
            }
          } catch (e) {}
        }

        createdPayload.id = id;
        FALLBACK_STORE.events.unshift(createdPayload);
        return res.status(201).json(normalizeEventResponse(createdPayload));
      }

      // Detect critical modifications
      const targetDate = updates.date || updates.event_date;
      const targetStartTime = updates.start_time;
      const targetVenue = updates.venue;
      const targetSlots = updates.maximum_slots || updates.max_capacity;

      const criticalChanged =
        (targetDate && targetDate !== existingEvent.date) ||
        (targetStartTime && targetStartTime !== existingEvent.start_time) ||
        (targetVenue && targetVenue !== existingEvent.venue) ||
        (targetSlots && parseInt(targetSlots, 10) !== existingEvent.maximum_slots);

      if (hasRegistrations && criticalChanged && !confirmed_warning) {
        return res.status(409).json({
          warning_required: true,
          message:
            'This event already has registered participants. Changing these details may affect existing participants and event passes. Continue?'
        });
      }

      // Sanitize fields to match database schema columns only
      const dbUpdates = {};
      if (updates.name !== undefined || updates.title !== undefined) {
        dbUpdates.name = updates.name || updates.title;
      }
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.event_type !== undefined || updates.category !== undefined) {
        dbUpdates.event_type = sanitizeEventType(updates.event_type || updates.category);
      }
      if (updates.banner_url !== undefined || updates.cover_image !== undefined) {
        dbUpdates.banner_url = updates.banner_url || updates.cover_image;
      }
      if (updates.date !== undefined || updates.event_date !== undefined) {
        dbUpdates.date = updates.date || updates.event_date;
      }
      if (updates.start_time !== undefined) {
        let st = updates.start_time.trim();
        if (st.length === 5) st += ':00';
        dbUpdates.start_time = st;
      }
      if (updates.end_time !== undefined) {
        let et = updates.end_time.trim();
        if (et.length === 5) et += ':00';
        dbUpdates.end_time = et;
      }
      if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
      if (updates.organizer !== undefined) dbUpdates.organizer = updates.organizer;
      if (updates.eligibility !== undefined) dbUpdates.eligibility = updates.eligibility;
      if (updates.maximum_slots !== undefined || updates.max_capacity !== undefined) {
        dbUpdates.maximum_slots = parseInt(updates.maximum_slots || updates.max_capacity, 10) || 100;
      }
      if (updates.registration_deadline !== undefined) dbUpdates.registration_deadline = updates.registration_deadline;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.is_published !== undefined) dbUpdates.is_published = Boolean(updates.is_published);
      if (updates.is_registration_open !== undefined) dbUpdates.is_registration_open = Boolean(updates.is_registration_open);
      if (updates.is_calendar_visible !== undefined) dbUpdates.is_calendar_visible = Boolean(updates.is_calendar_visible);
      if (updates.is_pass_enabled !== undefined) dbUpdates.is_pass_enabled = Boolean(updates.is_pass_enabled);
      if (updates.is_gallery_enabled !== undefined) dbUpdates.is_gallery_enabled = Boolean(updates.is_gallery_enabled);
      dbUpdates.updated_at = new Date().toISOString();

      if (supabase && existingEvent && existingEvent.id) {
        try {
          const { data, error } = await supabase.from('events').update(dbUpdates).eq('id', existingEvent.id).select().single();
          if (!error && data) {
            const norm = normalizeEventResponse(data);
            const fbIdx = FALLBACK_STORE.events.findIndex(e => e.id === existingEvent.id || e.event_code === existingEvent.event_code);
            if (fbIdx !== -1) FALLBACK_STORE.events[fbIdx] = norm;
            return res.status(200).json(norm);
          }
        } catch (dbErr) {
          console.warn('[Events API] Supabase update warning:', dbErr.message);
        }
      }

      Object.assign(existingEvent, dbUpdates);
      return res.status(200).json(normalizeEventResponse(existingEvent));
    }

    // -------------------------------------------------------------------------
    // DELETE: Soft Delete Event (Admin)
    // -------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing event ID' });
      }

      const deleted_at = new Date().toISOString();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

      if (supabase && isUuid) {
        const { error } = await supabase.from('events').update({ deleted_at, status: 'CANCELLED' }).eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true, message: 'Event soft deleted.' });
      } else {
        const ev = FALLBACK_STORE.events.find((e) => e.id === id || e.event_code === id);
        if (ev) {
          ev.deleted_at = deleted_at;
          ev.status = 'CANCELLED';
        }
        return res.status(200).json({ success: true, message: 'Event soft deleted.' });
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Events API Error:', err);
    return res.status(500).json({ error: 'Failed to process event operation.', details: err.message });
  }
};

// Normalize event fields so frontend and admin console receive identical properties
function normalizeEventResponse(ev) {
  if (!ev) return null;
  const name = ev.name || ev.title || 'Untitled Event';
  const date = ev.date || ev.event_date || '';
  const maxSlots = ev.maximum_slots || ev.max_capacity || 100;
  const banner = ev.banner_url || ev.cover_image || 'images/event%20images/Pydah%20hackathon.png';
  const event_type = ev.event_type || (ev.category ? (ev.category.charAt(0).toUpperCase() + ev.category.slice(1)) : 'Workshop');

  return {
    ...ev,
    id: ev.id,
    event_code: ev.event_code,
    name,
    title: name,
    description: ev.description || '',
    event_type,
    category: event_type.toLowerCase(),
    banner_url: banner,
    cover_image: banner,
    date,
    event_date: date,
    start_time: ev.start_time || '10:00:00',
    end_time: ev.end_time || '18:00:00',
    venue: ev.venue || 'Campus Auditorium',
    organizer: ev.organizer || 'Quantum Coders',
    eligibility: ev.eligibility || 'Open to all students',
    maximum_slots: maxSlots,
    max_capacity: maxSlots,
    registration_deadline: ev.registration_deadline,
    status: ev.status || (ev.is_published ? 'PUBLISHED' : 'DRAFT'),
    is_published: ev.is_published !== false,
    is_registration_open: ev.is_registration_open !== false,
    is_calendar_visible: ev.is_calendar_visible !== false,
    is_pass_enabled: ev.is_pass_enabled !== false,
    is_gallery_enabled: ev.is_gallery_enabled !== false,
    created_at: ev.created_at,
    updated_at: ev.updated_at,
    deleted_at: ev.deleted_at || null
  };
}

function sanitizeEventType(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('hack')) return 'Hackathon';
  if (t.includes('comp') || t.includes('contest') || t.includes('ctf')) return 'Competition';
  if (t.includes('seminar')) return 'Seminar';
  if (t.includes('webinar')) return 'Webinar';
  if (t.includes('meeting') || t.includes('club')) return 'Club Meeting';
  if (t.includes('other')) return 'Other';
  return 'Workshop';
}

