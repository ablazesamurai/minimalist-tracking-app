// ─── database.js ─────────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This file sets up and connects to our SQLite database.
// A database is like a very organized filing cabinet that stores data
// even after the computer is turned off.
//
// WHAT DATABASE DO WE USE?
// We use SQLite — it stores ALL data in a single file on your hard drive.
// The file is called "tracker.db". No separate database server to install!
//
// IMPORTANT: We use Node.js's built-in "node:sqlite" module.
// This comes with Node.js v22+ — no extra installation needed.
// This avoids compilation issues with native SQLite libraries.
//
// ─────────────────────────────────────────────────────────────────────────────

// Load configuration from .env file
require('dotenv').config();

// node:sqlite is built directly into Node.js v22+.
// The "node:" prefix means it's a built-in Node.js module.
const { DatabaseSync } = require('node:sqlite');

// Built-in Node.js modules for working with file paths and file system
const path = require('path');
const fs   = require('fs');

// ─── GET THE DATABASE FILE PATH ───────────────────────────────────────────────
const dbPath = process.env.DATABASE_PATH || './data/tracker.db';

// Convert relative path to absolute path
// __dirname = directory of this file (database.js)
const absoluteDbPath = path.resolve(__dirname, '..', dbPath);

// ─── CREATE DATA FOLDER IF IT DOESN'T EXIST ──────────────────────────────────
const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created database directory: ${dbDir}`);
}

// ─── OPEN (OR CREATE) THE DATABASE FILE ──────────────────────────────────────
// DatabaseSync opens the SQLite file. If it doesn't exist, it's created.
const db = new DatabaseSync(absoluteDbPath);

console.log(`Database connected at: ${absoluteDbPath}`);

// ─── CREATE THE TABLE IF IT DOESN'T EXIST ────────────────────────────────────
//
// SQL (Structured Query Language) is how we talk to databases.
//
// This creates the "activity_logs" table — think of it like a spreadsheet:
//
//   id  |    date    | activity | created_at
//   ----|------------|----------|--------------------
//    1  | 2024-01-15 | shampoo  | 2024-01-15 08:30:00
//    2  | 2024-01-18 | shampoo  | 2024-01-18 07:15:00
//
// IF NOT EXISTS = don't crash if the table already exists
// INTEGER PRIMARY KEY AUTOINCREMENT = auto-counting unique ID (1, 2, 3...)
// TEXT NOT NULL = required text field
// DEFAULT (datetime('now')) = auto-fill with current timestamp
// UNIQUE(date, activity) = prevent duplicate entries for same date + activity
//
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    activity    TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    UNIQUE(date, activity)
  )
`);

console.log('Database table "activity_logs" is ready.');

// Export the database connection so other files can use it
// Other files do: const db = require('./database')
module.exports = db;
