# Learning Roadmap — How to Understand This Codebase From Scratch

This guide tells you exactly which file to open first, which part to read,
and in what order — written for someone who has NEVER done JavaScript or
TypeScript development before.

---

## Before You Start: Core Concepts to Know

### What is JavaScript?
JavaScript (JS) is a programming language that runs in web browsers.
It's what makes web pages interactive (respond to clicks, update content, etc.).

### What is TypeScript?
TypeScript (TS) is JavaScript with "types" added. Types tell the computer
what kind of data a variable holds. Files end in `.ts` or `.tsx`.

Example:
```typescript
// JavaScript (no types - error-prone)
let age = 25;
age = "hello"; // No error shown, but this is a bug!

// TypeScript (with types - catches bugs early)
let age: number = 25;
age = "hello"; // TypeScript shows an ERROR immediately!
```

### What is React?
React is a JavaScript library for building user interfaces.
Instead of manually updating HTML, you describe what the UI should look like,
and React updates the actual HTML automatically when data changes.

### What is a Component?
A component is a reusable piece of UI — like a custom HTML element.
```tsx
// A simple component
function Greeting() {
  return <h1>Hello, World!</h1>; // This looks like HTML but it's JSX
}
// Used like: <Greeting />
```

### What is JSX?
JSX is HTML-like syntax inside JavaScript files. React converts it to real HTML.
```tsx
// JSX
const element = <div className="hello">World</div>;

// What it becomes (you never write this manually):
const element = React.createElement('div', { className: 'hello' }, 'World');
```

---

## PHASE 1: Understand the Project Structure (5 minutes)

### Step 1: Read this file tree

```
Minimalist Tracker App/
│
├── 📄 index.html               ← The ONE HTML file (entry point)
├── 📄 package.json             ← Frontend project info & dependencies
├── 📄 vite.config.ts           ← Build tool configuration
│
├── 📁 src/                     ← ALL frontend source code
│   ├── 📄 main.tsx             ← ⭐ START HERE (frontend entry point)
│   └── 📁 app/
│       ├── 📄 App.tsx          ← Step 2
│       ├── 📄 routes.ts        ← Step 3
│       ├── 📁 api/
│       │   └── 📄 client.ts    ← Step 4 (backend communication)
│       ├── 📁 context/
│       │   └── 📄 ActivityContext.tsx ← Step 5 (shared data)
│       └── 📁 components/
│           ├── 📄 Root.tsx     ← Step 6
│           ├── 📄 BottomNav.tsx ← Step 7
│           ├── 📄 Home.tsx     ← Step 8
│           ├── 📄 CalendarView.tsx ← Step 9
│           └── 📄 Settings.tsx ← Step 10
│
├── 📁 backend/                 ← ALL backend source code
│   ├── 📄 package.json         ← Backend project info & dependencies
│   ├── 📄 .env.example         ← ⭐ START HERE (backend configuration)
│   └── 📁 src/
│       ├── 📄 server.js        ← Step B1 (server entry point)
│       ├── 📄 database.js      ← Step B2 (database setup)
│       └── 📁 routes/
│           └── 📄 logs.js      ← Step B3 (API endpoints)
│
├── 📄 ARCHITECTURE.md          ← Big picture overview (read first!)
├── 📄 LEARNING_ROADMAP.md      ← This file
└── 📄 README.md                ← How to run the app
```

---

## PHASE 2: Understand the Frontend (Read in this order)

### ⭐ Step 1: `index.html` (2 minutes)

**Location:** `/index.html`

**What to look for:**
```html
<div id="root"></div>
```
This is the only meaningful HTML in the file. ONE empty div.
Our entire React app gets injected into this div by `main.tsx`.

**Key insight:** The browser loads this file first. Everything else happens via JavaScript.

---

### Step 2: `src/main.tsx` (5 minutes)

**Location:** `src/main.tsx`

**Read from top to bottom.**

**What to look for:**
```tsx
createRoot(document.getElementById("root")!).render(<App />);
```

This is the moment React "takes over" from HTML.
It finds the `<div id="root">` from index.html and renders `<App />` inside it.

**Key concept:** `<App />` is JSX syntax for "render the App component here".

---

### Step 3: `src/app/App.tsx` (3 minutes)

**Location:** `src/app/App.tsx`

**What to look for:**
```tsx
return <RouterProvider router={router} />;
```

App just sets up routing. It hands off control to the router.

**Key concept:** The router decides which component to show based on the URL.

---

### Step 4: `src/app/routes.ts` (5 minutes)

**Location:** `src/app/routes.ts`

**What to look for — the route definitions:**
```typescript
{
  path: "/",
  Component: Root,
  children: [
    { index: true, Component: Home },
    { path: "calendar", Component: CalendarView },
    { path: "settings", Component: Settings },
  ],
}
```

**Read the comments.** They explain what "routing" means and why we use it.

**Key concept:** This is a "map" from URLs to components.

---

### Step 5: `src/app/api/client.ts` (10 minutes)

**Location:** `src/app/api/client.ts`

**What to look for first — the interface definitions:**
```typescript
export interface ActivityLog {
  id: number;
  date: string;
  activity: string;
  created_at: string;
}
```
This is the "shape" of data the backend sends.

**Then read the functions:**
- `getAllLogs()` — fetches all logs
- `addLog()` — saves a new log
- `clearAllLogs()` — deletes everything

**Key concept:** `fetch()` sends HTTP requests to the backend.
`async/await` handles the fact that network calls take time.

---

### Step 6: `src/app/context/ActivityContext.tsx` (15 minutes)

**Location:** `src/app/context/ActivityContext.tsx`

This is the most complex file. Read it in sections:

**Section A: The interface (lines ~30-55)**
```typescript
interface ActivityContextType {
  logs: ActivityLog[];
  isLoading: boolean;
  addLog: (date: string, activity: string) => Promise<void>;
  // ...
}
```
This defines what data and functions are "shared" with all components.

**Section B: useState calls (lines ~65-80)**
```typescript
const [logs, setLogs] = useState<ActivityLog[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
```
Each `useState` creates one piece of changeable data.

**Section C: refreshLogs function (lines ~85-110)**
This fetches all data from the backend when the app loads.

**Section D: addLog, deleteLog, clearAllLogs (lines ~115-165)**
These call the API client and then refresh the data.

**Section E: The computed functions (lines ~170-215)**
`getLastShampooDate`, `getDaysAgo`, `isDateLogged` — these calculate values
from the `logs` array without making any network requests.

**Section F: useActivity hook (bottom)**
```typescript
export function useActivity() {
  return useContext(ActivityContext);
}
```
Any component can call `useActivity()` to get all the data and functions.

---

### Step 7: `src/app/components/Root.tsx` (3 minutes)

**Location:** `src/app/components/Root.tsx`

Very simple. Just:
1. Wraps everything in `<ActivityProvider>` (so all screens can access context)
2. Has `<Outlet />` (placeholder where the active screen renders)

---

### Step 8: `src/app/components/BottomNav.tsx` (5 minutes)

**Location:** `src/app/components/BottomNav.tsx`

**What to look for:**
```typescript
const location = useLocation();
const isActive = (path: string): boolean => location.pathname === path;
```

`useLocation()` tells us the current URL.
We use it to highlight which tab is "active" (green vs grey).

`<Link to="/calendar">` navigates without page reload.

---

### Step 9: `src/app/components/Home.tsx` (10 minutes)

**Location:** `src/app/components/Home.tsx`

**Read in this order:**
1. The `useActivity()` call at the top — what data does Home use?
2. `handleQuickLog()` — what happens when you tap the button?
3. `formatLastActivity()` — how is "2 days ago" calculated?
4. The JSX `return (...)` — how is each card built?

**Key things to notice:**
- `{isLoading ? 'Loading...' : value}` — conditional rendering
- `{error && <div>...</div>}` — only show error div if error exists
- The stats now come from `monthStats?.totalWashes` (real data, not hardcoded!)

---

### Step 10: `src/app/components/CalendarView.tsx` (10 minutes)

**Location:** `src/app/components/CalendarView.tsx`

**Read in this order:**
1. `getDaysInMonth()` — how to calculate days in a month
2. `getFirstDayOfMonth()` — why do we need "empty" cells?
3. `emptyDays` array — the blank cells before day 1
4. The calendar grid in JSX — how each day cell is colored

**Key concept:** The calendar is just a 7-column grid.
We calculate which days are filled vs empty.

---

### Step 11: `src/app/components/Settings.tsx` (5 minutes)

**Location:** `src/app/components/Settings.tsx`

Simplest component. The important part:
```typescript
const handleClearData = async () => {
  const confirmed = window.confirm('Are you sure?');
  if (!confirmed) return;
  await clearAllLogs();
};
```
This is how the "Clear All Data" button actually works now (it was broken before!).

---

## PHASE 3: Understand the Backend (Read in this order)

### Step B1: `backend/.env.example` (2 minutes)

**Location:** `backend/.env.example`

Read the comments. Understand what PORT, DATABASE_PATH, and FRONTEND_URL do.

---

### Step B2: `backend/src/server.js` (10 minutes)

**Location:** `backend/src/server.js`

**Read in this order:**
1. The imports (require statements) — what libraries do we use?
2. `app.use(cors(...))` — why do we need CORS?
3. `app.use(express.json())` — why do we need JSON parsing?
4. `app.use('/api/logs', logsRouter)` — route mounting
5. `app.listen(PORT, ...)` — starting the server

**Key insight:** The server is just a Node.js program that:
- Starts up
- Listens on a port (3001) for incoming HTTP requests
- Passes each request to the appropriate route handler
- Stays running forever until you stop it (Ctrl+C)

---

### Step B3: `backend/src/database.js` (10 minutes)

**Location:** `backend/src/database.js`

**Read in this order:**
1. The path calculation — how the database file location is determined
2. The folder creation — why we create the folder if it doesn't exist
3. The `db.exec(...)` call — the SQL that creates our table

**Key SQL to understand:**
```sql
CREATE TABLE IF NOT EXISTS activity_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    activity    TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    UNIQUE(date, activity)
)
```

---

### Step B4: `backend/src/routes/logs.js` (20 minutes)

**Location:** `backend/src/routes/logs.js`

This is the most complex backend file. Read one route at a time:

**Route 1: `GET /`** — getting all logs
```javascript
const logs = db.prepare('SELECT * FROM activity_logs ORDER BY date DESC').all();
res.status(200).json({ success: true, data: logs });
```

**Route 2: `POST /`** — adding a new log
Notice the validation before inserting. Always validate untrusted input!
The `?` placeholders prevent SQL injection attacks.

**Route 3: `DELETE /:date/:activity`** — deleting one log
Notice `:date` and `:activity` are URL parameters (e.g., `/api/logs/2024-01-15/shampoo`).

**Route 4: `DELETE /`** — clear all logs

**Route 5: `GET /stats/month`** — monthly statistics
This is the most complex — it calculates average frequency by looking at
gaps between consecutive wash dates.

---

## PHASE 4: Understanding How They Connect

### The Complete Data Journey (Read After Understanding Both Parts)

**When the app first loads:**
```
Browser opens URL
  → main.tsx runs
  → App.tsx renders
  → Root.tsx renders
  → ActivityProvider initializes
    → useEffect calls refreshLogs()
      → getAllLogs() in client.ts
        → fetch('/api/logs')
          → Vite proxy routes to backend port 3001
            → Express handles GET /api/logs
              → SQLite returns all rows
            → Express sends JSON response
          → fetch() resolves with the response
        → getAllLogs() returns the array
      → ActivityContext stores logs in state
    → React re-renders all components
  → Home screen shows with real data
```

**When you tap "Shampooed Today":**
```
Button onClick fires
  → handleQuickLog() in Home.tsx
    → addLog(today, 'shampoo') in ActivityContext
      → apiAddLog(date, 'shampoo') in client.ts
        → fetch POST /api/logs
          → Express handles POST /api/logs
            → Validates date and activity
            → SQLite INSERT OR IGNORE
            → Returns new row
          → fetch() resolves
        → apiAddLog() returns the new log
      → refreshLogs() fetches updated data
    → React re-renders
  → UI updates to show today as logged
```

---

## Recommended Learning Resources

If you want to learn more about these technologies:

### JavaScript Basics
- **MDN Web Docs** (developer.mozilla.org) — the official reference, excellent for beginners
- Search for: "JavaScript basics MDN"

### React
- **react.dev** — official React documentation with interactive examples
- Search for: "React getting started"

### TypeScript
- **typescriptlang.org/docs** — official TypeScript documentation
- Search for: "TypeScript handbook"

### Express / Node.js
- **expressjs.com** — official Express documentation
- **nodejs.org/docs** — official Node.js documentation

### SQL / SQLite
- **sqlitetutorial.net** — beginner-friendly SQLite tutorial
- Search for: "SQLite tutorial beginners"

---

## Glossary (Quick Reference)

| Term | Meaning |
|------|---------|
| **Component** | A reusable UI piece, written as a function that returns JSX |
| **Props** | Data passed FROM a parent component TO a child component |
| **State** | Data that can change over time; React updates UI when state changes |
| **Hook** | A React function (starts with "use") that gives access to React features |
| **Context** | A way to share data across many components without passing through each one |
| **JSX** | HTML-like syntax inside JavaScript/TypeScript files |
| **API** | Application Programming Interface — a set of URLs a server responds to |
| **HTTP** | Protocol for communication between browsers and servers |
| **JSON** | JavaScript Object Notation — text format for exchanging data |
| **Async/Await** | Syntax for handling operations that take time (like network requests) |
| **Promise** | An object representing a future value (what async functions return) |
| **SQL** | Structured Query Language — how you talk to relational databases |
| **SQLite** | A simple database stored in one file, no server needed |
| **TypeScript** | JavaScript with type annotations for catching bugs early |
| **Vite** | Build tool for the frontend (compiles TS, runs dev server) |
| **npm** | Node Package Manager — tool for installing JavaScript libraries |
| **Express** | Web framework for Node.js — makes building APIs easy |
| **CORS** | Security feature; browser requires backend permission to receive requests |
| **Port** | A number (like 3001) that identifies which program on a computer to talk to |
| **Route** | A URL path + what happens when that URL is requested |
| **Middleware** | Code that runs on every request before route handlers |
| **REST API** | API style using HTTP methods (GET/POST/DELETE) on resource URLs |
