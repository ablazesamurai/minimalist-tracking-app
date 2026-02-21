// ─── src/app/routes.ts ────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This file defines the URL routes for our app — which component (screen) to
// show when the user visits a specific URL.
//
// WHY ROUTES?
// A traditional website loads a new HTML page when you click a link.
// This app is a "Single Page Application" (SPA) — there's only ONE HTML page
// (index.html), and React Router swaps components in and out based on the URL
// WITHOUT loading a new page. This makes navigation instant.
//
// OUR ROUTES:
// URL "/"           → Home component    (main tracking screen)
// URL "/calendar"   → CalendarView      (visual calendar of past logs)
// URL "/settings"   → Settings          (preferences and data management)
//
// ROUTE NESTING:
// Root is the parent of all routes. It renders the layout (ActivityProvider + container),
// and its children (Home, CalendarView, Settings) fill the <Outlet /> inside Root.
//
// ─────────────────────────────────────────────────────────────────────────────

// createBrowserRouter creates a router that uses the browser's URL bar for navigation
import { createBrowserRouter } from "react-router";

// Import the components for each screen/page
import { Root }         from "./components/Root";          // Layout wrapper
import { Home }         from "./components/Home";          // "/" route
import { CalendarView } from "./components/CalendarView";  // "/calendar" route
import { Settings }     from "./components/Settings";      // "/settings" route

// Create and export the router with our route configuration.
// This is passed to <RouterProvider router={router} /> in App.tsx.
export const router = createBrowserRouter([
  {
    path: "/",            // This route matches the root URL
    Component: Root,      // Root renders the layout and <Outlet /> for children
    children: [
      // "index: true" means this is the default child (shown at exactly "/")
      { index: true,         Component: Home },
      { path: "calendar",   Component: CalendarView },
      { path: "settings",   Component: Settings },
    ],
  },
]);
