// ─── server.js ────────────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This is the MAIN file of the backend. It's the entry point — the first file
// that runs when you start the server with "npm start" or "npm run dev".
//
// WHAT DOES "BACKEND" MEAN?
// The backend is a program that runs on a computer (a "server") and handles:
//   1. Storing data in a database (so it's not lost when the page refreshes)
//   2. Handling requests from the frontend (the React app on your phone/browser)
//   3. Performing calculations and business logic
//
// HOW IT WORKS:
// 1. This file starts an "Express" web server
// 2. The server listens on a port (like port 3001) for incoming requests
// 3. When the React frontend does something (e.g., "log today's shampoo"),
//    it sends an HTTP request to this server
// 4. This server processes the request, talks to the database, and sends back a response
//
// FLOW DIAGRAM:
//
//   [Your Phone/Browser]
//         │  "I shampooed today! Please save it."
//         │  POST http://your-server.com/api/logs
//         ▼
//   [This Server - server.js]
//         │  "Got it, let me save that..."
//         ▼
//   [routes/logs.js]    ← handles /api/logs routes
//         │
//         ▼
//   [database.js]       ← talks to SQLite database file
//         │
//         ▼
//   [tracker.db file]   ← the actual data saved on disk
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── STEP 1: LOAD REQUIRED LIBRARIES ─────────────────────────────────────────

// Load our .env file so that process.env.PORT etc. are available
require('dotenv').config();

// Express: The web framework that handles incoming HTTP requests
const express = require('express');

// CORS: Allows our frontend (different URL) to talk to this backend
// Without this, the browser would block the connection for security reasons.
const cors = require('cors');

// Load the routes we defined for activity logs
const logsRouter = require('./routes/logs');

// Initialize our database (this runs database.js which creates the table if needed)
// We just do "require" here - the database.js file sets everything up when loaded.
require('./database');

// ─── STEP 2: CREATE THE EXPRESS APP ──────────────────────────────────────────

// Create an Express application. Think of "app" as the main object that
// controls our whole web server.
const app = express();

// ─── STEP 3: SET UP MIDDLEWARE ────────────────────────────────────────────────
//
// "Middleware" are functions that run on EVERY incoming request before
// it reaches our route handlers. Think of them as checkpoints/filters.
//
// ANALOGY: Like security at an airport:
//   1. Check ticket (parse request body) ← express.json()
//   2. Check passport (verify CORS)      ← cors()
//   3. Board the flight (handle route)   ← our route handlers
//

// Allow CORS (Cross-Origin Resource Sharing).
// This lets our frontend (on a different domain/port) call this server.
// Without this, the browser would refuse the connection.
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173', // Vite preview port
  // After deployment, Railway automatically provides CORS-friendly setup,
  // but we'll also accept any Vercel domain for your deployed frontend:
  /\.vercel\.app$/,         // Matches any *.vercel.app domain
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server calls)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp)  return allowed.test(origin);
      return false;
    });

    if (isAllowed) {
      callback(null, true);  // Allow the request
    } else {
      // This is expected to appear during development if you try from an unexpected URL
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, true); // For now, allow all origins (simplify for beginners)
                            // In a real production app, you'd use: callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Parse incoming request bodies as JSON.
// When the frontend sends data like { "date": "2024-01-15", "activity": "shampoo" },
// this middleware converts it from raw text to a JavaScript object,
// making it available as req.body in our route handlers.
app.use(express.json());

// ─── STEP 4: REGISTER ROUTES ──────────────────────────────────────────────────
//
// "Routes" map URLs to handler functions.
// app.use('/api/logs', logsRouter) means:
//   "For any request starting with /api/logs, let logsRouter handle it."
//
// So when the frontend calls GET /api/logs,
// Express finds the handler in routes/logs.js.
//

// Mount the logs routes at the /api/logs path
app.use('/api/logs', logsRouter);

// ─── HEALTH CHECK ROUTE ───────────────────────────────────────────────────────
// A simple route at GET / that just confirms the server is running.
// Useful for testing ("is the server up?") and for deployment platforms
// that periodically ping your server to check if it's alive.
app.get('/', function(req, res) {
  res.json({
    status: 'ok',
    message: 'Shampoo Tracker API is running!',
    version: '1.0.0',
    endpoints: {
      'GET  /api/logs':                    'Get all activity logs',
      'POST /api/logs':                    'Add a new activity log',
      'DELETE /api/logs':                  'Clear all activity logs',
      'DELETE /api/logs/:date/:activity':  'Delete a specific log',
      'GET  /api/logs/stats/month':        'Get monthly statistics',
    }
  });
});

// ─── STEP 5: HANDLE 404 - ROUTE NOT FOUND ────────────────────────────────────
// If someone requests a URL that doesn't exist, return a 404 error.
// This must come AFTER all other routes are registered.
app.use(function(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`
  });
});

// ─── STEP 6: START THE SERVER ─────────────────────────────────────────────────
// Read the port number from .env, or use 3001 as default.
const PORT = process.env.PORT || 3001;

// app.listen() starts the server and makes it wait for incoming connections.
// It's like "opening the restaurant for business".
app.listen(PORT, function() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Shampoo Tracker Backend is running!');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  API:     http://localhost:${PORT}/api/logs`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('Press Ctrl+C to stop the server.');
});
