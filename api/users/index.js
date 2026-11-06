const { sql } = require('@vercel/postgres');

/**
 * Vercel Serverless Function — /api/users
 *
 * GET  → List all users (SELECT)
 * POST → Create a new user (INSERT)
 */
module.exports = async function handler(req, res) {
    // ── CORS headers ─────────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // ── GET: list all users ──────────────────────────────────────
        if (req.method === 'GET') {
            const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`;
            return res.status(200).json({ success: true, count: rows.length, data: rows });
        }

        // ── POST: create a user ──────────────────────────────────────
        if (req.method === 'POST') {
            const { name, email } = req.body;

            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    error: 'Both "name" and "email" are required.',
                });
            }

            try {
                const { rows } = await sql`
          INSERT INTO users (name, email)
          VALUES (${name}, ${email})
          RETURNING *`;
                return res.status(201).json({ success: true, data: rows[0] });
            } catch (insertErr) {
                if (insertErr.message.includes('unique') || insertErr.message.includes('duplicate')) {
                    return res.status(409).json({
                        success: false,
                        error: `Email "${email}" is already registered.`,
                    });
                }
                throw insertErr;
            }
        }

        // ── Unsupported method ───────────────────────────────────────
        res.setHeader('Allow', 'GET, POST, OPTIONS');
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (err) {
        console.error('API /api/users error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
