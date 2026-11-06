/**
 * Schema Initialization Script
 * ─────────────────────────────
 * Run with:  node db/init-schema.js
 *
 * Creates the baseline `users` table (idempotent — safe to re-run).
 */

const db = require('./database');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅  Schema initialized — "users" table is ready.');

// Verify the table exists
const tableInfo = db.prepare("PRAGMA table_info('users')").all();
console.table(tableInfo);

db.close();
