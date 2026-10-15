import { conditions, type Condition } from "@/lib/conditions";
import { getPathwayGuide } from "@/lib/patient-guides";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";

export type ResourceKind = "document" | "video" | "exercise" | "link";

export const resourceKindLabels: Record<ResourceKind, string> = {
  document: "Document",
  video: "Vidéo",
  exercise: "Exercice",
  link: "Lien",
};

export function resourceKind(resource: Pick<DoctorResourceRecord, "kind" | "contentType" | "filename">): ResourceKind {
  if (resource.kind === "document" || resource.kind === "video" || resource.kind === "exercise" || resource.kind === "link") return resource.kind;
  const type = resource.contentType ?? "";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf" || type.startsWith("image/") || resource.filename) return "document";
  return "link";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export type PathwayStats = {
  recommendations: number;
  warnings: number;
  documents: number;
  videos: number;
  exercises: number;
  lastValidatedAt: string | null;
};

/** Compte les contenus réels du parcours : contenus Kivoir + ressources visibles du médecin. */
export function getPathwayStats(conditionId: string, doctorResources: DoctorResourceRecord[]): PathwayStats {
  const guide = getPathwayGuide(conditionId);
  const own = doctorResources.filter((resource) => resource.conditionId === conditionId && resource.status === "active");
  const ownKinds = own.map(resourceKind);
  const dates = [
    ...(guide?.recommendations ?? []).map((item) => item.validatedAt),
    ...(guide?.exercises ?? []).map((item) => item.validatedAt),
    ...own.map((resource) => resource.validatedAt ?? undefined),
  ].filter((value): value is string => Boolean(value));
  dates.sort();
  return {
    recommendations: guide?.recommendations.length ?? 0,
    warnings: guide?.warnings.length ?? 0,
    documents: ownKinds.filter((kind) => kind === "document").length,
    videos: (guide?.videos.length ?? 0) + ownKinds.filter((kind) => kind === "video").length,
    exercises: (guide?.exercises.length ?? 0) + ownKinds.filter((kind) => kind === "exercise").length,
    lastValidatedAt: dates.at(-1) ?? null,
  };
}

export function findCondition(id: string | undefined): Condition | undefined {
  return conditions.find((condition) => condition.id === id);
}

type DoctorIdentity = { id?: string | undefined; name?: string | undefined } | null | undefined;

/** Lien encodé dans le QR : mécanisme historique /p/[parcours]?ref=…&doctorName=…&note=… conservé tel quel. */
export function buildPatientLink(origin: string, pathway: string, doctor: DoctorIdentity, note: string) {
  const noteParam = note.trim() ? `&note=${encodeURIComponent(note.trim())}` : "";
  const doctorIdParam = doctor?.id ? `?ref=${encodeURIComponent(doctor.id)}` : "";
  const doctorNameParam = doctor?.name ? `${doctorIdParam ? "&" : "?"}doctorName=${encodeURIComponent(doctor.name)}` : "";
  return `${origin}/p/${encodeURIComponent(pathway)}${doctorIdParam}${doctorNameParam}${noteParam}`;
}

export const PREVIEW_STORAGE_KEY = "kivoir-doctor-preview";

export type DoctorPreview = { pathway: string; pathwayName: string; patientLink: string };

/**
 * Ouvre l'espace patient en mode prévisualisation, sans passer par /p/ pour ne pas
 * comptabiliser de scan anonyme.
 */
export function openPatientPreview(pathway: string, doctor: DoctorIdentity, section = "") {
  const condition = findCondition(pathway);
  if (!condition) return;
  const params = new URLSearchParams({ pathway });
  if (doctor?.id) params.set("ref", doctor.id);
  if (doctor?.name) params.set("doctorName", doctor.name);
  const preview: DoctorPreview = {
    pathway,
    pathwayName: condition.name,
    patientLink: `/patient?${params.toString()}`,
  };
  window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(preview));
  window.location.assign(`/patient${section}?${params.toString()}`);
}

export function readDoctorPreview(): DoctorPreview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DoctorPreview) : null;
  } catch {
    return null;
  }
}

export function clearDoctorPreview() {
  window.sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
}

export function doctorGreetingName(name: string | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return /^(dr|docteur)\.?\s/i.test(trimmed) ? trimmed : `Dr ${trimmed}`;
}
