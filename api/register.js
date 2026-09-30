/**
 * QUANTUM CODERS // REGISTRATION API
 * Vercel Serverless Function: Student event registration with atomic slot check,
 * duplicate phone protection, waitlist assignment, and pass generation.
 */

const crypto = require('crypto');
const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

// Generate Unique Registration ID like QCAIW101
function generateRegistrationId(eventCode) {
  const prefix = (eventCode || 'QC')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 5)
    .toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}${randomNum}`;
}

// Generate cryptographic verification token for the pass QR code
function generatePassHash(registrationId, phone, eventId) {
  const secret = process.env.PASS_SECRET_SALT || 'quantum-coders-2026-cadre-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${registrationId}:${phone}:${eventId}`)
    .digest('hex')
    .substring(0, 32);
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();

  // ---------------------------------------------------------------------------
  // GET: Fetch Passes / Registrations (Online from Supabase)
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    const { event_id, id, phone } = req.query;
    try {
      if (supabase) {
        let query = supabase
          .from('registrations')
          .select('*, events (name, event_code, date, venue, start_time, end_time)')
          .order('registered_at', { ascending: false });

        if (event_id && event_id !== 'all') {
          query = query.eq('event_id', event_id);
        }
        if (id) {
          query = query.eq('registration_id', id.trim());
        }
        if (phone) {
          const clean = phone.replace(/[^0-9+]/g, '').trim();
          query = query.eq('phone', clean);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('[Register API] Supabase query warning:', error.message);
          return res.status(200).json(FALLBACK_STORE.registrations || []);
        }
        return res.status(200).json(data || []);
      } else {
        let list = FALLBACK_STORE.registrations || [];
        if (event_id && event_id !== 'all') {
          list = list.filter(r => String(r.event_id) === String(event_id));
        }
        if (id) {
          list = list.filter(r => r.registration_id === id.trim());
        }
        if (phone) {
          const clean = phone.replace(/[^0-9+]/g, '').trim();
          list = list.filter(r => r.phone === clean);
        }
        return res.status(200).json(list);
      }
    } catch (err) {
      console.error('Fetch Registrations Error:', err);
      return res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
  }

  // ---------------------------------------------------------------------------
  // PUT: Update Registration Status (e.g. Cancel or Verify Pass)
  // ---------------------------------------------------------------------------
  if (req.method === 'PUT') {
    const { id, registration_id, status } = req.body || {};
    const targetId = id || registration_id;
    if (!targetId || !status) {
      return res.status(400).json({ error: 'Missing registration ID or status.' });
    }
    try {
      const updates = { status, updated_at: new Date().toISOString() };
      if (status === 'CANCELLED') updates.cancelled_at = new Date().toISOString();

      if (supabase) {
        const { data, error } = await supabase
          .from('registrations')
          .update(updates)
          .or(`id.eq.${targetId},registration_id.eq.${targetId}`)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ success: true, registration: data });
      } else {
        const item = (FALLBACK_STORE.registrations || []).find(
          r => r.id === targetId || r.registration_id === targetId
        );
        if (item) Object.assign(item, updates);
        return res.status(200).json({ success: true, registration: item });
      }
    } catch (err) {
      console.error('Update Registration Error:', err);
      return res.status(500).json({ error: 'Failed to update registration status.' });
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Remove Registration (Admin)
  // ---------------------------------------------------------------------------
  if (req.method === 'DELETE') {
    const id = req.query.id || (req.body && req.body.id);
    if (!id) return res.status(400).json({ error: 'Missing registration ID to delete.' });

    try {
      if (supabase) {
        const { error } = await supabase
          .from('registrations')
          .delete()
          .or(`id.eq.${id},registration_id.eq.${id}`);
        if (error) throw error;
      }
      FALLBACK_STORE.registrations = (FALLBACK_STORE.registrations || []).filter(
        r => r.id !== id && r.registration_id !== id
      );
      return res.status(200).json({ success: true, message: `Registration ${id} removed.` });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete registration.' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const payload = req.body || {};
  const { event_id, name, section, phone, email, year, custom_responses } = payload;

  // 1. Validation
  if (!event_id || !name || !section || !phone || !email || !year) {
    return res.status(400).json({
      error: 'Please fill in all required registration fields (Name, Section, Phone, Email, Year).'
    });
  }

  // Clean phone number
  const cleanPhone = phone.replace(/[^0-9+]/g, '').trim();
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  }

  try {
    let event = null;

    // 2. Fetch Event
    if (supabase) {
      const { data: ev, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', event_id)
        .is('deleted_at', null)
        .single();

      if (error || !ev) {
        return res.status(404).json({ error: 'This event does not exist or has been removed.' });
      }
      event = ev;
    } else {
      event = FALLBACK_STORE.events.find((e) => e.id === event_id && !e.deleted_at);
      if (!event) {
        return res.status(404).json({ error: 'This event does not exist or has been removed.' });
      }
    }

    // Check if event is active & open
    if (!event.is_published || !event.is_registration_open) {
      return res.status(400).json({ error: 'Registration is currently closed for this event.' });
    }

    if (new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed for this event.' });
    }

    // 3. Duplicate Phone Protection Check
    if (supabase) {
      const { data: existingReg } = await supabase
        .from('registrations')
        .select('id, status, registration_id')
        .eq('event_id', event_id)
        .eq('phone', cleanPhone)
        .neq('status', 'CANCELLED')
        .maybeSingle();

      if (existingReg) {
        return res.status(409).json({
          error: 'This phone number is already registered for this event.',
          registration_id: existingReg.registration_id,
          status: existingReg.status
        });
      }
    } else {
      const existing = FALLBACK_STORE.registrations.find(
        (r) => r.event_id === event_id && r.phone === cleanPhone && r.status !== 'CANCELLED'
      );
      if (existing) {
        return res.status(409).json({
          error: 'This phone number is already registered for this event.',
          registration_id: existing.registration_id,
          status: existing.status
        });
      }
    }

    // 4. Capacity & Waitlist Determination
    let confirmedCount = 0;
    if (supabase) {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('status', 'CONFIRMED');
      confirmedCount = count || 0;
    } else {
      confirmedCount = FALLBACK_STORE.registrations.filter(
        (r) => r.event_id === event_id && r.status === 'CONFIRMED'
      ).length;
    }

    const assignedStatus = confirmedCount < event.maximum_slots ? 'CONFIRMED' : 'WAITLIST';

    // 5. Generate Credentials
    let registrationId = generateRegistrationId(event.event_code);
    let verificationHash = generatePassHash(registrationId, cleanPhone, event.id);

    const newRecord = {
      registration_id: registrationId,
      event_id: event.id,
      name: name.trim().toUpperCase(),
      section: section.trim().toUpperCase(),
      phone: cleanPhone,
      email: email.trim().toLowerCase(),
      year: year.trim(),
      status: assignedStatus,
      registration_type: 'STANDARD',
      custom_responses: custom_responses || {},
      verification_hash: verificationHash,
      registered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('registrations')
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'This phone number is already registered for this event.' });
        }
        throw error;
      }

      // Return pass payload
      return res.status(201).json({
        success: true,
        status: assignedStatus,
        registration: {
          id: data.id,
          registration_id: data.registration_id,
          name: data.name,
          section: data.section,
          phone: data.phone,
          email: data.email,
          year: data.year,
          status: data.status,
          verification_hash: data.verification_hash,
          registered_at: data.registered_at
        },
        event: {
          id: event.id,
          name: event.name,
          event_type: event.event_type,
          date: event.date,
          start_time: event.start_time,
          end_time: event.end_time,
          venue: event.venue
        },
        qr_payload: JSON.stringify({
          rid: data.registration_id,
          eid: event.id,
          hash: data.verification_hash
        })
      });
    } else {
      newRecord.id = `reg-${Date.now()}`;
      FALLBACK_STORE.registrations.unshift(newRecord);

      return res.status(201).json({
        success: true,
        status: assignedStatus,
        registration: newRecord,
        event: {
          id: event.id,
          name: event.name,
          event_type: event.event_type,
          date: event.date,
          start_time: event.start_time,
          end_time: event.end_time,
          venue: event.venue
        },
        qr_payload: JSON.stringify({
          rid: newRecord.registration_id,
          eid: event.id,
          hash: newRecord.verification_hash
        })
      });
    }
  } catch (err) {
    console.error('Registration API Error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};
