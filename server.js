/**
 * Local Development API Server
 * ─────────────────────────────
 * Demonstrates SELECT and INSERT queries against the local SQLite database.
 *
 * Start with:  npm run dev
 *
 * Endpoints:
 *   GET    /api/users      → list all users
 *   GET    /api/users/:id  → get a single user by ID
 *   POST   /api/users      → create a new user  { name, email }
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.development') });

const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────

/**
 * GET /api/users
 * Returns all users ordered by most recent first.
 */
app.get('/api/users', (_req, res) => {
    try {
        const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/users/:id
 * Returns a single user by ID.
 */
app.get('/api/users/:id', (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/users
 * Creates a new user. Expects JSON body: { name: string, email: string }
 */
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, error: 'Both "name" and "email" are required.' });
    }

    try {
        const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        const result = stmt.run(name, email);

        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        // UNIQUE constraint violation → duplicate email
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ success: false, error: `Email "${email}" is already registered.` });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Server Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀  Local API server running at http://localhost:${PORT}`);
    console.log(`    GET   http://localhost:${PORT}/api/users`);
    console.log(`    POST  http://localhost:${PORT}/api/users`);
    console.log(`    GET   http://localhost:${PORT}/api/users/:id\n`);
});
