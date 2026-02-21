// ─── src/app/api/client.ts ────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This file is the "communication layer" between the frontend and backend.
// All network requests (calls to the backend server) go through this file.
//
// WHY A SEPARATE FILE?
// Instead of scattering fetch() calls all over the code, we put them all here.
// Benefits:
//   1. If the backend URL changes, we only change it in ONE place (here).
//   2. Error handling is consistent everywhere.
//   3. The rest of the code stays clean and readable.
//
// WHAT IS "fetch()"?
// fetch() is a built-in browser function that makes HTTP requests.
// It's how the frontend talks to the backend:
//   fetch('/api/logs')            → asks the backend for all logs
//   fetch('/api/logs', { method: 'POST', body: ... }) → adds a new log
//
// WHAT IS "async/await"?
// Network requests take time (milliseconds to seconds).
// "async" marks a function that does something that takes time.
// "await" pauses execution until the operation finishes, then continues.
// This prevents the app from freezing while waiting for the server.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── API BASE URL ──────────────────────────────────────────────────────────
// "import.meta.env.VITE_API_URL" reads an environment variable.
//
// During development:
//   The Vite proxy forwards /api/* to localhost:3001, so we use "" (empty string)
//   meaning requests go to the same origin: http://localhost:5173/api/...
//   → Vite then proxies to: http://localhost:3001/api/...
//
// In production (deployed on Vercel):
//   We set VITE_API_URL to the Railway backend URL in Vercel's environment settings.
//   Example: VITE_API_URL = "https://shampoo-tracker-backend.railway.app"
//   Then requests go to: https://shampoo-tracker-backend.railway.app/api/...
//
const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
// TypeScript lets us define the "shape" of our data using "interfaces".
// An interface is like a blueprint — it says what fields an object must have.
//
// These mirror what the backend sends back in its JSON responses.

/** One shampoo/activity log entry */
export interface ActivityLog {
  id: number;           // Auto-generated unique number (1, 2, 3, ...)
  date: string;         // Date in "YYYY-MM-DD" format (e.g., "2024-01-15")
  activity: string;     // What was done (e.g., "shampoo")
  created_at: string;   // When this log was saved to the database
}

/** Statistics for one month */
export interface MonthStats {
  year: number;
  month: number;
  totalWashes: number;       // How many times you shampooed this month
  avgFrequencyDays: number | null;  // Average days between washes, or null if < 2 washes
}

// ─── API FUNCTIONS ─────────────────────────────────────────────────────────
// Each function below makes one specific type of request to the backend.

/**
 * GET /api/logs
 * Fetches ALL activity logs from the database.
 * Returns an array of ActivityLog objects, sorted newest-first.
 */
export async function getAllLogs(): Promise<ActivityLog[]> {
  // fetch() sends an HTTP GET request (GET is the default method)
  const response = await fetch(`${API_BASE}/api/logs`);

  // Check if the request was successful.
  // response.ok is true for status codes 200-299, false for errors (400, 500, etc.)
  if (!response.ok) {
    // Throw an error with the HTTP status code so the caller can handle it.
    throw new Error(`Failed to fetch logs: HTTP ${response.status}`);
  }

  // response.json() parses the JSON text the server sent into a JavaScript object.
  // We await it because parsing also takes a tiny bit of time.
  const json = await response.json();

  // The backend wraps data in { success: true, data: [...] }
  // so we return just the data array.
  return json.data as ActivityLog[];
}

/**
 * POST /api/logs
 * Adds a new activity log.
 * @param date - Date in "YYYY-MM-DD" format
 * @param activity - Activity name (e.g., "shampoo")
 * Returns the newly created ActivityLog.
 */
export async function addLog(date: string, activity: string): Promise<ActivityLog> {
  const response = await fetch(`${API_BASE}/api/logs`, {
    method: 'POST',       // This is a POST request (creating new data)
    headers: {
      // Tell the server we're sending JSON data
      'Content-Type': 'application/json',
    },
    // Convert our JavaScript object to a JSON string to send in the request body
    body: JSON.stringify({ date, activity }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to add log: HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.data as ActivityLog;
}

/**
 * DELETE /api/logs/:date/:activity
 * Removes one specific activity log.
 * @param date - Date of the log to delete (e.g., "2024-01-15")
 * @param activity - Activity of the log to delete (e.g., "shampoo")
 */
export async function deleteLog(date: string, activity: string): Promise<void> {
  // encodeURIComponent makes the values safe to put in a URL.
  // For example, if activity was "hair wash", it becomes "hair%20wash" in the URL.
  const response = await fetch(
    `${API_BASE}/api/logs/${encodeURIComponent(date)}/${encodeURIComponent(activity)}`,
    { method: 'DELETE' }
  );

  if (!response.ok && response.status !== 404) {
    // 404 is okay (log didn't exist anyway), but other errors are real problems
    throw new Error(`Failed to delete log: HTTP ${response.status}`);
  }
}

/**
 * DELETE /api/logs
 * Removes ALL activity logs (used by "Clear All Data" in Settings).
 */
export async function clearAllLogs(): Promise<void> {
  const response = await fetch(`${API_BASE}/api/logs`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to clear logs: HTTP ${response.status}`);
  }
}

/**
 * GET /api/logs/stats/month?year=YYYY&month=M
 * Gets statistics for a specific month.
 * @param year  - The year (e.g., 2024)
 * @param month - The month number, 1-12 (e.g., 1 for January)
 */
export async function getMonthStats(year: number, month: number): Promise<MonthStats> {
  // URLSearchParams builds a query string: "year=2024&month=1"
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const response = await fetch(`${API_BASE}/api/logs/stats/month?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.data as MonthStats;
}
