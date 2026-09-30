/**
 * QUANTUM CODERS // ADMIN STATS API
 * Computes live operational telemetry across events, slots, registrations, waitlists, and attendance.
 */

const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    if (supabase) {
      // 1. Events Counts
      const { data: allEvents, error: evErr } = await supabase
        .from('events')
        .select('id, maximum_slots, date, status')
        .is('deleted_at', null);

      if (evErr) throw evErr;

      const totalEvents = allEvents.length;
      const upcomingEvents = allEvents.filter((e) => e.date >= todayStr && e.status !== 'CANCELLED').length;
      const totalCapacity = allEvents.reduce((acc, curr) => acc + (curr.maximum_slots || 0), 0);

      // 2. Registrations Counts
      const { count: totalRegistrations } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'CANCELLED');

      const { count: confirmedCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CONFIRMED');

      const { count: waitlistCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'WAITLIST');

      // 3. Attendance Count
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PRESENT');

      // 4. Club Cadre Students Count
      let studentCadreCount = 0;
      let approvedCadreCount = 0;
      try {
        const { count: totalCadre } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true });
        studentCadreCount = totalCadre || 0;

        const { count: approvedCadre } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');
        approvedCadreCount = approvedCadre || 0;
      } catch (cadreErr) {}

      // 5. Recent Registrations Feed
      const { data: recentRegs } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_id,
          name,
          section,
          phone,
          year,
          status,
          registered_at,
          events (name)
        `)
        .order('registered_at', { ascending: false })
        .limit(8);

      const availableSlots = Math.max(0, totalCapacity - (confirmedCount || 0));

      return res.status(200).json({
        total_events: totalEvents,
        upcoming_events: upcomingEvents,
        total_registrations: totalRegistrations || 0,
        confirmed_registrations: confirmedCount || 0,
        available_slots: availableSlots,
        waitlisted_students: waitlistCount || 0,
        attendance_count: attendanceCount || 0,
        student_cadre: studentCadreCount,
        approved_cadre: approvedCadreCount,
        recent_registrations: (recentRegs || []).map((r) => ({
          ...r,
          event_name: (r.events && r.events.name) || 'Quantum Event'
        }))
      });
    } else {
      // Fallback Store
      const totalEvents = FALLBACK_STORE.events.filter((e) => !e.deleted_at).length;
      const upcomingEvents = FALLBACK_STORE.events.filter((e) => !e.deleted_at && e.date >= todayStr && e.status !== 'CANCELLED').length;
      const totalCapacity = FALLBACK_STORE.events
        .filter((e) => !e.deleted_at)
        .reduce((acc, curr) => acc + (curr.maximum_slots || 0), 0);

      const activeRegs = FALLBACK_STORE.registrations.filter((r) => r.status !== 'CANCELLED');
      const confirmedCount = activeRegs.filter((r) => r.status === 'CONFIRMED').length;
      const waitlistCount = activeRegs.filter((r) => r.status === 'WAITLIST').length;
      const attendanceCount = FALLBACK_STORE.attendance.filter((a) => a.status === 'PRESENT').length;

      const recentRegs = [...FALLBACK_STORE.registrations]
        .sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))
        .slice(0, 8)
        .map((r) => {
          const ev = FALLBACK_STORE.events.find((e) => e.id === r.event_id) || {};
          return { ...r, event_name: ev.name || 'Quantum Event' };
        });

      const studentCadreCount = (FALLBACK_STORE.club_members || []).length;
      const approvedCadreCount = (FALLBACK_STORE.club_members || []).filter(s => s.status === 'approved').length;

      return res.status(200).json({
        total_events: totalEvents,
        upcoming_events: upcomingEvents,
        total_registrations: activeRegs.length,
        confirmed_registrations: confirmedCount,
        available_slots: Math.max(0, totalCapacity - confirmedCount),
        waitlisted_students: waitlistCount,
        attendance_count: attendanceCount,
        student_cadre: studentCadreCount,
        approved_cadre: approvedCadreCount,
        recent_registrations: recentRegs
      });
    }
  } catch (err) {
    console.error('Admin Stats API Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve telemetry stats.' });
  }
};
