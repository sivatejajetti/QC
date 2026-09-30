/**
 * QUANTUM CODERS // PUBLIC CLIENT CONFIG API
 * Exposes safe public Supabase URL and Anon Key from environment variables (e.g. Vercel)
 * to client browsers. Never exposes SUPABASE_SERVICE_ROLE_KEY!
 */

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcmqqdrujmzpalfqtmfu.supabase.co';
  const rawKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_W7h47aHX8yNO4W086M_3-A_zgReVwfG';

  const isConfigured = Boolean(
    rawUrl &&
    !rawUrl.includes('your-supabase-project') &&
    !rawUrl.includes('your-project') &&
    rawKey &&
    !rawKey.includes('your-public-anon-key') &&
    !rawKey.includes('your-key')
  );

  return res.status(200).json({
    supabaseUrl: isConfigured ? rawUrl : '',
    supabaseAnonKey: isConfigured ? rawKey : '',
    isConfigured
  });
};
