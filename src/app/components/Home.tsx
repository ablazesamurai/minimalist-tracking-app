// ─── src/app/components/Home.tsx ─────────────────────────────────────────────
//
// WHAT IS THIS FILE?
// This is the Home screen of the app — the first thing you see when you open it.
// It shows:
//   1. A "Shampooed Today" button for quick logging
//   2. When you last shampooed
//   3. Stats for this month (total washes + average frequency)
//
// WHAT IS A "COMPONENT"?
// In React, a "component" is a reusable piece of UI (User Interface).
// It's like a custom HTML element. This file defines the Home component.
// We define it as a function that returns JSX (HTML-like syntax).
//
// WHAT IS JSX?
// JSX is special syntax that looks like HTML but is actually JavaScript.
// React converts it to real HTML that your browser displays.
// Example: <div className="hello">World</div> becomes a div element.
// Note: React uses "className" instead of "class" (class is a reserved word in JS).
//
// ─────────────────────────────────────────────────────────────────────────────

// Import icons from the lucide-react library
// Sparkles = ✨ sparkles icon, Calendar = 📅 calendar icon, Plus = ➕ add icon
import { Sparkles, Calendar as CalendarIcon, Plus } from 'lucide-react';

// useState lets us track local UI state like "is the past-date form open?"
import { useState } from 'react';

// Import our custom hook to access activity data and functions
import { useActivity } from '../context/ActivityContext';

// Import the bottom navigation bar component
import { BottomNav } from './BottomNav';

// ─── THE HOME COMPONENT ───────────────────────────────────────────────────────
// "export function" means this function is available to be imported by other files.
// Functions that start with a capital letter are React components by convention.
export function Home() {

  // ── Get data and actions from the ActivityContext ──
  // useActivity() gives us everything from ActivityContext.tsx.
  // We "destructure" only what we need from the returned object:
  const {
    addLog,               // Function to add a new log entry
    deleteLog,            // Function to delete a log entry (for toggling)
    getDaysAgo,           // Function returning how many days since last shampoo
    getLastShampooDate,   // Function returning the last shampoo date
    isDateLogged,         // Function checking if today is already logged
    monthStats,           // Stats object: { totalWashes, avgFrequencyDays }
    isLoading,            // true while fetching data from server
    error,                // Error message string, or null if no error
  } = useActivity();

  // ── Check if today is already logged ──
  const today = new Date();
  const isTodayLogged = isDateLogged(today);

  // ── State for the "Log Past Date" section ──
  // Controls whether the past-date form is visible
  const [showPastDateForm, setShowPastDateForm] = useState(false);

  // The date the user picked in the date input (starts as yesterday)
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    // Format as YYYY-MM-DD using local timezone parts
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [pastDate, setPastDate] = useState<string>(getYesterdayStr());

  // Whether the currently selected past date already has a log
  const isPastDateLogged = isDateLogged(new Date(pastDate + 'T12:00:00'));

  // ── Handle logging a past date ──
  const handlePastDateLog = async () => {
    if (isPastDateLogged) {
      // Toggle: remove the log if it already exists
      await deleteLog(pastDate, 'shampoo');
    } else {
      await addLog(pastDate, 'shampoo');
    }
    // Collapse the form after action
    setShowPastDateForm(false);
  };

  // ── Handle the "Shampooed Today" button click ──
  // This is an "async" function because addLog talks to the server.
  const handleQuickLog = async () => {
    // Convert today's date to "YYYY-MM-DD" format
    // toISOString() returns "2024-01-15T00:00:00.000Z"
    // .split('T')[0] takes just the "2024-01-15" part
    const todayStr = today.toISOString().split('T')[0];

    if (isTodayLogged) {
      // If already logged today, clicking the button REMOVES it (toggle behavior)
      await deleteLog(todayStr, 'shampoo');
    } else {
      // Otherwise, add today's log
      await addLog(todayStr, 'shampoo');
    }
  };

  // ── Get computed values to display ──
  const daysAgo  = getDaysAgo();
  const lastDate = getLastShampooDate();

  // ── Format the "Last Activity" text ──
  // This function returns a human-friendly string like "Today", "2 days ago", etc.
  const formatLastActivity = () => {
    if (daysAgo === null) return 'Never';   // No logs at all
    if (daysAgo === 0)    return 'Today';   // Logged today
    if (daysAgo === 1)    return '1 day ago';
    return `${daysAgo} days ago`;            // 2+ days
  };

  // ── Format the full date (e.g., "Monday, January 15, 2024") ──
  const formatFullDate = () => {
    if (!lastDate) return '';  // No last date to show

    // Intl.DateTimeFormat is a built-in JavaScript tool for formatting dates
    // 'en-US' = English, United States format
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',   // "Monday"
      year: 'numeric',   // "2024"
      month: 'long',     // "January"
      day: 'numeric',    // "15"
    };
    return lastDate.toLocaleDateString('en-US', options);
  };

  // ── Format the average frequency ──
  // monthStats.avgFrequencyDays is the average number of days between washes.
  const formatAvgFrequency = () => {
    if (!monthStats || monthStats.avgFrequencyDays === null) return '-';
    return `${monthStats.avgFrequencyDays}d`;  // e.g., "3d" means "every 3 days"
  };

  // ── The JSX (visual structure) returned by this component ──
  // Everything inside "return (" is JSX — it describes what the screen looks like.
  return (
    // Main container: full screen height, gradient background, padding at bottom
    // for the BottomNav (which is "fixed" at the screen bottom)
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F7] to-[#EAF4EF] pb-24">

      {/* ── Header ── */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl text-neutral-800 mb-2">Welcome Back</h1>
        <p className="text-neutral-500">Track your hair care routine</p>
      </div>

      {/* ── Error Message (shown only if something went wrong) ── */}
      {/* The {error && (...)} pattern means: only render this if "error" is not null */}
      {error && (
        <div className="px-6 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-400 text-xs mt-1">
              Make sure the backend server is running on port 3001.
            </p>
          </div>
        </div>
      )}

      {/* ── Quick Log Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl text-neutral-800 mb-1">Quick Log</h2>
              <p className="text-sm text-neutral-500">
                {/* Show different hint text based on whether today is already logged */}
                {isTodayLogged ? 'Tap to unmark today' : 'Tap to mark today'}
              </p>
            </div>
            {/* Green circle with sparkles icon */}
            <div className="w-12 h-12 bg-[#A4C3B2] rounded-full flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>

          {/* The main action button */}
          <button
            onClick={handleQuickLog}
            disabled={isLoading}  // Disable while loading to prevent double-clicks
            className={`
              w-full text-white py-4 rounded-2xl transition-all shadow-md
              ${isTodayLogged
                ? 'bg-gradient-to-r from-[#6B9080] to-[#A4C3B2]'   // Filled when logged
                : 'bg-gradient-to-r from-[#6B9080] to-[#A4C3B2]'   // Same gradient
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
            `}
          >
            {/* Show different text based on state */}
            <span className="text-lg">
              {isLoading
                ? 'Loading...'
                : isTodayLogged
                  ? '✓ Logged Today'
                  : 'Shampooed Today'
              }
            </span>
          </button>
        </div>
      </div>

      {/* ── Log a Past Date Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {/* Header row — tap to expand/collapse the form */}
          <button
            onClick={() => setShowPastDateForm(prev => !prev)}
            className="w-full flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl text-neutral-800 mb-1 text-left">Log a Past Date</h2>
              <p className="text-sm text-neutral-500 text-left">Remembered a missed wash?</p>
            </div>
            {/* Rotate the + icon 45° when form is open (makes it look like ✕) */}
            <div
              className={`w-12 h-12 bg-[#CCE3DE] rounded-full flex items-center justify-center transition-transform ${showPastDateForm ? 'rotate-45' : ''}`}
            >
              <Plus size={24} className="text-[#6B9080]" />
            </div>
          </button>

          {/* The form — only shown when showPastDateForm is true */}
          {showPastDateForm && (
            <div className="mt-4">
              {/* Date picker input */}
              <input
                type="date"
                value={pastDate}
                // Don't allow selecting today (that's what Quick Log is for) or future dates
                max={(() => {
                  // Yesterday's date as YYYY-MM-DD
                  const y = new Date();
                  y.setDate(y.getDate() - 1);
                  return `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
                })()}
                onChange={e => setPastDate(e.target.value)}
                className="w-full border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-800 text-base mb-4 focus:outline-none focus:border-[#6B9080]"
              />

              {/* Show whether this date is already logged */}
              {isPastDateLogged && (
                <p className="text-sm text-[#6B9080] mb-3">
                  ✓ Already logged for this date — tap below to remove it.
                </p>
              )}

              {/* Submit button */}
              <button
                onClick={handlePastDateLog}
                disabled={isLoading || !pastDate}
                className={`w-full text-white py-4 rounded-2xl transition-all shadow-md text-lg
                  ${isPastDateLogged
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : 'bg-gradient-to-r from-[#6B9080] to-[#A4C3B2]'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                `}
              >
                {isLoading
                  ? 'Saving...'
                  : isPastDateLogged
                    ? 'Remove This Log'
                    : 'Log This Date'
                }
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Last Activity Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Calendar icon in a green circle */}
            <div className="w-12 h-12 bg-[#CCE3DE] rounded-full flex items-center justify-center flex-shrink-0">
              <CalendarIcon size={24} className="text-[#6B9080]" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm text-neutral-500 mb-1">Last Activity</h3>

              {/* Show "Loading..." while fetching, otherwise show the value */}
              <p className="text-2xl text-neutral-800 mb-1">
                {isLoading ? 'Loading...' : formatLastActivity()}
              </p>

              {/* Only show the full date if there is a last date */}
              {lastDate && !isLoading && (
                <p className="text-sm text-neutral-400">{formatFullDate()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Card ── */}
      {/* BUG FIX: These values were previously hardcoded as "2" and "3d". */}
      {/* Now they come from real data via monthStats (from the backend). */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg text-neutral-800 mb-4">This Month</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Total Washes stat */}
            <div className="bg-[#F5F9F7] rounded-2xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Total Washes</p>
              <p className="text-3xl text-neutral-800">
                {/* Show 0 while loading, then show real count */}
                {isLoading ? '–' : (monthStats?.totalWashes ?? 0)}
              </p>
            </div>

            {/* Average Frequency stat */}
            <div className="bg-[#F5F9F7] rounded-2xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Avg. Frequency</p>
              <p className="text-3xl text-neutral-800">
                {isLoading ? '–' : formatAvgFrequency()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      {/* This component is "fixed" at the bottom of the screen */}
      <BottomNav />
    </div>
  );
}
