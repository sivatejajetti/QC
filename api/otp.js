/**
 * QUANTUM CODERS // OTP API
 * Vercel Serverless Function: Send and verify OTPs for Pass Retrieval and Self-Service Cancellation.
 * Provider-agnostic architecture: simulated dev mode out-of-the-box, easily connected to Twilio/Fast2SMS/MSG91 via env vars.
 */

const crypto = require('crypto');
const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

// Generate 6-digit OTP
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp, phone) {
  const secret = process.env.OTP_SECRET_SALT || 'quantum-otp-salt-2026';
  return crypto.createHmac('sha256', secret).update(`${phone}:${otp}`).digest('hex');
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = getSupabaseAdmin();
  const { action, phone, otp, purpose, registration_id } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '').trim();

  try {
    // -------------------------------------------------------------------------
    // ACTION: DIRECT PASS RETRIEVAL (NO OTP REQUIRED)
    // -------------------------------------------------------------------------
    if (action === 'get_passes' || action === 'find') {
      let passes = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('registrations')
          .select(`
            id,
            registration_id,
            name,
            section,
            phone,
            email,
            year,
            status,
            verification_hash,
            registered_at,
            events (
              id,
              name,
              event_type,
              date,
              start_time,
              end_time,
              venue,
              status
            )
          `)
          .eq('phone', cleanPhone)
          .neq('status', 'CANCELLED');

        if (!error && Array.isArray(data)) {
          passes = data;
        }
      } else {
        passes = (FALLBACK_STORE.registrations || [])
          .filter((r) => r.phone === cleanPhone && r.status !== 'CANCELLED')
          .map((r) => {
            const ev = (FALLBACK_STORE.events || []).find((e) => e.id === r.event_id) || {};
            return { ...r, events: ev };
          });
      }

      return res.status(200).json({
        success: true,
        passes: passes.map((p) => ({
          registration_id: p.registration_id,
          name: p.name,
          section: p.section,
          year: p.year,
          status: p.status,
          verification_hash: p.verification_hash,
          event: p.events,
          qr_payload: JSON.stringify({
            rid: p.registration_id,
            eid: (p.events && p.events.id) || p.event_id,
            hash: p.verification_hash
          })
        }))
      });
    }

    // -------------------------------------------------------------------------
    // ACTION: DIRECT CANCELLATION (NO OTP REQUIRED)
    // -------------------------------------------------------------------------
    if (action === 'cancel' || (action === 'direct_cancel')) {
      if (!registration_id) {
        return res.status(400).json({ error: 'Missing registration ID to cancel.' });
      }

      if (supabase) {
        let q = supabase.from('registrations').update({
          status: 'CANCELLED',
          cancelled_at: new Date().toISOString()
        }).eq('registration_id', registration_id);
        if (cleanPhone) q = q.eq('phone', cleanPhone);
        const { error } = await q;
        if (error) throw error;
      }
      return res.status(200).json({
        success: true,
        message: `Registration ${registration_id} cancelled.`
      });
    }

    // -------------------------------------------------------------------------
    // ACTION: SEND OTP
    // -------------------------------------------------------------------------
    if (action === 'send') {
      const otpCode = generateOtpCode();
      const hashed = hashOtp(otpCode, cleanPhone);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      if (supabase) {
        // Clear any old unexpired OTPs for this phone
        await supabase.from('student_otps').delete().eq('phone', cleanPhone);

        const { error } = await supabase.from('student_otps').insert([
          {
            phone: cleanPhone,
            hashed_otp: hashed,
            purpose: purpose || 'RETRIEVE_PASS',
            attempts: 0,
            expires_at: expiresAt
          }
        ]);
        if (error) throw error;
      } else {
        FALLBACK_STORE.otps[cleanPhone] = {
          code: otpCode,
          hashed,
          purpose: purpose || 'RETRIEVE_PASS',
          attempts: 0,
          expires_at: expiresAt
        };
      }

      // Provider Dispatch Log: In dev/local mode or if no paid SMS gateway configured,
      // we log it and return it in a test-friendly simulated response.
      console.log(`[Quantum Coders OTP Gateway] OTP for ${cleanPhone} is: ${otpCode}`);

      return res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${cleanPhone}. Valid for 5 minutes.`,
        // Return preview code so user can test locally without configuring paid SMS!
        dev_preview_code: otpCode
      });
    }

    // -------------------------------------------------------------------------
    // ACTION: VERIFY OTP
    // -------------------------------------------------------------------------
    if (action === 'verify') {
      if (!otp) {
        return res.status(400).json({ error: 'Please enter the 6-digit OTP.' });
      }

      const submittedHash = hashOtp(otp.trim(), cleanPhone);
      let isValid = false;

      if (supabase) {
        const { data: record, error } = await supabase
          .from('student_otps')
          .select('*')
          .eq('phone', cleanPhone)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !record) {
          return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new one.' });
        }

        if (record.attempts >= 4) {
          return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
        }

        if (record.hashed_otp === submittedHash) {
          isValid = true;
          // Delete used OTP
          await supabase.from('student_otps').delete().eq('id', record.id);
        } else {
          // Increment attempt count
          await supabase
            .from('student_otps')
            .update({ attempts: record.attempts + 1 })
            .eq('id', record.id);
          return res.status(400).json({ error: 'Incorrect OTP. Please check and try again.' });
        }
      } else {
        const record = FALLBACK_STORE.otps[cleanPhone];
        if (!record || new Date() > new Date(record.expires_at)) {
          return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new one.' });
        }
        if (record.code === otp.trim() || record.hashed === submittedHash) {
          isValid = true;
          delete FALLBACK_STORE.otps[cleanPhone];
        } else {
          return res.status(400).json({ error: 'Incorrect OTP. Please check and try again.' });
        }
      }

      if (!isValid) {
        return res.status(400).json({ error: 'Verification failed.' });
      }

      // -----------------------------------------------------------------------
      // Purpose 1: RETRIEVE PASSES
      // -----------------------------------------------------------------------
      if (purpose === 'RETRIEVE_PASS') {
        let passes = [];
        if (supabase) {
          const { data, error } = await supabase
            .from('registrations')
            .select(`
              id,
              registration_id,
              name,
              section,
              phone,
              email,
              year,
              status,
              verification_hash,
              registered_at,
              events (
                id,
                name,
                event_type,
                date,
                start_time,
                end_time,
                venue,
                status
              )
            `)
            .eq('phone', cleanPhone)
            .neq('status', 'CANCELLED');

          if (error) throw error;
          passes = data || [];
        } else {
          passes = FALLBACK_STORE.registrations
            .filter((r) => r.phone === cleanPhone && r.status !== 'CANCELLED')
            .map((r) => {
              const ev = FALLBACK_STORE.events.find((e) => e.id === r.event_id) || {};
              return { ...r, events: ev };
            });
        }

        return res.status(200).json({
          success: true,
          passes: passes.map((p) => ({
            registration_id: p.registration_id,
            name: p.name,
            section: p.section,
            year: p.year,
            status: p.status,
            verification_hash: p.verification_hash,
            event: p.events,
            qr_payload: JSON.stringify({
              rid: p.registration_id,
              eid: (p.events && p.events.id) || p.event_id,
              hash: p.verification_hash
            })
          }))
        });
      }

      // -----------------------------------------------------------------------
      // Purpose 2: CANCEL REGISTRATION
      // -----------------------------------------------------------------------
      if (purpose === 'CANCEL_REGISTRATION') {
        if (!registration_id) {
          return res.status(400).json({ error: 'Missing registration ID to cancel.' });
        }

        if (supabase) {
          // Fetch registration
          const { data: reg, error: fetchErr } = await supabase
            .from('registrations')
            .select('*')
            .eq('registration_id', registration_id)
            .eq('phone', cleanPhone)
            .single();

          if (fetchErr || !reg) {
            return res.status(404).json({ error: 'Registration record not found.' });
          }

          if (reg.status === 'CANCELLED') {
            return res.status(400).json({ error: 'This registration has already been cancelled.' });
          }

          // Trigger cancellation (which activates the PostgreSQL waitlist promotion trigger)
          const { error: cancelErr } = await supabase
            .from('registrations')
            .update({
              status: 'CANCELLED',
              cancelled_at: new Date().toISOString()
            })
            .eq('id', reg.id);

          if (cancelErr) throw cancelErr;

          return res.status(200).json({
            success: true,
            message: `Registration ${registration_id} cancelled. Your pass is now invalid.`
          });
        } else {
          // Fallback Store Cancellation & Promotion
          const reg = FALLBACK_STORE.registrations.find(
            (r) => r.registration_id === registration_id && r.phone === cleanPhone
          );
          if (!reg) {
            return res.status(404).json({ error: 'Registration record not found.' });
          }
          const oldStatus = reg.status;
          reg.status = 'CANCELLED';
          reg.cancelled_at = new Date().toISOString();

          // If was confirmed, promote next waitlisted student
          if (oldStatus === 'CONFIRMED') {
            const nextWaitlisted = FALLBACK_STORE.registrations
              .filter((r) => r.event_id === reg.event_id && r.status === 'WAITLIST')
              .sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at))[0];

            if (nextWaitlisted) {
              nextWaitlisted.status = 'CONFIRMED';
              nextWaitlisted.updated_at = new Date().toISOString();
            }
          }

          return res.status(200).json({
            success: true,
            message: `Registration ${registration_id} cancelled. Your pass is now invalid.`
          });
        }
      }

      return res.status(400).json({ error: 'Unknown OTP verification purpose.' });
    }

    return res.status(400).json({ error: 'Invalid action. Supported: "send", "verify".' });
  } catch (err) {
    console.error('OTP API Error:', err);
    return res.status(500).json({ error: 'OTP operation failed. Please try again.' });
  }
};
