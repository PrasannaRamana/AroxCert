/**
 * Local SQLite Database Connection Module
 * ────────────────────────────────────────
 * Loads config from .env.development (via dotenv) and returns
 * a reusable better-sqlite3 database instance.
 *
 * Usage:
 *   const db = require('./db/database');
 *   const rows = db.prepare('SELECT * FROM users').all();
 */

const path = require('path');
const Database = require('better-sqlite3');

// Load the local-only env file so DB_PATH is available
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.development') });

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './db/local.sqlite');

const db = new Database(DB_PATH, { verbose: console.log });

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

module.exports = db;
