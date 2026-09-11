const STORAGE_KEY = "kivoir:pathway";

// The patient's active care pathway is shared across the patient space through
// the URL, but that param is lost as soon as they navigate (back link, reload,
// re-entering the library). Persisting it keeps both spaces in sync regardless
// of the navigation path.
export function readStoredPathway(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeStoredPathway(id: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, disabled storage, etc.).
  }
}
