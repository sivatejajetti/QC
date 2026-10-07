/**
 * QUANTUM CODERS // ADMIN CSV EXPORT API
 * Streams sanitized CSV files for Registrations, Waitlists, Attendance, and Complete Event Reports.
 */

const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();
  const type = req.query.type;
  const event_id = req.query.event_id || req.query.eventId; // 'registrations', 'waitlist', 'attendance', 'full'

  try {
    let filename = `quantum-coders-${type || 'export'}-${Date.now()}.csv`;
    let headers = [];
    let rows = [];

    // -------------------------------------------------------------------------
    // 0. CLUB CADRE STUDENTS CSV
    // -------------------------------------------------------------------------
    if (type === 'cadre' || type === 'students' || type === 'club_members') {
      let cadreList = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('club_members')
          .select('*')
          .order('applied_at', { ascending: false });
        if (error) throw error;
        cadreList = data || [];
      } else {
        cadreList = FALLBACK_STORE.club_members || [];
      }

      headers = [
        'Application Ref',
        'Member ID',
        'Full Name',
        'Email',
        'Phone',
        'College',
        'Year',
        'Branch',
        'Domain Interest',
        'Status',
        'Applied Date',
        'Statement'
      ];

      rows = cadreList.map(s => [
        s.id,
        s.member_id || '',
        s.full_name || '',
        s.email || '',
        s.phone || '',
        s.college || '',
        s.year || '',
        s.branch || '',
        s.interest || '',
        s.status || 'pending',
        s.applied_at || '',
        s.statement || ''
      ]);
    }

    // -------------------------------------------------------------------------
    // 1. REGISTRATIONS & WAITLIST CSV
    // -------------------------------------------------------------------------
    else if (type === 'registrations' || type === 'waitlist' || type === 'full') {
      let regList = [];

      if (supabase) {
        let query = supabase
          .from('registrations')
          .select('*, events (name, date, venue)')
          .order('registered_at', { ascending: true });

        if (event_id) query = query.eq('event_id', event_id);
        if (type === 'waitlist') query = query.eq('status', 'WAITLIST');
        if (type === 'registrations') query = query.neq('status', 'CANCELLED');

        const { data, error } = await query;
        if (error) throw error;
        regList = data || [];
      } else {
        regList = FALLBACK_STORE.registrations
          .filter((r) => {
            if (event_id && r.event_id !== event_id) return false;
            if (type === 'waitlist') return r.status === 'WAITLIST';
            if (type === 'registrations') return r.status !== 'CANCELLED';
            return true;
          })
          .map((r) => {
            const ev = FALLBACK_STORE.events.find((e) => e.id === r.event_id) || {};
            return { ...r, events: ev };
          });
      }

      headers = [
        'Registration ID',
        'Student Name',
        'Section',
        'Year',
        'Phone',
        'Email',
        'Status',
        'Event Name',
        'Event Date',
        'Venue',
        'Registered At'
      ];

      rows = regList.map((r) => [
        r.registration_id,
        r.name,
        r.section,
        r.year,
        r.phone,
        r.email,
        r.status,
        (r.events && r.events.name) || '',
        (r.events && r.events.date) || '',
        (r.events && r.events.venue) || '',
        r.registered_at
      ]);
    }

    // -------------------------------------------------------------------------
    // 2. ATTENDANCE CSV (SUPPORTS PRESENT ONLY, ABSENT ONLY, OR ALL)
    // -------------------------------------------------------------------------
    if (type === 'attendance') {
      let attList = [];
      const filterStatus = (req.query.status || req.query.att_status || '').toUpperCase(); // 'PRESENT', 'ABSENT', or empty

      if (filterStatus === 'ABSENT') {
        // Build list of confirmed registrations who DID NOT check in
        if (supabase) {
          let regQuery = supabase
            .from('registrations')
            .select('*, events (name, date, venue)')
            .eq('status', 'CONFIRMED');
          if (event_id) regQuery = regQuery.eq('event_id', event_id);
          const { data: regData } = await regQuery;

          let attQuery = supabase.from('attendance').select('registration_id');
          if (event_id) attQuery = attQuery.eq('event_id', event_id);
          const { data: attData } = await attQuery;

          const checkedInRids = new Set((attData || []).map((a) => a.registration_id));
          attList = (regData || [])
            .filter((r) => !checkedInRids.has(r.registration_id))
            .map((r) => ({
              registration_id: r.registration_id,
              student_name: r.name,
              email: r.email,
              phone: r.phone,
              check_in_time: '—',
              status: 'ABSENT',
              checked_in_by: 'NONE',
              events: r.events
            }));
        } else {
          const checkedInRids = new Set((FALLBACK_STORE.attendance || []).map((a) => a.registration_id));
          attList = (FALLBACK_STORE.registrations || [])
            .filter((r) => r.status === 'CONFIRMED' && (!event_id || r.event_id === event_id) && !checkedInRids.has(r.registration_id))
            .map((r) => {
              const ev = (FALLBACK_STORE.events || []).find((e) => e.id === r.event_id) || {};
              return {
                registration_id: r.registration_id,
                student_name: r.name,
                email: r.email,
                phone: r.phone,
                check_in_time: '—',
                status: 'ABSENT',
                checked_in_by: 'NONE',
                events: ev
              };
            });
        }
      } else {
        // PRESENT or ALL
        if (supabase) {
          let query = supabase
            .from('attendance')
            .select('*, events (name, date, venue), registrations (email, phone)')
            .order('check_in_time', { ascending: true });

          if (event_id) query = query.eq('event_id', event_id);

          const { data, error } = await query;
          if (error) {
            let fallbackQ = supabase
              .from('attendance')
              .select('*, events (name, date, venue)')
              .order('check_in_time', { ascending: true });
            if (event_id) fallbackQ = fallbackQ.eq('event_id', event_id);
            const { data: fbData } = await fallbackQ;
            attList = fbData || [];
          } else {
            attList = data || [];
          }
        } else {
          attList = FALLBACK_STORE.attendance
            .filter((a) => !event_id || a.event_id === event_id)
            .map((a) => {
              const ev = FALLBACK_STORE.events.find((e) => e.id === a.event_id) || {};
              const reg = (FALLBACK_STORE.registrations || []).find((r) => r.registration_id === a.registration_id) || {};
              return { ...a, events: ev, registrations: reg };
            });
        }

        if (filterStatus === 'PRESENT') {
          attList = attList.filter((a) => a.status === 'PRESENT');
        }
      }

      headers = [
        'Registration ID',
        'Student Name',
        'Email',
        'Phone',
        'Check-In Time',
        'Status',
        'Checked In By',
        'Event Name',
        'Event Date',
        'Venue'
      ];

      rows = attList.map((a) => [
        a.registration_id,
        a.student_name,
        a.email || (a.registrations && a.registrations.email) || '',
        a.phone || (a.registrations && a.registrations.phone) || '',
        a.check_in_time,
        a.status,
        a.checked_in_by,
        (a.events && a.events.name) || '',
        (a.events && a.events.date) || '',
        (a.events && a.events.venue) || ''
      ]);
    }

    // Build CSV Content
    const csvLines = [
      headers.map(sanitizeCsvValue).join(','),
      ...rows.map((row) => row.map(sanitizeCsvValue).join(','))
    ];
    const csvContent = csvLines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Admin Export Error:', err);
    return res.status(500).json({ error: 'Failed to generate export file.' });
  }
};
