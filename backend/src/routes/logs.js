// ─── routes/logs.js ──────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This file defines the API "routes" (URLs/endpoints) for activity logs.
// An API is a set of addresses (URLs) that the frontend can send requests to.
//
// ROUTES DEFINED HERE:
//   GET    /api/logs                       → Get all logs
//   POST   /api/logs                       → Add a new log
//   DELETE /api/logs                       → Delete ALL logs
//   DELETE /api/logs/:date/:activity       → Delete one specific log
//   GET    /api/logs/stats/month?year&month → Monthly statistics
//
// HTTP METHODS:
//   GET    = "give me data" (reading)
//   POST   = "save new data" (creating)
//   DELETE = "remove data" (deleting)
//
// NOTE ABOUT node:sqlite:
// Node.js v22+ has a built-in SQLite module (node:sqlite).
// Its StatementSync methods return BigInt numbers (e.g., 0n instead of 0).
// We convert them with Number() where needed.
//
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const db      = require('../database');

// ─── HELPER: VALIDATE DATE FORMAT ────────────────────────────────────────────
// Checks if a string is a valid date in "YYYY-MM-DD" format.
function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  // Regular expression: exactly 4 digits, dash, 2 digits, dash, 2 digits
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  // Also verify it's an actually valid calendar date
  const d = new Date(dateStr + 'T12:00:00');
  return !isNaN(d.getTime());
}

// ─── ROUTE 1: GET ALL LOGS ────────────────────────────────────────────────────
// GET /api/logs
// Returns all activity logs, newest first.
router.get('/', function(req, res) {
  try {
    // SQL: SELECT all rows from activity_logs, sorted by date descending (newest first)
    const logs = db.prepare(`
      SELECT id, date, activity, created_at
      FROM activity_logs
      ORDER BY date DESC
    `).all();

    // Convert any BigInt id values to regular numbers for JSON serialization
    // (JSON.stringify can't handle BigInt natively)
    const safeLogs = logs.map(log => ({
      ...log,
      id: Number(log.id),
    }));

    res.status(200).json({ success: true, data: safeLogs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
  }
});

// ─── ROUTE 2: ADD A NEW LOG ───────────────────────────────────────────────────
// POST /api/logs
// Body: { "date": "2024-01-15", "activity": "shampoo" }
// If a log already exists for that date+activity, returns the existing one.
router.post('/', function(req, res) {
  try {
    const { date, activity } = req.body;

    // Validate required fields
    if (!date || !activity) {
      return res.status(400).json({
        success: false,
        error: 'Both "date" and "activity" fields are required'
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD (e.g., "2024-01-15")'
      });
    }

    if (typeof activity !== 'string' || activity.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Activity must be a non-empty string'
      });
    }

    const cleanActivity = activity.trim().toLowerCase();

    // INSERT OR IGNORE: insert the row, but silently skip if date+activity already exists
    // The "?" are placeholders filled with our values (prevents SQL injection attacks)
    const stmt   = db.prepare('INSERT OR IGNORE INTO activity_logs (date, activity) VALUES (?, ?)');
    const result = stmt.run(date, cleanActivity);

    // result.changes is a BigInt in node:sqlite → convert to Number
    if (Number(result.changes) === 0) {
      // Log already existed — find and return the existing row
      const existing = db.prepare(
        'SELECT id, date, activity, created_at FROM activity_logs WHERE date = ? AND activity = ?'
      ).get(date, cleanActivity);

      return res.status(200).json({
        success: true,
        message: 'Log already exists for this date and activity',
        data: { ...existing, id: Number(existing.id) }
      });
    }

    // Get the newly created row using the auto-generated ID
    // result.lastInsertRowid is a BigInt in node:sqlite
    const newLog = db.prepare(
      'SELECT id, date, activity, created_at FROM activity_logs WHERE id = ?'
    ).get(Number(result.lastInsertRowid));

    res.status(201).json({
      success: true,
      data: { ...newLog, id: Number(newLog.id) }
    });
  } catch (error) {
    console.error('Error adding log:', error);
    res.status(500).json({ success: false, error: 'Failed to add activity log' });
  }
});

// ─── ROUTE 3: DELETE A SPECIFIC LOG ──────────────────────────────────────────
// DELETE /api/logs/:date/:activity
// Example: DELETE /api/logs/2024-01-15/shampoo
// The :date and :activity are URL parameters filled in with real values.
router.delete('/:date/:activity', function(req, res) {
  try {
    const { date, activity } = req.params;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const result = db.prepare(
      'DELETE FROM activity_logs WHERE date = ? AND activity = ?'
    ).run(date, activity.toLowerCase());

    if (Number(result.changes) === 0) {
      return res.status(404).json({
        success: false,
        error: 'No log found for the given date and activity'
      });
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${activity} log for ${date}`
    });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ success: false, error: 'Failed to delete activity log' });
  }
});

// ─── ROUTE 4: DELETE ALL LOGS ─────────────────────────────────────────────────
// DELETE /api/logs
// Deletes every single row from the table (used by "Clear All Data" in Settings).
router.delete('/', function(req, res) {
  try {
    const result = db.prepare('DELETE FROM activity_logs').run();
    res.status(200).json({
      success: true,
      message: `Deleted all ${Number(result.changes)} activity logs`
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ success: false, error: 'Failed to clear activity logs' });
  }
});

// ─── ROUTE 5: GET MONTHLY STATS ──────────────────────────────────────────────
// GET /api/logs/stats/month?year=2024&month=1
// Returns: { totalWashes: 5, avgFrequencyDays: 3 }
//
// Query parameters (the ?year=...&month=... part of the URL):
//   year  = which year (e.g., 2024). Defaults to current year if not provided.
//   month = which month 1-12. Defaults to current month if not provided.
//
router.get('/stats/month', function(req, res) {
  try {
    const now   = new Date();
    const year  = parseInt(req.query.year)  || now.getFullYear();
    const month = parseInt(req.query.month) || (now.getMonth() + 1); // getMonth() is 0-based

    // Build date range for the month
    const monthStr  = String(month).padStart(2, '0');  // e.g., "01", "12"
    const startDate = `${year}-${monthStr}-01`;
    const endDate   = `${year}-${monthStr}-31`;  // Safe: SQLite date comparison handles this

    // Get all shampoo logs for this month, oldest first (for gap calculation)
    const monthLogs = db.prepare(`
      SELECT date FROM activity_logs
      WHERE activity = 'shampoo'
        AND date >= ? AND date <= ?
      ORDER BY date ASC
    `).all(startDate, endDate);

    const totalWashes = monthLogs.length;

    // Calculate average days between washes
    // Example: washes on 1st, 4th, 10th → gaps are 3 and 6 → average = 4.5 → rounded to 5
    let avgFrequencyDays = null;

    if (totalWashes >= 2) {
      const gaps = [];
      for (let i = 1; i < monthLogs.length; i++) {
        const prev = new Date(monthLogs[i - 1].date + 'T12:00:00');
        const curr = new Date(monthLogs[i].date     + 'T12:00:00');
        // Divide millisecond difference by ms-per-day
        gaps.push((curr - prev) / (1000 * 60 * 60 * 24));
      }
      // Average = sum / count
      const sum = gaps.reduce((acc, gap) => acc + gap, 0);
      avgFrequencyDays = Math.round(sum / gaps.length);
    }

    res.status(200).json({
      success: true,
      data: { year, month, totalWashes, avgFrequencyDays }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
