import { useSyncExternalStore } from "react";

/**
 * Reader preference for wrapping long lines in code blocks.
 *
 * One preference is shared by every code block on the page and remembered in
 * the browser, so a reader chooses once instead of once per block.
 */
export const CODE_WRAP_STORAGE_KEY = "markdown-flow-ui:code-wrap";

const WRAP_VALUE = "1";
const NO_WRAP_VALUE = "0";

const listeners = new Set<() => void>();
// Stands in for the stored choice while browser storage is unavailable.
let memoryValue: boolean | null = null;

const readStoredPreference = (): boolean | null => {
  try {
    const stored = window.localStorage.getItem(CODE_WRAP_STORAGE_KEY);
    if (stored === WRAP_VALUE) return true;
    if (stored === NO_WRAP_VALUE) return false;
  } catch {
    // Private mode or blocked site data: fall back to the in-memory choice.
  }
  return null;
};

const getSnapshot = (): boolean =>
  readStoredPreference() ?? memoryValue ?? false;

// Server and hydration render the unwrapped default; the stored choice applies
// right after hydration without a markup mismatch.
const getServerSnapshot = (): boolean => false;

const handleStorageEvent = (event: StorageEvent) => {
  if (event.key !== null && event.key !== CODE_WRAP_STORAGE_KEY) return;
  // Another tab changed or cleared the preference; follow it.
  memoryValue = null;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorageEvent);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

export const getCodeWrapPreference = (): boolean =>
  typeof window === "undefined" ? false : getSnapshot();

const toggleListeners = new Set<(wrap: boolean) => void>();

/**
 * Observes a reader switching line wrapping with the code block button in this
 * page. Programmatic changes and changes made in other tabs are not reported.
 */
export const subscribeCodeWrapToggle = (
  listener: (wrap: boolean) => void
): (() => void) => {
  toggleListeners.add(listener);
  return () => {
    toggleListeners.delete(listener);
  };
};

/** Applies the reader's button press and reports it to toggle observers. */
export const toggleCodeWrapPreference = (): void => {
  const wrap = !getCodeWrapPreference();
  setCodeWrapPreference(wrap);
  toggleListeners.forEach((listener) => {
    try {
      listener(wrap);
    } catch (error) {
      // An observer failure must not undo the reader's choice.
      console.error("Code wrap toggle observer failed: ", error);
    }
  });
};

export const setCodeWrapPreference = (wrap: boolean): void => {
  memoryValue = wrap;
  try {
    window.localStorage.setItem(
      CODE_WRAP_STORAGE_KEY,
      wrap ? WRAP_VALUE : NO_WRAP_VALUE
    );
  } catch {
    // The in-memory choice still applies for this page.
  }
  listeners.forEach((listener) => listener());
};

export const useCodeWrapPreference = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
