/**
 * QUANTUM CODERS // CLUB CADRE MEMBERS & STUDENT REGISTRATIONS API
 * Vercel Serverless Function: GET, POST, PUT, DELETE for club student registrations & admin approvals.
 * Persists everything directly to Supabase `public.club_members` table online.
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
    // GET: Retrieve Club Member Registrations or Status Lookup
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      const { id, query: searchQuery, status } = req.query;

      if (supabase) {
        let q = supabase
          .from('club_members')
          .select('*')
          .order('applied_at', { ascending: false });

        if (id) {
          q = q.or(`id.eq.${id},member_id.eq.${id}`);
          const { data, error } = await q.maybeSingle();
          if (error) throw error;
          if (!data) return res.status(404).json({ error: 'Application not found' });
          return res.status(200).json(normalizeStudent(data));
        }

        if (searchQuery) {
          const val = searchQuery.trim();
          q = q.or(`id.ilike.%${val}%,member_id.ilike.%${val}%,full_name.ilike.%${val}%,email.ilike.%${val}%,phone.ilike.%${val}%`);
        }

        if (status && status !== 'all') {
          q = q.eq('status', status.toLowerCase());
        }

        const { data, error } = await q;
        if (error) {
          console.warn('[Students API] Supabase query warning, falling back to local store:', error.message);
          return res.status(200).json((FALLBACK_STORE.club_members || []).map(normalizeStudent));
        }

        return res.status(200).json((data || []).map(normalizeStudent));
      } else {
        // Fallback Store
        let list = FALLBACK_STORE.club_members || [];

        if (id) {
          const found = list.find(s => s.id === id || s.member_id === id);
          if (!found) return res.status(404).json({ error: 'Application not found' });
          return res.status(200).json(normalizeStudent(found));
        }

        if (searchQuery) {
          const val = searchQuery.toLowerCase().trim();
          list = list.filter(s =>
            (s.id && s.id.toLowerCase().includes(val)) ||
            (s.member_id && s.member_id.toLowerCase().includes(val)) ||
            (s.full_name && s.full_name.toLowerCase().includes(val)) ||
            (s.email && s.email.toLowerCase().includes(val)) ||
            (s.phone && s.phone.includes(val))
          );
        }

        if (status && status !== 'all') {
          list = list.filter(s => s.status === status.toLowerCase());
        }

        return res.status(200).json(list.map(normalizeStudent));
      }
    }

    // -------------------------------------------------------------------------
    // POST: Submit New Student Club Registration
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const payload = req.body || {};
      const fullName = (payload.fullName || payload.full_name || payload.name || '').trim().toUpperCase();
      const email = (payload.email || '').trim().toLowerCase();
      const phone = (payload.phone || '').trim();
      const college = (payload.college || 'Pydah College of Engineering').trim();
      const year = (payload.year || '3rd Year').trim();
      const branch = (payload.branch || '').trim();
      const interest = (payload.interest || 'ENGINEERING').trim();
      const statement = (payload.statement || '').trim();

      if (!fullName || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone number are required.' });
      }

      // Generate unique Application ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const appId = payload.id || `APP-2026-${randomSuffix}`;

      const newStudentRow = {
        id: appId,
        member_id: null,
        full_name: fullName,
        email,
        phone,
        college,
        year,
        branch,
        interest,
        statement,
        status: 'pending',
        applied_at: new Date().toISOString(),
        reviewed_at: null
      };

      if (supabase) {
        const { data, error } = await supabase
          .from('club_members')
          .insert([newStudentRow])
          .select()
          .single();

        if (error) {
          console.warn('[Students API] Supabase insert failed, caching in fallback store:', error.message);
          FALLBACK_STORE.club_members.unshift(newStudentRow);
          return res.status(201).json(normalizeStudent(newStudentRow));
        }

        return res.status(201).json(normalizeStudent(data));
      } else {
        FALLBACK_STORE.club_members.unshift(newStudentRow);
        return res.status(201).json(normalizeStudent(newStudentRow));
      }
    }

    // -------------------------------------------------------------------------
    // PUT: Update Student Application Status (Admin Approval / Rejection / Revoke)
    // -------------------------------------------------------------------------
    if (req.method === 'PUT') {
      const payload = req.body || {};
      const { id, status, memberId, member_id } = payload;

      if (!id || !status) {
        return res.status(400).json({ error: 'Student Application ID and status are required.' });
      }

      const assignedStatus = status.toLowerCase(); // 'approved', 'rejected', 'pending'
      let finalMemberId = memberId || member_id || null;

      if (assignedStatus === 'approved' && !finalMemberId) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalMemberId = `QC-2026-${randomSuffix}`;
      } else if (assignedStatus === 'pending' || assignedStatus === 'rejected') {
        if (!payload.preserveMemberId) {
          finalMemberId = null;
        }
      }

      const updates = {
        status: assignedStatus,
        member_id: finalMemberId,
        reviewed_at: assignedStatus === 'pending' ? null : new Date().toISOString()
      };

      if (supabase) {
        const { data, error } = await supabase
          .from('club_members')
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          console.warn('[Students API] Supabase update failed:', error.message);
          const localItem = (FALLBACK_STORE.club_members || []).find(s => s.id === id);
          if (localItem) {
            Object.assign(localItem, updates);
            return res.status(200).json(normalizeStudent(localItem));
          }
          throw error;
        }

        if (!data) {
          // If not found in DB, check fallback
          const localItem = (FALLBACK_STORE.club_members || []).find(s => s.id === id);
          if (localItem) {
            Object.assign(localItem, updates);
            return res.status(200).json(normalizeStudent(localItem));
          }
          return res.status(404).json({ error: 'Student record not found.' });
        }

        return res.status(200).json(normalizeStudent(data));
      } else {
        const localItem = (FALLBACK_STORE.club_members || []).find(s => s.id === id);
        if (!localItem) return res.status(404).json({ error: 'Student record not found in store.' });

        Object.assign(localItem, updates);
        return res.status(200).json(normalizeStudent(localItem));
      }
    }

    // -------------------------------------------------------------------------
    // DELETE: Delete Student Registration (Admin)
    // -------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Missing student ID to delete.' });
      }

      if (supabase) {
        const { error } = await supabase
          .from('club_members')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      // Also clean fallback store
      FALLBACK_STORE.club_members = (FALLBACK_STORE.club_members || []).filter(s => s.id !== id);
      return res.status(200).json({ success: true, message: `Application ${id} deleted.` });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Students API Error:', err);
    return res.status(500).json({ error: 'Failed to process student request.', details: err.message });
  }
};

// Normalize fields so frontend can consume either camelCase or snake_case
function normalizeStudent(row) {
  if (!row) return null;
  return {
    id: row.id,
    memberId: row.member_id || row.memberId || null,
    member_id: row.member_id || row.memberId || null,
    fullName: row.full_name || row.fullName || '',
    full_name: row.full_name || row.fullName || '',
    email: row.email || '',
    phone: row.phone || '',
    college: row.college || 'Pydah College of Engineering',
    year: row.year || '3rd Year',
    branch: row.branch || '',
    interest: row.interest || 'ENGINEERING',
    statement: row.statement || '',
    status: (row.status || 'pending').toLowerCase(),
    appliedAt: row.applied_at ? new Date(row.applied_at).getTime() : Date.now(),
    applied_at: row.applied_at || new Date().toISOString(),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).getTime() : null,
    reviewed_at: row.reviewed_at || null
  };
}
