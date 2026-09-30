/**
 * QUANTUM CODERS // PASS VERIFICATION & ATTENDANCE API
 * Vercel Serverless Function: Validates student QR passes and marks attendance.
 * Checks for cancelled passes, waitlist status, and handles duplicate check-in warnings.
 */

const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = getSupabaseAdmin();
  const { qr_payload, confirmed_by_admin, override_duplicate, checked_in_by } = req.body || {};

  if (!qr_payload) {
    return res.status(400).json({ error: 'Missing QR code payload data.' });
  }

  try {
    let parsed = null;
    try {
      parsed = typeof qr_payload === 'string' ? JSON.parse(qr_payload) : qr_payload;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid QR code format. Not an authentic Quantum Coders pass.' });
    }

    const { rid, eid, hash } = parsed;
    if (!rid) {
      return res.status(400).json({ error: 'Invalid pass data: missing Registration ID.' });
    }

    let registration = null;
    let event = null;

    // 1. Fetch Registration and Event
    if (supabase) {
      const { data: reg, error: regErr } = await supabase
        .from('registrations')
        .select('*, events (*)')
        .eq('registration_id', rid)
        .maybeSingle();

      if (regErr || !reg) {
        return res.status(404).json({ error: 'This event pass is invalid. Record not found in cadre registry.' });
      }

      registration = reg;
      event = reg.events;
    } else {
      registration = FALLBACK_STORE.registrations.find((r) => r.registration_id === rid);
      if (!registration) {
        return res.status(404).json({ error: 'This event pass is invalid. Record not found in cadre registry.' });
      }
      event = FALLBACK_STORE.events.find((e) => e.id === registration.event_id);
    }

    if (!event) {
      return res.status(404).json({ error: 'Associated event could not be found.' });
    }

    // 2. Validate Status
    if (registration.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'This event pass has been cancelled.',
        is_cancelled: true,
        registration_id: registration.registration_id,
        student_name: registration.name
      });
    }

    if (registration.status === 'WAITLIST') {
      return res.status(400).json({
        error: 'This student is on WAITLIST. Pass cannot be checked in until officially confirmed.',
        is_waitlist: true,
        registration_id: registration.registration_id,
        student_name: registration.name
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
      existingAttendance = FALLBACK_STORE.attendance.find(
        (a) => a.registration_id === registration.registration_id && a.event_id === event.id
      );
    }

    if (existingAttendance && !override_duplicate) {
      return res.status(200).json({
        already_checked_in: true,
        message: 'Already Checked In',
        previous_check_in: existingAttendance.check_in_time,
        student: {
          name: registration.name,
          section: registration.section,
          phone: registration.phone,
          year: registration.year,
          registration_id: registration.registration_id
        },
        event: {
          name: event.name,
          date: event.date,
          venue: event.venue
        }
      });
    }

    // 4. Admin Verification Stage (Preview vs Commit)
    if (!confirmed_by_admin) {
      // Step 1: Return verified student & event info for Admin to review and click "Confirm Check-in"
      return res.status(200).json({
        valid: true,
        message: 'Pass Verified. Confirm check-in to mark present.',
        student: {
          name: registration.name,
          section: registration.section,
          phone: registration.phone,
          email: registration.email,
          year: registration.year,
          registration_id: registration.registration_id
        },
        event: {
          name: event.name,
          date: event.date,
          start_time: event.start_time,
          venue: event.venue
        }
      });
    }

    // 5. Commit Attendance (Step 2: Admin Confirmed)
    const checkInRecord = {
      event_id: event.id,
      registration_id: registration.registration_id,
      student_name: registration.name,
      check_in_time: new Date().toISOString(),
      status: 'PRESENT',
      checked_in_by: checked_in_by || 'Admin QR Scanner',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      // Upsert attendance record
      const { data, error } = await supabase
        .from('attendance')
        .upsert([checkInRecord], { onConflict: 'event_id, registration_id' })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        check_in_success: true,
        message: `Student ${registration.name} successfully checked in as PRESENT!`,
        attendance: data
      });
    } else {
      checkInRecord.id = `att-${Date.now()}`;
      // Remove previous if overriding
      FALLBACK_STORE.attendance = FALLBACK_STORE.attendance.filter(
        (a) => !(a.registration_id === registration.registration_id && a.event_id === event.id)
      );
      FALLBACK_STORE.attendance.push(checkInRecord);

      return res.status(200).json({
        check_in_success: true,
        message: `Student ${registration.name} successfully checked in as PRESENT!`,
        attendance: checkInRecord
      });
    }
  } catch (err) {
    console.error('Verify Pass API Error:', err);
    return res.status(500).json({ error: 'Pass verification failed. Please try again.' });
  }
};
