/**
 * QUANTUM CODERS // WEBSITE SECTIONS TOGGLE API
 * Controls dynamic global visibility of website sections (Home, About, Events, Calendar, Gallery, Team, Achievements, Contact).
 */

const { getSupabaseAdmin, isSupabaseConfigured, FALLBACK_STORE } = require('./_supabase');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();

  try {
    // -------------------------------------------------------------------------
    // GET: Section Status
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      if (supabase) {
        const { data, error } = await supabase.from('website_sections').select('*');
        if (error) throw error;

        const map = {};
        (data || []).forEach((s) => {
          map[s.section_key] = s.enabled;
        });

        return res.status(200).json(map);
      } else {
        return res.status(200).json(FALLBACK_STORE.sections);
      }
    }

    // -------------------------------------------------------------------------
    // POST: Update Section Status (Admin)
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const payload = req.body || {};
      const { section_key, enabled, sections } = payload;

      // Handle Batch Updates { sections: { home: true, ... } }
      if (sections && typeof sections === 'object') {
        const rows = Object.entries(sections).map(([k, v]) => ({
          section_key: k,
          label: k.charAt(0).toUpperCase() + k.slice(1),
          enabled: Boolean(v),
          updated_at: new Date().toISOString()
        }));

        if (supabase) {
          const { error } = await supabase
            .from('website_sections')
            .upsert(rows, { onConflict: 'section_key' });
          if (error) throw error;
        }
        Object.assign(FALLBACK_STORE.sections, sections);
        return res.status(200).json({ success: true, sections });
      }

      // Handle Single Key Update
      if (!section_key || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Missing section_key or enabled boolean.' });
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('website_sections')
          .upsert([{ section_key, enabled, updated_at: new Date().toISOString() }], { onConflict: 'section_key' })
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ success: true, section: data });
      } else {
        FALLBACK_STORE.sections[section_key] = enabled;
        return res.status(200).json({ success: true, section: { section_key, enabled } });
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Sections API Error:', err);
    return res.status(500).json({ error: 'Failed to process sections operation.' });
  }
};
