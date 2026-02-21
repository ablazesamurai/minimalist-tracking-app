// ─── src/app/components/Root.tsx ─────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// Root.tsx is the "root" (base) of our component tree.
// It wraps all other components to provide them with:
//   1. The ActivityProvider (shared data about logs, stats, etc.)
//
// HOW IT WORKS WITH ROUTING:
// In our routes.ts file, Root is the "parent" route component.
// When you navigate to /, /calendar, or /settings, the matching component
// is rendered inside Root via the <Outlet /> placeholder.
//
// VISUAL STRUCTURE:
//   Root
//   ├── ActivityProvider  (provides shared data to all children)
//   │   └── div (mobile-width container)
//   │       └── <Outlet /> ← replaced by Home, CalendarView, or Settings
//   │           ├── Home (when URL is "/")
//   │           ├── CalendarView (when URL is "/calendar")
//   │           └── Settings (when URL is "/settings")
//
// WHAT IS "Outlet"?
// <Outlet /> is a React Router concept — a placeholder that renders
// whatever child route matches the current URL. It's like a slot
// that gets filled with the right component automatically.
//
// ─────────────────────────────────────────────────────────────────────────────

// Outlet renders the currently matched child route component
import { Outlet } from 'react-router';

// ActivityProvider makes activity data available to ALL components inside it
import { ActivityProvider } from '../context/ActivityContext';

export function Root() {
  return (
    // ActivityProvider wraps everything so all screens can access activity data.
    // Think of it as setting up a "shared memory" that all screens can read from.
    <ActivityProvider>
      {/*
        This div limits the app width to 450px and centers it.
        This makes it look like a mobile app even on a desktop browser.
        max-w-[450px] = maximum width 450 pixels
        mx-auto = auto horizontal margins (centers the element)
        bg-white = white background
        min-h-screen = at least as tall as the screen
      */}
      <div className="max-w-[450px] mx-auto bg-white min-h-screen">
        {/*
          <Outlet /> is replaced by the component for the current URL:
          - "/" → <Home />
          - "/calendar" → <CalendarView />
          - "/settings" → <Settings />
        */}
        <Outlet />
      </div>
    </ActivityProvider>
  );
}
