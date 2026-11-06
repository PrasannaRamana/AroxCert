const { sql } = require('@vercel/postgres');

/**
 * Vercel Serverless Function — /api/db-setup
 *
 * GET → Creates the `users` table if it doesn't exist (one-time setup).
 *       Safe to call multiple times (idempotent).
 */
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Use GET to run setup' });
    }

    try {
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // Return the table columns as confirmation
        const { rows: columns } = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;

        return res.status(200).json({
            success: true,
            message: 'Table "users" is ready.',
            schema: columns,
        });
    } catch (err) {
        console.error('API /api/db-setup error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
