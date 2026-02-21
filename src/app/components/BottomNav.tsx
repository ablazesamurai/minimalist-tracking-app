// ─── src/app/components/BottomNav.tsx ────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This is the bottom navigation bar that appears on every screen.
// It has three tabs: Home, Calendar, and Settings.
// Clicking a tab navigates to that screen.
//
// HOW DOES NAVIGATION WORK?
// This app uses React Router for navigation. Instead of loading a new web page
// (which would be slow), React Router swaps out the visible component
// instantly without a page reload. This is called "client-side routing" or SPA
// (Single Page Application) navigation.
//
// <Link to="/calendar"> is like an <a href="/calendar"> but smarter:
//   • It doesn't reload the whole page
//   • It knows about our app's route structure
//   • It works with the browser's back/forward buttons
//
// useLocation() gives us the current URL path so we know which tab is "active".
// Example: if the URL is "/calendar", we highlight the Calendar icon.
//
// ─────────────────────────────────────────────────────────────────────────────

// Import icons for each tab
// Note: "Settings" icon from lucide conflicts with our Settings component name,
// so we DON'T need to rename it since components are imported from different places.
import { Home, Calendar, Settings } from 'lucide-react';

// Link = navigate to a URL (like <a href> but without page reload)
// useLocation = returns the current URL path
import { Link, useLocation } from 'react-router';

export function BottomNav() {

  // useLocation() returns an object with the current URL info.
  // We use location.pathname which is the URL path, like "/", "/calendar", "/settings"
  const location = useLocation();

  // Helper function to check if a given path is the current page
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    // nav = semantic HTML element for navigation sections
    // fixed bottom-0 left-0 right-0 = stick to the very bottom of the screen
    // max-w-[450px] mx-auto = center it and limit width to match our app width
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-3 max-w-[450px] mx-auto">
      <div className="flex justify-around items-center">

        {/* ── Home Tab ── */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            isActive('/') ? 'text-[#6B9080]' : 'text-neutral-400'
          }`}
          aria-label="Home"
          aria-current={isActive('/') ? 'page' : undefined}
        >
          {/* strokeWidth makes the icon bolder when it's the active tab */}
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-xs">Home</span>
        </Link>

        {/* ── Calendar Tab ── */}
        <Link
          to="/calendar"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            isActive('/calendar') ? 'text-[#6B9080]' : 'text-neutral-400'
          }`}
          aria-label="Calendar"
          aria-current={isActive('/calendar') ? 'page' : undefined}
        >
          <Calendar size={24} strokeWidth={isActive('/calendar') ? 2.5 : 2} />
          <span className="text-xs">Calendar</span>
        </Link>

        {/* ── Settings Tab ── */}
        <Link
          to="/settings"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            isActive('/settings') ? 'text-[#6B9080]' : 'text-neutral-400'
          }`}
          aria-label="Settings"
          aria-current={isActive('/settings') ? 'page' : undefined}
        >
          <Settings size={24} strokeWidth={isActive('/settings') ? 2.5 : 2} />
          <span className="text-xs">Settings</span>
        </Link>

      </div>
    </nav>
  );
}
