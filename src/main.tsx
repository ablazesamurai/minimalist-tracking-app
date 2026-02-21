// ─── src/main.tsx ─────────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This is the TRUE entry point of the frontend application.
// It's the very first JavaScript file that runs in the browser.
//
// WHAT DOES IT DO?
// 1. Imports the global CSS styles
// 2. Finds the <div id="root"> element in index.html
// 3. Renders our React App component inside that div
//
// WHAT IS "RENDERING"?
// React doesn't directly write HTML. Instead, it builds a "virtual DOM"
// (a JavaScript representation of the page structure) and then efficiently
// updates the real browser DOM to match.
// "Rendering" = converting React components into actual visible HTML.
//
// FLOW:
// Browser opens index.html
//   └── index.html has <div id="root"></div> and loads main.tsx
//       └── main.tsx finds div#root and renders <App /> inside it
//           └── App.tsx sets up routing
//               └── The right screen component appears based on URL
//
// ─────────────────────────────────────────────────────────────────────────────

// createRoot is the React 18+ way to start a React app
// "react-dom/client" is React's library for working with the browser DOM
import { createRoot } from "react-dom/client";

// Import our root App component (the top of our component tree)
import App from "./app/App.tsx";

// Import global CSS styles (fonts, base Tailwind styles, etc.)
import "./styles/index.css";

// Find the HTML element with id="root" in index.html
// The "!" at the end is TypeScript saying "I'm sure this element exists"
// (without !, TypeScript would warn it might be null)
const rootElement = document.getElementById("root")!;

// Create a React root (React 18 way of starting the app)
// and render our App component into it.
// After this line runs, the browser displays our React app!
createRoot(rootElement).render(<App />);
