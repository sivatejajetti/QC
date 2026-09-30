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

      // 1. Single Event by ID
      if (id) {
        if (supabase) {
          const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

          if (error || !event) {
            return res.status(404).json({ error: 'Event not found' });
          }

          // Count registrations
          const { count: confirmedCount } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', id)
            .eq('status', 'CONFIRMED');

          const { count: waitlistCount } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', id)
            .eq('status', 'WAITLIST');

          // Fetch custom fields
          const { data: customFields } = await supabase
            .from('event_custom_fields')
            .select('*')
            .eq('event_id', id)
            .order('display_order', { ascending: true });

          // Fetch event gallery
          const { data: gallery } = await supabase
            .from('event_gallery')
            .select('*')
            .eq('event_id', id)
            .order('display_order', { ascending: true });

          const now = new Date();
          const deadline = new Date(event.registration_deadline);
          const isFull = (confirmedCount || 0) >= event.maximum_slots;
          const isDeadlinePassed = now > deadline;

          return res.status(200).json({
            ...event,
            confirmed_count: confirmedCount || 0,
            waitlist_count: waitlistCount || 0,
            remaining_slots: Math.max(0, event.maximum_slots - (confirmedCount || 0)),
            is_full: isFull,
            is_deadline_passed: isDeadlinePassed,
            custom_fields: customFields || [],
            gallery: gallery || []
          });
        } else {
          // Fallback Store Single Event
          const event = FALLBACK_STORE.events.find((e) => e.id === id && !e.deleted_at);
          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }
          const confirmedCount = FALLBACK_STORE.registrations.filter((r) => r.event_id === id && r.status === 'CONFIRMED').length;
          const waitlistCount = FALLBACK_STORE.registrations.filter((r) => r.event_id === id && r.status === 'WAITLIST').length;

          return res.status(200).json({
            ...event,
            confirmed_count: confirmedCount,
            waitlist_count: waitlistCount,
            remaining_slots: Math.max(0, event.maximum_slots - confirmedCount),
            is_full: confirmedCount >= event.maximum_slots,
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
          query = query.eq('is_published', true).is('deleted_at', null).order('date', { ascending: true });
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

              return {
                ...ev,
                name: ev.name || ev.title,
                title: ev.name || ev.title,
                date: ev.date || ev.event_date,
                event_date: ev.date || ev.event_date,
                max_capacity: ev.maximum_slots || ev.max_capacity,
                maximum_slots: ev.maximum_slots || ev.max_capacity,
                cover_image: ev.banner_url || ev.cover_image,
                banner_url: ev.banner_url || ev.cover_image,
                confirmed_count: confirmedCount || 0,
                waitlist_count: waitlistCount || 0,
                remaining_slots: Math.max(0, (ev.maximum_slots || ev.max_capacity || 100) - (confirmedCount || 0)),
                is_full: (confirmedCount || 0) >= (ev.maximum_slots || ev.max_capacity || 100),
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
              ...ev,
              name: ev.name || ev.title,
              title: ev.name || ev.title,
              date: ev.date || ev.event_date,
              event_date: ev.date || ev.event_date,
              max_capacity: maxSlots,
              maximum_slots: maxSlots,
              cover_image: ev.banner_url || ev.cover_image,
              banner_url: ev.banner_url || ev.cover_image,
              confirmed_count: confirmedCount,
              waitlist_count: waitlistCount,
              remaining_slots: Math.max(0, maxSlots - confirmedCount),
              is_full: confirmedCount >= maxSlots,
              is_deadline_passed: new Date() > new Date(ev.registration_deadline)
            };
          });

        return res.status(200).json(list);
      }
    }

    // -------------------------------------------------------------------------
    // POST: Create Event (Admin)
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const payload = req.body || {};
      const name = (payload.name || payload.title || '').trim();
      const date = (payload.date || payload.event_date || '').trim();
      const start_time = (payload.start_time || '10:00:00').trim();
      const end_time = (payload.end_time || '18:00:00').trim();
      const venue = (payload.venue || 'Campus Auditorium').trim();
      const event_type = payload.event_type || (payload.category ? (payload.category.charAt(0).toUpperCase() + payload.category.slice(1)) : 'Workshop');
      const banner_url = payload.banner_url || payload.cover_image || 'images/event%20images/Pydah%20hackathon.png';
      const maximum_slots = parseInt(payload.maximum_slots || payload.max_capacity, 10) || 100;
      const description = (payload.description || '').trim();
      const organizer = (payload.organizer || 'Quantum Coders').trim();
      const eligibility = (payload.eligibility || 'Open to all students').trim();
      const status = payload.status || 'PUBLISHED';
      const is_published = payload.is_published !== undefined ? Boolean(payload.is_published) : (status === 'PUBLISHED' || status === 'REGISTRATION OPEN');
      const is_registration_open = payload.is_registration_open !== undefined ? Boolean(payload.is_registration_open) : (status === 'PUBLISHED' || status === 'REGISTRATION OPEN');
      const is_calendar_visible = payload.is_calendar_visible !== false;
      const custom_fields = payload.custom_fields || [];

      if (!name || !date) {
        return res.status(400).json({ error: 'Missing required event fields: name/title and date are required.' });
      }

      const event_code = `QC-${(name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) || 'EVENT').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const newEvent = {
        event_code,
        name,
        title: name,
        description,
        event_type,
        category: event_type.toLowerCase(),
        banner_url,
        cover_image: banner_url,
        date,
        event_date: date,
        start_time,
        end_time,
        venue,
        organizer,
        eligibility,
        maximum_slots,
        max_capacity: maximum_slots,
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
        // Strip virtual fields before Postgres insert
        const dbPayload = {
          event_code: newEvent.event_code,
          name: newEvent.name,
          description: newEvent.description,
          event_type: newEvent.event_type,
          banner_url: newEvent.banner_url,
          date: newEvent.date,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          venue: newEvent.venue,
          organizer: newEvent.organizer,
          eligibility: newEvent.eligibility,
          maximum_slots: newEvent.maximum_slots,
          registration_deadline: newEvent.registration_deadline,
          status: newEvent.status,
          is_published: newEvent.is_published,
          is_registration_open: newEvent.is_registration_open,
          is_calendar_visible: newEvent.is_calendar_visible,
          is_pass_enabled: newEvent.is_pass_enabled,
          is_gallery_enabled: newEvent.is_gallery_enabled,
          created_at: newEvent.created_at,
          updated_at: newEvent.updated_at
        };

        const { data, error } = await supabase.from('events').insert([dbPayload]).select().single();
        if (error) throw error;

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

        return res.status(201).json({ ...data, title: data.name, event_date: data.date, max_capacity: data.maximum_slots });
      } else {
        newEvent.id = `evt-${Date.now()}`;
        FALLBACK_STORE.events.unshift(newEvent);
        return res.status(201).json(newEvent);
      }
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

      if (supabase) {
        const { data: ev } = await supabase.from('events').select('*').eq('id', id).single();
        existingEvent = ev;
        const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', id);
        hasRegistrations = (count || 0) > 0;
      } else {
        existingEvent = FALLBACK_STORE.events.find((e) => e.id === id);
        hasRegistrations = FALLBACK_STORE.registrations.some((r) => r.event_id === id);
      }

      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Detect critical modifications
      const criticalChanged =
        (updates.date && updates.date !== existingEvent.date) ||
        (updates.start_time && updates.start_time !== existingEvent.start_time) ||
        (updates.venue && updates.venue !== existingEvent.venue) ||
        (updates.maximum_slots && parseInt(updates.maximum_slots, 10) !== existingEvent.maximum_slots);

      if (hasRegistrations && criticalChanged && !confirmed_warning) {
        return res.status(409).json({
          warning_required: true,
          message:
            'This event already has registered participants. Changing these details may affect existing participants and event passes. Continue?'
        });
      }

      updates.updated_at = new Date().toISOString();

      if (supabase) {
        const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        Object.assign(existingEvent, updates);
        return res.status(200).json(existingEvent);
      }
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

      if (supabase) {
        const { error } = await supabase.from('events').update({ deleted_at, status: 'CANCELLED' }).eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true, message: 'Event soft deleted.' });
      } else {
        const ev = FALLBACK_STORE.events.find((e) => e.id === id);
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
    return res.status(500).json({ error: 'Failed to process event operation.' });
  }
};
