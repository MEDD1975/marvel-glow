const STORAGE_KEY = "kivoir:pathway";
const OWNER_STORAGE_KEY = "kivoir:pathway-owner";

type PathwayOwnership = Record<string, string>;

function readOwnership(): PathwayOwnership {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OWNER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed as PathwayOwnership : {};
  } catch {
    return {};
  }
}

export function readPathwayOwner(conditionId: string | undefined): string | undefined {
  return conditionId ? readOwnership()[conditionId] : undefined;
}

export function claimPathway(conditionId: string | undefined, doctorId: string | undefined): string | undefined {
  if (!conditionId || !doctorId || typeof window === "undefined") return doctorId;
  const ownership = readOwnership();
  const ownerId = ownership[conditionId];
  if (ownerId) return ownerId;
  try {
    window.localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify({ ...ownership, [conditionId]: doctorId }));
  } catch {
    // Ignore storage errors (private mode, disabled storage, etc.).
  }
  return doctorId;
}

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
