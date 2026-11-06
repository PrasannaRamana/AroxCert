const { sql } = require('@vercel/postgres');

/**
 * Vercel Serverless Function — /api/users/:id
 *
 * GET → Fetch a single user by ID
 */
module.exports = async function handler(req, res) {
    // ── CORS headers ─────────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('API /api/users/[id] error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
