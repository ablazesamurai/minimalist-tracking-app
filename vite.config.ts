// ─── vite.config.ts ──────────────────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// Vite is the "build tool" for our frontend. It:
//   1. Runs a local development server (usually on port 5173)
//   2. Compiles TypeScript and JSX into regular JavaScript that browsers understand
//   3. Bundles all files into optimized files for deployment
//
// This config file customizes how Vite works.
//
// WHAT IS TypeScript?
// TypeScript is JavaScript with added "types". Types tell the editor what kind
// of data a variable holds (number, string, etc.), which catches errors early.
// Files ending in .ts or .tsx are TypeScript. The "x" means it also contains
// JSX (HTML-like syntax for React components).
//
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React plugin enables JSX support and React-specific optimizations
    react(),
    // The Tailwind CSS plugin enables Tailwind utility classes in our JSX
    tailwindcss(),
  ],

  resolve: {
    alias: {
      // "@" is a shortcut for the "./src" folder.
      // So instead of writing: import X from '../../components/X'
      // You can write:        import X from '@/components/X'
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ─── DEV SERVER PROXY ──────────────────────────────────────────────────────
  // This is crucial for development!
  //
  // During development:
  //   - Frontend runs on: http://localhost:5173
  //   - Backend runs on:  http://localhost:3001
  //
  // When the frontend makes a request to /api/logs, the browser would try
  // http://localhost:5173/api/logs and fail (because the frontend doesn't serve API routes).
  //
  // This proxy tells Vite: "If a request starts with /api, forward it to port 3001."
  // So /api/logs on port 5173 → automatically becomes /api/logs on port 3001.
  //
  // This only works during development. In production (on Vercel/Railway),
  // the frontend knows the actual backend URL via the VITE_API_URL environment variable.
  //
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // Forward to our backend
        changeOrigin: true,               // Change the request "Host" header to match backend
      }
    }
  },

  // File types to support as raw imports (SVG images, CSV data files)
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
