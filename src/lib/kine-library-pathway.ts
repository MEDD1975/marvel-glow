import { conditions } from "@/lib/conditions";

export const DEFAULT_KINE_LIBRARY_PATHWAY = "entorse-cheville";

const STORAGE_KEY = "kivoir:kine-library-pathway";

export function getKineLibraryPathwaySelection() {
  if (typeof window === "undefined") return undefined;

  try {
    const pathwayId = window.sessionStorage.getItem(STORAGE_KEY);
    return conditions.some((condition) => condition.id === pathwayId) ? pathwayId : undefined;
  } catch {
    return undefined;
  }
}

export function setKineLibraryPathwaySelection(pathwayId: string) {
  if (typeof window === "undefined" || !conditions.some((condition) => condition.id === pathwayId))
    return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, pathwayId);
  } catch {
    return;
  }
}
