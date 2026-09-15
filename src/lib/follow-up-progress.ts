// Patient progress through the follow-up steps is anonymous and device-local.
// Kivoir stores no health data server-side, so a patient's advancement lives
// only in their own browser (localStorage), keyed per care pathway.
const PREFIX = "kivoir:follow-up:";

export type FollowUpProgress = {
  completedStepIds: string[];
};

const EMPTY: FollowUpProgress = { completedStepIds: [] };

function key(conditionId: string) {
  return `${PREFIX}${conditionId}`;
}

export function readFollowUpProgress(conditionId: string): FollowUpProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key(conditionId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<FollowUpProgress>;
    return { completedStepIds: Array.isArray(parsed.completedStepIds) ? parsed.completedStepIds.filter((id): id is string => typeof id === "string") : [] };
  } catch {
    return EMPTY;
  }
}

export function writeFollowUpProgress(conditionId: string, progress: FollowUpProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(conditionId), JSON.stringify(progress));
  } catch {
    // Ignore storage errors (private mode, disabled storage, etc.).
  }
}
