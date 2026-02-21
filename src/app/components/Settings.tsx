// ─── src/app/components/Settings.tsx ─────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This is the Settings screen of the app.
// It lets users:
//   1. (Future) Enable/disable reminder notifications
//   2. (Future) Toggle dark mode
//   3. Clear all data from the database
//
// BUG FIX: The "Clear All Data" button previously had NO onClick handler,
// meaning it looked like it did something but did nothing.
// Now it calls clearAllLogs() which deletes all records from the backend.
//
// ─────────────────────────────────────────────────────────────────────────────

// Import icons
import { Bell, Moon, Trash2, Info } from 'lucide-react';

// Import our custom hook for accessing activity data/functions
import { useActivity } from '../context/ActivityContext';

// Import the bottom navigation bar
import { BottomNav } from './BottomNav';

export function Settings() {

  // Get the clearAllLogs function and loading state from context
  const { clearAllLogs, isLoading } = useActivity();

  // ── Handle "Clear All Data" button click ──
  const handleClearData = async () => {
    // window.confirm shows a browser pop-up asking the user to confirm.
    // It returns true if the user clicked "OK", false if they clicked "Cancel".
    // This prevents accidental deletion.
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL your activity data?\n\n' +
      'This cannot be undone.'
    );

    // If user clicked "Cancel", do nothing
    if (!confirmed) return;

    // Otherwise, call the backend to delete everything
    await clearAllLogs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F7] to-[#EAF4EF] pb-24">

      {/* ── Header ── */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl text-neutral-800 mb-2">Settings</h1>
        <p className="text-neutral-500">Customize your experience</p>
      </div>

      {/* ── Preferences Card ── */}
      {/* Contains toggles for Reminders and Dark Mode (both "coming soon") */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg text-neutral-800 mb-4">Preferences</h3>

          <div className="space-y-4">
            {/* Reminders toggle (disabled, coming soon) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#CCE3DE] rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-[#6B9080]" />
                </div>
                <div>
                  <p className="text-neutral-800">Reminders</p>
                  <p className="text-sm text-neutral-400">Coming soon</p>
                </div>
              </div>
              {/* Fake toggle switch - visually disabled */}
              <div className="w-12 h-7 bg-neutral-200 rounded-full cursor-not-allowed opacity-50" />
            </div>

            {/* Dark Mode toggle (disabled, coming soon) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#CCE3DE] rounded-xl flex items-center justify-center">
                  <Moon size={20} className="text-[#6B9080]" />
                </div>
                <div>
                  <p className="text-neutral-800">Dark Mode</p>
                  <p className="text-sm text-neutral-400">Coming soon</p>
                </div>
              </div>
              {/* Fake toggle switch - visually disabled */}
              <div className="w-12 h-7 bg-neutral-200 rounded-full cursor-not-allowed opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Data Management Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg text-neutral-800 mb-4">Data Management</h3>

          {/* Clear All Data button - NOW PROPERLY WIRED UP */}
          <button
            onClick={handleClearData}
            disabled={isLoading}  // Prevent clicking while another operation is in progress
            className={`
              w-full flex items-center gap-3 p-4 rounded-2xl transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'}
            `}
          >
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-neutral-800">Clear All Data</p>
              <p className="text-sm text-neutral-400">Remove all activity logs</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── About Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg text-neutral-800 mb-4">About</h3>

          <div className="flex items-start gap-3 p-4">
            <div className="w-10 h-10 bg-[#CCE3DE] rounded-xl flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-[#6B9080]" />
            </div>
            <div>
              <p className="text-neutral-800 mb-2">Shampoo Tracker</p>
              <p className="text-sm text-neutral-400 leading-relaxed">
                A simple, minimalist app to help you track your hair care routine.
                Build healthy habits one wash at a time.
              </p>
              <p className="text-xs text-neutral-400 mt-3">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
