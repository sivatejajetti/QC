/**
 * QUANTUM CODERS // PASS VERIFICATION & ATTENDANCE API
 * Vercel Serverless Function: Validates student QR passes and marks attendance.
 * Checks for cancelled passes, waitlist status, and handles duplicate check-in warnings.
 */

// WebSocket polyfill for Node 20 runtime environments
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {};
}

const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

// Helper to extract registration identifiers from any format (URL, JSON, plain text, phone)
function extractPassIdentifiers(body = {}, query = {}) {
  let rid = null;
  let phone = null;
  let eid = null;

  // 1. Direct fields
  const candidates = [
    body.registration_id, body.rid, body.reg_id, body.id,
    query.registration_id, query.rid, query.reg_id, query.id
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim()) {
      rid = c.trim();
      break;
    }
  }

  if (body.phone || query.phone) {
    phone = String(body.phone || query.phone).trim();
  }

  if (body.event_id || body.eid || query.event_id || query.eid) {
    eid = String(body.event_id || body.eid || query.event_id || query.eid).trim();
  }

  // 2. Inspect raw payloads (qr_payload, payload, query, text)
  const rawSources = [body.qr_payload, body.payload, body.query, body.text, query.data];
  for (const raw of rawSources) {
    if (!raw) continue;

    if (typeof raw === 'object') {
      rid = rid || raw.rid || raw.reg_id || raw.registration_id || raw.id;
      phone = phone || raw.phone;
      eid = eid || raw.eid || raw.event_id;
      continue;
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      // Case A: JSON object
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('%7B') && trimmed.endsWith('%7D'))) {
        try {
          const parsed = JSON.parse(decodeURIComponent(trimmed));
          rid = rid || parsed.rid || parsed.reg_id || parsed.registration_id || parsed.id;
          phone = phone || parsed.phone;
          eid = eid || parsed.eid || parsed.event_id;
          continue;
        } catch (e) {}
      }

      // Case B: URL (e.g. https://.../verify?rid=QCAIT194 or ?rid=QCAIT194)
      if (trimmed.includes('?') || trimmed.includes('/') || trimmed.startsWith('http')) {
        try {
          const urlStr = trimmed.startsWith('http') ? trimmed : `https://qc.internal/${trimmed.replace(/^\/?/, '')}`;
          const u = new URL(urlStr);
          const urlRid = u.searchParams.get('rid') || u.searchParams.get('id') || u.searchParams.get('reg_id') || u.searchParams.get('registration_id');
          if (urlRid) rid = rid || urlRid;
          const urlPhone = u.searchParams.get('phone');
          if (urlPhone) phone = phone || urlPhone;
          const urlEid = u.searchParams.get('eid') || u.searchParams.get('event_id');
          if (urlEid) eid = eid || urlEid;

          const pathParts = u.pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2 && ['pass', 'verify', 'ticket'].includes(pathParts[0].toLowerCase())) {
            rid = rid || pathParts[1];
          }
        } catch (e) {
          const matchRid = trimmed.match(/[?&](?:rid|reg_id|registration_id|id)=([a-zA-Z0-9_-]+)/i);
          if (matchRid) rid = rid || matchRid[1];
        }
      }

      // Case C: Phone number
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (!rid && !phone && (digitsOnly.length === 10 || (digitsOnly.length > 10 && trimmed.startsWith('+')))) {
        phone = trimmed;
        continue;
      }

      // Case D: Plain alphanumeric registration code (e.g. QCAIT194)
      if (!rid && /^[a-zA-Z0-9_-]{3,30}$/.test(trimmed)) {
        rid = trimmed;
      }
    }
  }

  // If rid looks like a URL or query string, parse it cleanly
  if (rid && (rid.includes('?') || rid.includes('http') || rid.includes('/'))) {
    try {
      const urlStr = rid.startsWith('http') ? rid : `https://qc.internal/${rid.replace(/^\/?/, '')}`;
      const u = new URL(urlStr);
      const urlRid = u.searchParams.get('rid') || u.searchParams.get('id') || u.searchParams.get('reg_id') || u.searchParams.get('registration_id');
      if (urlRid) rid = urlRid;
      const urlPhone = u.searchParams.get('phone');
      if (urlPhone) phone = phone || urlPhone;
    } catch (e) {
      const matchRid = rid.match(/[?&](?:rid|reg_id|registration_id|id)=([a-zA-Z0-9_-]+)/i);
      if (matchRid) rid = matchRid[1];
    }
  }

  return {
    rid: rid ? String(rid).trim().toUpperCase() : null,
    phone: phone ? String(phone).trim() : null,
    eid: eid ? String(eid).trim() : null
  };
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();

  // ---------------------------------------------------------------------------
  // GET: Fetch Attendance Records or Query Single Pass
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    const { list, event_id } = req.query || {};

    if (list === 'true' || req.query.type === 'attendance') {
      try {
        if (supabase) {
          let q = supabase.from('attendance').select('*').order('check_in_time', { ascending: false });
          if (event_id && event_id !== 'all') {
            q = q.eq('event_id', event_id);
          }
          const { data, error } = await q;
          if (error) throw error;
          return res.status(200).json(data || []);
        } else {
          let attList = FALLBACK_STORE.attendance || [];
          if (event_id && event_id !== 'all') {
            attList = attList.filter(a => a.event_id === event_id);
          }
          return res.status(200).json(attList);
        }
      } catch (err) {
        console.error('Fetch Attendance Error:', err);
        return res.status(500).json({ error: 'Failed to fetch attendance records.' });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Verification & Check-in Logic (POST or GET with parameters)
  // ---------------------------------------------------------------------------
  const { rid, phone, eid } = extractPassIdentifiers(req.body || {}, req.query || {});

  if (!rid && !phone) {
    return res.status(400).json({
      success: false,
      error: 'Missing pass data. Please scan a valid QR code or enter Registration ID / Phone.'
    });
  }

  try {
    let registration = null;
    let event = null;

    // 1. Fetch Registration and Event from Supabase
    if (supabase) {
      if (rid) {
        // Try exact match on registration_id
        const { data: reg, error: regErr } = await supabase
          .from('registrations')
          .select('*, events (*)')
          .ilike('registration_id', rid)
          .maybeSingle();

        if (reg) {
          registration = reg;
          event = reg.events;
        } else {
          // Also try uuid id
          const { data: regById } = await supabase
            .from('registrations')
            .select('*, events (*)')
            .eq('id', rid)
            .maybeSingle();
          if (regById) {
            registration = regById;
            event = regById.events;
          }
        }
      }

      // If still not found, search by phone
      if (!registration && phone) {
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        const raw10 = cleanPhone.slice(-10);

        let phoneQuery = supabase
          .from('registrations')
          .select('*, events (*)')
          .or(`phone.eq.${cleanPhone},phone.eq.+91${raw10},phone.eq.${raw10}`);

        if (eid) phoneQuery = phoneQuery.eq('event_id', eid);

        const { data: phoneRegs } = await phoneQuery.order('registered_at', { ascending: false }).limit(1);
        if (phoneRegs && phoneRegs.length > 0) {
          registration = phoneRegs[0];
          event = registration.events;
        }
      }
    } else {
      // Fallback in-memory store
      if (rid) {
        registration = (FALLBACK_STORE.registrations || []).find(
          r => String(r.registration_id).toUpperCase() === rid.toUpperCase() || String(r.id) === rid
        );
      }
      if (!registration && phone) {
        const clean = phone.replace(/\D/g, '').slice(-10);
        registration = (FALLBACK_STORE.registrations || []).find(r => r.phone.includes(clean));
      }
      if (registration) {
        event = (FALLBACK_STORE.events || []).find(e => e.id === registration.event_id);
      }
    }

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'This event pass is invalid. Record not found in cadre registry.',
        message: 'This event pass is invalid. Record not found in cadre registry.'
      });
    }

    // Ensure event object is populated
    if (!event && registration.event_id && supabase) {
      const { data: evData } = await supabase.from('events').select('*').eq('id', registration.event_id).maybeSingle();
      event = evData;
    }
    event = event || {
      id: registration.event_id,
      name: 'Quantum Coders Event',
      title: 'Quantum Coders Event',
      date: '',
      venue: 'Campus'
    };

    // 2. Validate Status
    if (registration.status === 'CANCELLED') {
      return res.status(200).json({
        success: false,
        is_cancelled: true,
        status: 'CANCELLED',
        error: 'This event pass has been cancelled.',
        message: `This pass has been CANCELLED (${registration.name})`,
        registration: {
          full_name: registration.name,
          name: registration.name,
          registration_id: registration.registration_id,
          phone: registration.phone,
          status: 'CANCELLED'
        },
        event: {
          title: event.name || event.title || 'Event',
          name: event.name || event.title || 'Event'
        }
      });
    }

    if (registration.status === 'WAITLIST') {
      return res.status(200).json({
        success: false,
        is_waitlist: true,
        status: 'WAITLIST',
        error: 'This student is on WAITLIST. Pass cannot be checked in until officially confirmed.',
        message: 'Student is on WAITLIST. Pass cannot be checked in until officially confirmed.',
        registration: {
          full_name: registration.name,
          name: registration.name,
          registration_id: registration.registration_id,
          phone: registration.phone,
          status: 'WAITLIST'
        },
        event: {
          title: event.name || event.title || 'Event',
          name: event.name || event.title || 'Event'
        }
      });
    // 2.5 Attendance Closed Inspection
    const isOverride = Boolean(
      req.body?.admin_confirmed ||
      req.body?.confirmed_by_admin ||
      req.body?.override_duplicate ||
      req.query?.admin_confirmed
    );

    const isAttendanceClosed = Boolean(
      event.is_attendance_closed ||
      event.status === 'COMPLETED' ||
      req.body?.is_attendance_closed
    );

    if (isAttendanceClosed && !isOverride) {
      return res.status(200).json({
        success: false,
        attendance_closed: true,
        error: 'Attendance for this event has been CLOSED by admin.',
        message: `ATTENDANCE CLOSED: Check-ins for "${event.name || event.title || 'this event'}" have been closed. No further check-ins permitted.`,
        registration: {
          full_name: registration.name,
          name: registration.name,
          registration_id: registration.registration_id,
          phone: registration.phone
        },
        event: {
          title: event.name || event.title || 'Event',
          name: event.name || event.title || 'Event'
        }
      });
    }

    // 3. Duplicate Check-in Inspection
    let existingAttendance = null;
    if (supabase) {
      const { data: att } = await supabase
        .from('attendance')
        .select('*')
        .eq('registration_id', registration.registration_id)
        .eq('event_id', event.id)
        .maybeSingle();

      existingAttendance = att;
    } else {
      existingAttendance = (FALLBACK_STORE.attendance || []).find(
        a => a.registration_id === registration.registration_id && a.event_id === event.id
      );
    }

    // If duplicate check-in and not overridden by admin -> Return Duplicate Alert
    if (existingAttendance && !isOverride) {
      return res.status(200).json({
        success: false,
        duplicate_checkin: true,
        already_checked_in: true,
        message: `DUPLICATE CHECK-IN: Attendee ${registration.name} was ALREADY checked in!`,
        previous_check_in: existingAttendance.check_in_time,
        existing_checkin: {
          checked_in_at: existingAttendance.check_in_time || existingAttendance.created_at || new Date().toISOString(),
          checked_in_by: existingAttendance.checked_in_by || 'Admin QR Scanner'
        },
        registration: {
          full_name: registration.name,
          name: registration.name,
          section: registration.section,
          phone: registration.phone,
          email: registration.email,
          year: registration.year,
          status: registration.status,
          registration_id: registration.registration_id,
          slot_number: 1
        },
        event: {
          title: event.name || event.title || 'Event',
          name: event.name || event.title || 'Event',
          date: event.date,
          venue: event.venue
        }
      });
    }

    // 4. Commit / Record Attendance (Fresh or Admin Override)
    const checkInRecord = {
      event_id: event.id,
      registration_id: registration.registration_id,
      student_name: registration.name,
      email: registration.email || '',
      check_in_time: new Date().toISOString(),
      status: 'PRESENT',
      checked_in_by: req.body?.checked_in_by || (isOverride ? 'Admin QR Scanner (Re-Admit)' : 'Admin QR Scanner'),
      created_at: new Date().toISOString()
    };

    if (supabase) {
      if (existingAttendance) {
        // Update existing record for override
        const updatePayload = {
          check_in_time: checkInRecord.check_in_time,
          checked_in_by: checkInRecord.checked_in_by,
          email: checkInRecord.email
        };
        const { error: updErr } = await supabase
          .from('attendance')
          .update(updatePayload)
          .eq('id', existingAttendance.id);

        if (updErr && updErr.message && updErr.message.includes('email')) {
          delete updatePayload.email;
          await supabase.from('attendance').update(updatePayload).eq('id', existingAttendance.id);
        }
      } else {
        // Insert new attendance record
        const insertPayload = { ...checkInRecord };
        const { error: insErr } = await supabase
          .from('attendance')
          .insert([insertPayload]);

        if (insErr) {
          if (insErr.message && insErr.message.includes('email')) {
            // column email does not exist yet -> retry without email so scanner never breaks
            delete insertPayload.email;
            const { error: retryErr } = await supabase.from('attendance').insert([insertPayload]);
            if (retryErr && retryErr.code !== '23505') {
              console.error('Supabase Attendance Insert Retry Error:', retryErr);
              throw retryErr;
            }
          } else if (insErr.code !== '23505') {
            console.error('Supabase Attendance Insert Error:', insErr);
            throw insErr;
          }
        }
      }
    } else {
      checkInRecord.id = `att-${Date.now()}`;
      FALLBACK_STORE.attendance = (FALLBACK_STORE.attendance || []).filter(
        a => !(a.registration_id === registration.registration_id && a.event_id === event.id)
      );
      FALLBACK_STORE.attendance.push(checkInRecord);
    }

    // 5. Return Successful Check-In Confirmation
    return res.status(200).json({
      success: true,
      check_in_success: true,
      valid: true,
      message: `Student ${registration.name} successfully checked in as PRESENT!`,
      registration: {
        full_name: registration.name,
        name: registration.name,
        section: registration.section,
        phone: registration.phone,
        email: registration.email,
        year: registration.year,
        status: registration.status,
        registration_id: registration.registration_id,
        slot_number: 1
      },
      event: {
        title: event.name || event.title || 'Event',
        name: event.name || event.title || 'Event',
        date: event.date,
        start_time: event.start_time,
        venue: event.venue
      },
      attendance: checkInRecord
    });
  } catch (err) {
    console.error('Verify Pass API Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Pass verification failed. Please try again.',
      message: 'Pass verification failed. Please try again.'
    });
  }
};
