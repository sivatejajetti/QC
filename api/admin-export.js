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
  const { type, event_id } = req.query; // 'registrations', 'waitlist', 'attendance', 'full'

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
    // 2. ATTENDANCE CSV
    // -------------------------------------------------------------------------
    if (type === 'attendance') {
      let attList = [];

      if (supabase) {
        let query = supabase
          .from('attendance')
          .select('*, events (name, date, venue), registrations (email, phone)')
          .order('check_in_time', { ascending: true });

        if (event_id) query = query.eq('event_id', event_id);

        const { data, error } = await query;
        if (error) {
          // If relationship is not set in postgrest cache, fall back to simple select
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
