// ─── src/app/App.tsx ──────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// App.tsx is the top-level component of the entire frontend application.
// It's the first React component that gets rendered, and it sets up routing.
//
// WHAT IS ROUTING?
// "Routing" determines which component (screen) to show based on the URL.
// Our app has three routes defined in routes.ts:
//   • "/"          → Home screen
//   • "/calendar"  → Calendar screen
//   • "/settings"  → Settings screen
//
// HOW DOES THIS FILE RELATE TO OTHER FILES?
// main.tsx          (entry point)
//   └── App.tsx     (this file, sets up routing)
//       └── Root.tsx (layout wrapper, provides context)
//           ├── Home.tsx       (shown at "/")
//           ├── CalendarView.tsx (shown at "/calendar")
//           └── Settings.tsx   (shown at "/settings")
//
// ─────────────────────────────────────────────────────────────────────────────

// RouterProvider is a React component from React Router.
// It takes the router configuration and makes routing work throughout the app.
import { RouterProvider } from 'react-router';

// Import our router configuration (which URLs map to which components)
import { router } from './routes';

// The default App component - exported as default so main.tsx can import it
export default function App() {
  // RouterProvider renders the appropriate component for the current URL,
  // using the route configuration defined in routes.ts
  return <RouterProvider router={router} />;
}
