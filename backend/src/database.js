// ─── database.js ─────────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This file sets up and connects to our Turso database.
//
// WHAT IS TURSO?
// Turso is a free cloud database service based on SQLite.
// Instead of a local file on your hard drive, the database lives on Turso's
// servers on the internet — so your data is safe even if you redeploy.
//
// HOW IT DIFFERS FROM BEFORE:
// Old: node:sqlite (local file, data lost on redeploy)
// New: @libsql/client (cloud database, data persists forever)
//
// IMPORTANT: Turso is ASYNC — meaning database operations return a "Promise"
// (a result that arrives later). We use async/await to handle this.
// The old node:sqlite was SYNC — it returned results immediately.
//
// SETUP:
// You need two environment variables in your .env file:
//   TURSO_DATABASE_URL  = your Turso database URL (libsql://...)
//   TURSO_AUTH_TOKEN    = your Turso auth token
//
// ─────────────────────────────────────────────────────────────────────────────

// Load configuration from .env file
require('dotenv').config();

// Import the Turso/libSQL client library
// This was installed with: npm install @libsql/client
const { createClient } = require('@libsql/client');

// ─── CREATE THE TURSO DATABASE CLIENT ────────────────────────────────────────
//
// createClient() connects to the remote Turso database using:
//   url   = the address of your Turso database
//   authToken = a secret password to authenticate your connection
//
// These values come from your .env file (environment variables).
// NEVER hardcode these values directly in code — keep them in .env!
//
const db = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ─── CREATE THE TABLE IF IT DOESN'T EXIST ────────────────────────────────────
//
// This function runs once when the server starts.
// It creates the "activity_logs" table if it doesn't already exist.
//
// The table looks like a spreadsheet:
//
//   id  |    date    | activity | created_at
//   ----|------------|----------|--------------------
//    1  | 2024-01-15 | shampoo  | 2024-01-15 08:30:00
//    2  | 2024-01-18 | shampoo  | 2024-01-18 07:15:00
//
// UNIQUE(date, activity) = prevent duplicate entries for the same day
//
async function initializeDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,
      activity    TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now')),
      UNIQUE(date, activity)
    )
  `);
  console.log('Database table "activity_logs" is ready.');
}

// Run the initialization immediately when this file is loaded
// initializeDatabase() returns a Promise, so we handle errors with .catch()
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1); // Exit the server if we can't connect to the database
});

// Export the database client so other files can use it
// Other files do: const db = require('./database')
module.exports = db;
