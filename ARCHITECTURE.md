# System Architecture — Shampoo Tracker App

This document explains how all the pieces of the app fit together.
Written for someone with no prior development experience.

---

## What is "Architecture"?

Architecture describes how the different parts of a software system are organized
and how they communicate with each other.

Think of it like a restaurant:
- **Frontend** = the dining room (what customers see and interact with)
- **Backend** = the kitchen (where the actual work gets done)
- **Database** = the pantry/refrigerator (where ingredients/data are stored)

---

## Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR PHONE / BROWSER                         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (React App)                     │   │
│  │                                                             │   │
│  │   Home Screen ──┐                                          │   │
│  │   Calendar     ─┼──→  ActivityContext  ──→  API Client     │   │
│  │   Settings    ──┘         (state)         (fetch calls)    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                     HTTP Requests  │  (JSON data over the internet) │
│                                    ▼                                │
└────────────────────────────────────┼────────────────────────────────┘
                                     │
                    ─────────────────┼────────────────────
                         INTERNET / LOCAL NETWORK
                    ─────────────────┼────────────────────
                                     │
┌────────────────────────────────────┼────────────────────────────────┐
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   BACKEND (Node.js + Express)               │   │
│  │                                                             │   │
│  │   server.js  →  routes/logs.js  →  database.js             │   │
│  │   (starts      (handles URLs)      (SQL queries)            │   │
│  │    server)                                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  DATABASE (SQLite file)                     │   │
│  │                                                             │   │
│  │   backend/data/tracker.db                                   │   │
│  │                                                             │   │
│  │   activity_logs table:                                      │   │
│  │   id | date       | activity | created_at                   │   │
│  │   1  | 2024-01-15 | shampoo  | 2024-01-15 08:30:00         │   │
│  │   2  | 2024-01-18 | shampoo  | 2024-01-18 07:15:00         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                    SERVER (your Mac or Railway cloud)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Frontend (The React App)

### What is it?
The frontend is the visual part of the app — everything you see and tap.
It's written in **TypeScript** (JavaScript with types) and **React**.

### Technology Stack
| Technology | What it does |
|-----------|-------------|
| **React** | Library for building UIs from reusable "components" |
| **TypeScript** | JavaScript + type checking (catches bugs early) |
| **Vite** | Build tool — compiles TS→JS, runs dev server |
| **Tailwind CSS** | Utility CSS classes for styling (no custom CSS files needed) |
| **React Router** | Handles navigation between screens without page reload |

### Frontend File Structure
```
src/
├── main.tsx                    ← ENTRY POINT: starts the React app
├── app/
│   ├── App.tsx                 ← Sets up routing
│   ├── routes.ts               ← URL → component mappings
│   ├── api/
│   │   └── client.ts           ← ALL backend API calls live here
│   ├── context/
│   │   └── ActivityContext.tsx ← Shared data store (state management)
│   └── components/
│       ├── Root.tsx            ← Layout wrapper (wraps all screens)
│       ├── Home.tsx            ← Home screen ("/" route)
│       ├── CalendarView.tsx    ← Calendar screen ("/calendar" route)
│       ├── Settings.tsx        ← Settings screen ("/settings" route)
│       └── BottomNav.tsx       ← Navigation bar at bottom of screen
└── styles/
    └── index.css               ← Global styles
```

### How Components Relate
```
App.tsx
 └── RouterProvider
      └── Root.tsx              (layout, wraps all screens)
           ├── ActivityProvider (shares data with all screens)
           └── <Outlet />       (placeholder, replaced by active screen)
                ├── Home.tsx         (at URL "/")
                ├── CalendarView.tsx (at URL "/calendar")
                └── Settings.tsx     (at URL "/settings")
```

### Data Flow (How the Frontend Gets and Saves Data)
```
User taps "Shampooed Today"
       │
       ▼
Home.tsx calls addLog(today, 'shampoo')
       │
       ▼
ActivityContext.tsx calls apiAddLog(date, activity)
       │
       ▼
api/client.ts sends POST /api/logs to backend
       │
       ▼ (server responds)
       │
ActivityContext.tsx updates local state (triggers re-render)
       │
       ▼
All screens automatically update to show the new data
```

---

## Part 2: Backend (The Express Server)

### What is it?
The backend is a server — a program that runs continuously and responds to
requests from the frontend. It's written in **Node.js** (JavaScript on the server).

### Why do we need it?
- The frontend alone can't save data permanently (data is lost on refresh)
- The backend saves data to a real database file
- The backend can run calculations (like statistics) without slowing the frontend

### Technology Stack
| Technology | What it does |
|-----------|-------------|
| **Node.js** | Runs JavaScript outside the browser (on the server) |
| **Express** | Web framework — makes it easy to handle HTTP requests |
| **better-sqlite3** | Library for reading/writing SQLite database files |
| **CORS** | Allows the frontend to make requests to the backend |
| **dotenv** | Loads configuration from .env file |

### Backend File Structure
```
backend/
├── package.json        ← Lists dependencies, defines npm scripts
├── .env                ← Configuration (port, database path, frontend URL)
├── .env.example        ← Template showing what .env should contain
├── .gitignore          ← Tells git which files NOT to track
└── src/
    ├── server.js       ← ENTRY POINT: creates Express app, starts server
    ├── database.js     ← Sets up SQLite connection, creates tables
    └── routes/
        └── logs.js     ← Defines all /api/logs endpoints
```

### API Endpoints (URLs the backend responds to)

| Method | URL | What it does |
|--------|-----|-------------|
| `GET`    | `/api/logs` | Get all activity logs |
| `POST`   | `/api/logs` | Add a new log `{ date, activity }` |
| `DELETE` | `/api/logs` | Delete ALL logs (clear all data) |
| `DELETE` | `/api/logs/:date/:activity` | Delete one specific log |
| `GET`    | `/api/logs/stats/month?year=Y&month=M` | Monthly stats |

### HTTP Methods Explained
- **GET** = "Give me data" (reading)
- **POST** = "Save this new data" (creating)
- **DELETE** = "Remove this data" (deleting)

---

## Part 3: Database (SQLite)

### What is it?
SQLite is a database that stores ALL data in a single file: `backend/data/tracker.db`.
Unlike other databases (MySQL, PostgreSQL), it requires no separate server to install.

### The `activity_logs` Table

```sql
CREATE TABLE activity_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    activity    TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    UNIQUE(date, activity)
)
```

| Column | Type | Example | Purpose |
|--------|------|---------|---------|
| `id` | Integer | 1, 2, 3... | Unique identifier, auto-counted |
| `date` | Text | "2024-01-15" | Date of the activity |
| `activity` | Text | "shampoo" | What activity was done |
| `created_at` | Text | "2024-01-15 08:30:00" | When this record was saved |

---

## Part 4: Communication (How Frontend Talks to Backend)

### HTTP Request/Response Cycle

```
Frontend sends:                     Backend sends back:
────────────────────────────        ────────────────────────────
POST /api/logs                      HTTP 201 Created
Content-Type: application/json  →   Content-Type: application/json
                                ←
{                                   {
  "date": "2024-01-15",              "success": true,
  "activity": "shampoo"              "data": {
}                                       "id": 1,
                                        "date": "2024-01-15",
                                        "activity": "shampoo",
                                        "created_at": "..."
                                    }
                                  }
```

### JSON (JavaScript Object Notation)
JSON is the format used to exchange data. It looks like a JavaScript object:
```json
{
  "date": "2024-01-15",
  "activity": "shampoo"
}
```
It's just text — but text in a structured format that both sides can read.

---

## Part 5: Deployment Architecture (For Accessing on Mobile)

### Local Development (Your Mac)
```
Your Mac:
  Backend:  http://localhost:3001
  Frontend: http://localhost:5173

Your Phone (same WiFi): can access via your Mac's local IP address
```

### Production Deployment (Access from Anywhere)
```
Vercel (free hosting):
  Frontend: https://your-app.vercel.app
  ↓ (calls backend via VITE_API_URL environment variable)

Railway (free hosting):
  Backend: https://shampoo-tracker-backend.railway.app
  ↓ (reads/writes SQLite database stored on Railway's disk)
```

See README.md for step-by-step deployment instructions.

---

## Summary: Request-to-Response Walkthrough

Here's what happens when you tap "Shampooed Today":

1. **You tap the button** in the browser/mobile
2. **Home.tsx** calls `addLog('2024-01-21', 'shampoo')`
3. **ActivityContext.tsx** calls `apiAddLog('2024-01-21', 'shampoo')`
4. **api/client.ts** sends `POST /api/logs` with `{"date": "2024-01-21", "activity": "shampoo"}`
5. **Vite proxy** (in dev) or direct URL (in production) routes it to the backend
6. **server.js** receives the request and routes it to `routes/logs.js`
7. **routes/logs.js** validates the data and calls the database
8. **database.js** runs `INSERT INTO activity_logs ...` to save to the file
9. The database returns the new row
10. **routes/logs.js** sends back `{"success": true, "data": {...}}`
11. **api/client.ts** returns the new log to the context
12. **ActivityContext.tsx** calls `refreshLogs()` to reload all data
13. **React re-renders** Home, Calendar — they now show the new log

Total round-trip time: typically under 100 milliseconds!
