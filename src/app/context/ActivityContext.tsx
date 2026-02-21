// ─── src/app/context/ActivityContext.tsx ─────────────────────────────────────
//
// WHAT IS THIS FILE?
// This file manages all the "activity log" data for our app.
// It uses React's "Context" system to share data with every component
// without having to pass data through every level manually.
//
// WHAT IS "CONTEXT"?
// Imagine you have a big family (React components = family members).
// Grandparent → Parent → Child → Grandchild
//
// Without Context: Grandparent passes data → Parent → Child → Grandchild
//   (lots of "prop drilling" - passing data through components that don't need it)
//
// With Context: Grandparent puts data in a "shared box" (Context).
//   Any family member can reach into that box directly.
//
// WHAT IS "STATE"?
// State is data that can CHANGE over time, and when it changes,
// React automatically updates the screen to reflect the new data.
// Example: the list of logs is "state" - it changes when you add/delete a log.
//
// WHAT IS "async/await"?
// When we fetch data from the backend, it takes time. "async/await" lets us
// wait for the data without freezing the whole app.
//
// ─────────────────────────────────────────────────────────────────────────────

// Import React tools:
//   createContext = creates a "shared data box"
//   useContext    = lets a component "reach into" the shared box
//   useState      = creates a piece of state (data that can change)
//   useEffect     = runs code when something happens (like when the component loads)
//   ReactNode     = TypeScript type for "anything React can display"
//   useCallback   = memoizes a function so it doesn't get recreated every render
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

// Import our API client functions (these talk to the backend)
import {
  getAllLogs,
  addLog as apiAddLog,
  deleteLog as apiDeleteLog,
  clearAllLogs as apiClearAllLogs,
  getMonthStats,
  ActivityLog,
  MonthStats
} from '../api/client';

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
// TypeScript interfaces define the "shape" of our data.
// They're like contracts: "this object MUST have these fields".

/** What data and functions are available via this Context */
interface ActivityContextType {
  // ── Data ──
  logs: ActivityLog[];          // All activity log entries from the database
  isLoading: boolean;           // true while fetching data from the backend
  error: string | null;         // Error message if something went wrong, null otherwise
  monthStats: MonthStats | null; // Statistics for the current month

  // ── Actions (functions that change data) ──
  addLog: (date: string, activity: string) => Promise<void>;
  deleteLog: (date: string, activity: string) => Promise<void>;
  clearAllLogs: () => Promise<void>;
  refreshLogs: () => Promise<void>;  // Force re-fetch all data from server

  // ── Computed values (derived from logs) ──
  getLastShampooDate: () => Date | null;
  getDaysAgo: () => number | null;
  isDateLogged: (date: Date) => boolean;
}

// ─── CREATE THE CONTEXT ───────────────────────────────────────────────────────
// Create a Context with an initial value of "undefined".
// We'll always use it inside the ActivityProvider (which sets the real value),
// so the undefined initial value is never actually used.
const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// ─── ACTIVITY PROVIDER COMPONENT ─────────────────────────────────────────────
//
// This is a React component that "provides" (makes available) the context data
// to all of its children. It wraps our entire app in Root.tsx.
//
// { children }: { children: ReactNode } is TypeScript syntax for saying:
//   "this component accepts child elements (other components inside it)"
//
export function ActivityProvider({ children }: { children: ReactNode }) {

  // ── STATE VARIABLES ──────────────────────────────────────────────────────
  // useState<Type>(initialValue) creates a state variable.
  // It returns [currentValue, setterFunction]:
  //   - currentValue = the current value of the state
  //   - setterFunction = call this to change the value (React then re-renders)

  // The list of all activity logs (starts empty, loaded from server on mount)
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Whether we're currently loading data from the server
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Any error message (null = no error)
  const [error, setError] = useState<string | null>(null);

  // Monthly statistics (null until loaded)
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null);

  // ── LOAD ALL LOGS FROM SERVER ─────────────────────────────────────────────
  //
  // useCallback wraps a function and makes sure the same function reference
  // is used across re-renders (performance optimization).
  // The [] at the end means "this function never needs to be recreated".
  //
  const refreshLogs = useCallback(async () => {
    // Set loading to true so the UI can show a loading spinner
    setIsLoading(true);
    // Clear any previous error
    setError(null);

    try {
      // Call our API client to fetch all logs from the backend.
      // "await" pauses here until the server responds.
      const fetchedLogs = await getAllLogs();
      setLogs(fetchedLogs);

      // Also load monthly stats for the current month
      const now = new Date();
      const stats = await getMonthStats(now.getFullYear(), now.getMonth() + 1);
      setMonthStats(stats);

    } catch (err) {
      // Something went wrong (server down, network error, etc.)
      // err instanceof Error checks if "err" is a JavaScript Error object
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load activity logs:', message);
      setError('Could not connect to the server. Make sure the backend is running.');
    } finally {
      // "finally" runs whether the try block succeeded OR failed.
      // We always want to stop the loading spinner.
      setIsLoading(false);
    }
  }, []);  // Empty array = this function is created once and never recreated

  // ── RUN ON COMPONENT MOUNT ────────────────────────────────────────────────
  //
  // useEffect(fn, []) runs the function ONCE when this component first appears.
  // This is how we load initial data from the server.
  // The [] means "only run once" (not every time anything changes).
  //
  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);  // refreshLogs is in the dependency array as required by React

  // ── ACTION: ADD A LOG ─────────────────────────────────────────────────────
  //
  // This is an "async" function because it communicates with the server.
  // When called, it:
  //   1. Saves the log to the server/database
  //   2. Updates our local list of logs
  //
  const addLog = useCallback(async (date: string, activity: string) => {
    try {
      // Tell the backend to save this log
      await apiAddLog(date, activity);

      // After adding, refresh all data from the server
      // (this also updates monthStats)
      await refreshLogs();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to add log:', message);
      setError('Failed to save your activity. Please try again.');
    }
  }, [refreshLogs]);

  // ── ACTION: DELETE A LOG ──────────────────────────────────────────────────
  const deleteLog = useCallback(async (date: string, activity: string) => {
    try {
      await apiDeleteLog(date, activity);
      await refreshLogs();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete log:', message);
      setError('Failed to delete log. Please try again.');
    }
  }, [refreshLogs]);

  // ── ACTION: CLEAR ALL LOGS ────────────────────────────────────────────────
  const clearAllLogs = useCallback(async () => {
    try {
      await apiClearAllLogs();
      // Reset state immediately for instant UI feedback
      setLogs([]);
      setMonthStats(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to clear logs:', message);
      setError('Failed to clear data. Please try again.');
    }
  }, []);

  // ── COMPUTED: GET LAST SHAMPOO DATE ──────────────────────────────────────
  //
  // This function looks through the logs array and finds the most recent
  // entry where activity === 'shampoo'. It returns it as a Date object.
  //
  // Returns null if there are no shampoo logs at all.
  //
  const getLastShampooDate = useCallback((): Date | null => {
    // Filter = keep only logs where activity is 'shampoo'
    const shampooLogs = logs.filter(log => log.activity === 'shampoo');
    if (shampooLogs.length === 0) return null;

    // The logs are already sorted newest-first from the server,
    // but let's sort again just to be safe.
    const sorted = [...shampooLogs].sort((a, b) =>
      b.date.localeCompare(a.date)  // localeCompare compares strings alphabetically
    );

    // Parse the date string "YYYY-MM-DD" into a Date object.
    // IMPORTANT: We add 'T12:00:00' (noon) to avoid timezone issues.
    // Without this, 'new Date("2024-01-15")' is parsed as midnight UTC,
    // which might show as January 14 in timezones behind UTC (like US timezones).
    return new Date(sorted[0].date + 'T12:00:00');
  }, [logs]);

  // ── COMPUTED: GET DAYS AGO ────────────────────────────────────────────────
  //
  // Calculates how many days ago the last shampoo was.
  // Returns null if never logged, 0 if today, 1 for yesterday, etc.
  //
  const getDaysAgo = useCallback((): number | null => {
    const lastDate = getLastShampooDate();
    if (!lastDate) return null;

    // Get today at midnight (start of day) for fair comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set hours, minutes, seconds, milliseconds to 0

    // Also set lastDate to noon to compare just the date, not the time
    const lastDateNoon = new Date(lastDate);
    lastDateNoon.setHours(12, 0, 0, 0);

    // Calculate difference in milliseconds, then convert to days
    // 1000 ms = 1 second, 60 seconds = 1 minute, 60 minutes = 1 hour, 24 hours = 1 day
    const diffMs   = today.getTime() - lastDateNoon.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Return 0 if it was today or "tomorrow" due to any floating point rounding
    return Math.max(0, diffDays);
  }, [getLastShampooDate]);

  // ── COMPUTED: IS DATE LOGGED ──────────────────────────────────────────────
  //
  // Checks if a given date has a shampoo log.
  // Used by the Calendar view to highlight shampooed days.
  //
  const isDateLogged = useCallback((date: Date): boolean => {
    // Convert the Date object to "YYYY-MM-DD" format for comparison.
    // We use local date parts (getFullYear, getMonth, getDate) instead of
    // toISOString() to avoid the UTC timezone bug mentioned above.
    const year  = date.getFullYear();
    // getMonth() returns 0-11 (0 = January), so we add 1
    const month = String(date.getMonth() + 1).padStart(2, '0');  // e.g., "01", "12"
    const day   = String(date.getDate()).padStart(2, '0');         // e.g., "05", "31"
    const dateStr = `${year}-${month}-${day}`;  // e.g., "2024-01-15"

    // "some" returns true if AT LEAST ONE log matches the condition
    return logs.some(log => log.date === dateStr && log.activity === 'shampoo');
  }, [logs]);

  // ─── PROVIDE THE CONTEXT VALUE ────────────────────────────────────────────
  //
  // We bundle all our data and functions into one object and make it
  // available to all child components via ActivityContext.Provider.
  //
  return (
    <ActivityContext.Provider
      value={{
        // Data
        logs,
        isLoading,
        error,
        monthStats,
        // Actions
        addLog,
        deleteLog,
        clearAllLogs,
        refreshLogs,
        // Computed values
        getLastShampooDate,
        getDaysAgo,
        isDateLogged,
      }}
    >
      {/* Render all child components inside this provider */}
      {children}
    </ActivityContext.Provider>
  );
}

// ─── CUSTOM HOOK: useActivity ─────────────────────────────────────────────────
//
// WHAT IS A HOOK?
// A "hook" is a special React function (starts with "use") that gives
// components access to React features like state and context.
//
// This hook makes it easy for any component to access our activity data:
//   const { logs, addLog, getDaysAgo } = useActivity();
//
// It also includes a safety check: if you accidentally use useActivity()
// outside of the ActivityProvider, it throws an error with a helpful message
// instead of silently breaking.
//
export function useActivity() {
  const context = useContext(ActivityContext);

  // If context is undefined, we're outside the Provider (a programming mistake)
  if (context === undefined) {
    throw new Error(
      'useActivity() must be used inside <ActivityProvider>. ' +
      'Make sure your component is a child of ActivityProvider.'
    );
  }

  return context;
}
