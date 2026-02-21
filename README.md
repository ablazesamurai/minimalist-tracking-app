# Shampoo Tracker App

A minimalist app to track your hair-washing routine.
Log when you shampoo, view your history on a calendar, and see monthly stats.

---

## What's In This Repo

```
Minimalist Tracker App/
├── src/           ← Frontend (React app)
├── backend/       ← Backend (Node.js API server)
├── ARCHITECTURE.md      ← How all the pieces fit together
├── LEARNING_ROADMAP.md  ← How to understand the code from scratch
└── README.md            ← This file (how to run everything)
```

---

## Running Locally (Development)

You need to run TWO programs at the same time:
1. The **backend** (Node.js server on port 3001)
2. The **frontend** (Vite dev server on port 5173)

### Step 1: Install Node.js (if you haven't)
Download from: https://nodejs.org (choose the "LTS" version)

### Step 2: Set up and start the backend

Open a terminal and run these commands:

```bash
# Go into the backend folder
cd backend

# Install all required libraries (only needed first time)
npm install

# Start the backend server (keeps running, shows logs)
npm run dev
```

You should see:
```
═══════════════════════════════════════════
  Shampoo Tracker Backend is running!
  Local:   http://localhost:3001
  API:     http://localhost:3001/api/logs
═══════════════════════════════════════════
```

**Keep this terminal open.**

### Step 3: Start the frontend

Open a **second** terminal window (from the main project folder):

```bash
# Install frontend libraries (only first time, if node_modules doesn't exist)
npm install

# Start the frontend dev server
npm run dev
```

You should see:
```
  VITE v6.x.x  ready
  ➜  Local:   http://localhost:5173/
```

### Step 4: Open the app

Open your browser and go to: **http://localhost:5173**

---

## Deploying Online (Access from Your Phone Anywhere)

To use the app on your phone from anywhere, deploy it online.
We use **Vercel** (frontend, free) and **Railway** (backend, free).

### Step 1: Push code to GitHub
Create a GitHub account, create a repository, and push your code.

### Step 2: Deploy Backend to Railway
1. Go to **railway.app** → sign up with GitHub
2. New Project → Deploy from GitHub repo → select your repo
3. Set Root Directory to `backend`
4. Add Environment Variables:
   ```
   PORT=3001
   DATABASE_PATH=./data/tracker.db
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy and copy the Railway URL (e.g. `https://shampoo-tracker.railway.app`)

### Step 3: Deploy Frontend to Vercel
1. Go to **vercel.com** → sign up with GitHub
2. Add New Project → import your repository
3. Add Environment Variable:
   ```
   VITE_API_URL=https://shampoo-tracker.railway.app
   ```
   (Use your actual Railway URL)
4. Deploy — your app is live at `https://your-app.vercel.app`

### Add to iPhone Home Screen
1. Open Safari → go to your Vercel URL
2. Tap Share button → "Add to Home Screen"
3. The app icon appears like a regular app!

---

## Tech Stack

| Part | Technology | Purpose |
|------|-----------|---------|
| Frontend | React + TypeScript | UI components |
| Styling | Tailwind CSS | Visual design |
| Build tool | Vite | Compiles code, dev server |
| Navigation | React Router | Screen navigation |
| Backend | Node.js + Express | API server |
| Database | SQLite | Data storage |
| Frontend Host | Vercel | Deploy & serve frontend |
| Backend Host | Railway | Deploy & run backend |

---

## Learn More About the Code

- **ARCHITECTURE.md** — Diagrams and explanations of how everything connects
- **LEARNING_ROADMAP.md** — Exact step-by-step guide for reading every file
