// ─── src/app/components/CalendarView.tsx ─────────────────────────────────────
//
// WHAT IS THIS FILE?
// This is the Calendar screen of the app.
// It shows a monthly calendar where:
//   • Dates you shampooed are highlighted in green
//   • Today is highlighted in a darker green
//   • You can navigate between months with arrow buttons
//
// WHAT IS "STATE" IN THIS COMPONENT?
// This component has one piece of state: "currentDate" — which month is being shown.
// When you click the left/right arrows, currentDate changes, and React
// automatically re-renders the calendar to show the new month.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useActivity } from '../context/ActivityContext';
import { BottomNav } from './BottomNav';

export function CalendarView() {

  // currentDate tracks which month/year we're currently viewing.
  // useState(new Date()) initializes it to today.
  // When we click the arrows, setCurrentDate() is called with a new date.
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the isDateLogged function from our context
  const { isDateLogged } = useActivity();

  // ── Helper: How many days in a given month? ──
  // Example: getDaysInMonth(2024, 1) = 31 (January has 31 days)
  //
  // TRICK: new Date(year, month+1, 0) gives the last day of the month.
  // day=0 means "the day before the 1st of the next month" = last day of current month.
  const getDaysInMonth = (date: Date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();       // 0-11 (0 = January)
    return new Date(year, month + 1, 0).getDate();  // .getDate() returns day number
  };

  // ── Helper: What day of the week does the month start on? ──
  // Returns 0 (Sunday) through 6 (Saturday).
  // We use this to add blank spaces before the first day of the month.
  // Example: If January starts on a Wednesday, we add 3 empty spaces.
  const getFirstDayOfMonth = (date: Date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();  // .getDay() returns 0-6
  };

  // ── Navigation: Go to previous month ──
  const goToPreviousMonth = () => {
    // new Date(year, month - 1) automatically handles month rollover.
    // Example: new Date(2024, -1) = December 2023
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // ── Navigation: Go to next month ──
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Arrays of month and day names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ── Build the calendar grid ──
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay    = getFirstDayOfMonth(currentDate);

  // Array of day numbers: [1, 2, 3, ..., 30] or [1, ..., 31] etc.
  // Array.from({ length: N }, (_, i) => i + 1) creates [1, 2, 3, ..., N]
  const days      = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Array of "empty" placeholders before day 1
  // Example: if firstDay = 3 (Wednesday), we need [0, 1, 2] (3 empty cells)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // ── Helper: Is this day "today"? ──
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate()                       &&  // Same day number
      currentDate.getMonth() === today.getMonth()   &&  // Same month
      currentDate.getFullYear() === today.getFullYear()  // Same year
    );
  };

  // ── Helper: Does this day have a shampoo log? ──
  const hasActivity = (day: number): boolean => {
    // Create a Date object for this specific day in the current month/year
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isDateLogged(date);  // Check against our logs
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F7] to-[#EAF4EF] pb-24">

      {/* ── Header ── */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl text-neutral-800 mb-2">Activity Calendar</h1>
        <p className="text-neutral-500">Your shampoo tracking history</p>
      </div>

      {/* ── Calendar Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">

          {/* Month Navigation (left arrow — month name — right arrow) */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 rounded-xl bg-[#F5F9F7] flex items-center justify-center hover:bg-[#E0EFE8] transition-colors"
              aria-label="Previous month"  // accessibility label for screen readers
            >
              <ChevronLeft size={20} className="text-neutral-600" />
            </button>

            <h2 className="text-xl text-neutral-800">
              {/* Show current month name + year, e.g., "January 2024" */}
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <button
              onClick={goToNextMonth}
              className="w-10 h-10 rounded-xl bg-[#F5F9F7] flex items-center justify-center hover:bg-[#E0EFE8] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} className="text-neutral-600" />
            </button>
          </div>

          {/* Day Name Headers (Sun, Mon, Tue, ...) */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {/* .map() iterates over each item in the array and returns JSX for each */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs text-neutral-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          {/* grid-cols-7 = 7 columns (one per day of the week) */}
          <div className="grid grid-cols-7 gap-2">

            {/* Empty cells before day 1 (to align the first day correctly) */}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* One cell per day of the month */}
            {days.map(day => {
              const logged = hasActivity(day);  // Does this day have a shampoo log?
              const today  = isToday(day);       // Is this day today?

              return (
                <div
                  key={day}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center relative
                    ${today  ? 'bg-[#6B9080] text-white'  : 'text-neutral-700'}
                    ${logged && !today ? 'bg-[#CCE3DE]' : ''}
                    ${!logged && !today ? 'hover:bg-[#F5F9F7]' : ''}
                    transition-colors
                  `}
                  // aria-label provides accessible description for screen readers
                  aria-label={`${day}${logged ? ', shampooed' : ''}${today ? ', today' : ''}`}
                >
                  {/* The day number */}
                  <span className="text-sm">{day}</span>

                  {/* Small dot indicator if this day was logged */}
                  {logged && (
                    <div
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        today ? 'bg-white' : 'bg-[#6B9080]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Legend (color key) ── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg text-neutral-800 mb-4">Legend</h3>
          <div className="space-y-3">
            {/* Shampoo day indicator */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#CCE3DE] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6B9080]" />
              </div>
              <span className="text-sm text-neutral-600">Shampoo day</span>
            </div>
            {/* Today indicator */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6B9080] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="text-sm text-neutral-600">Today</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
