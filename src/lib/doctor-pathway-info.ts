import { conditions, type Condition } from "@/lib/conditions";
import { getPathwayGuide } from "@/lib/patient-guides";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";

/** "exercise" is a legacy kind: kept for stored data, never offered nor shown to patients. */
export type ResourceKind = "document" | "sheet" | "video" | "link" | "exercise";

export const resourceKindLabels: Record<ResourceKind, string> = {
  video: "Vidéo",
  document: "Document",
  sheet: "Fiche pédagogique",
  link: "Lien utile",
  exercise: "Ancien exercice · non publié",
};

export const selectableResourceKinds: ResourceKind[] = ["video", "document", "link"];

export function resourceKind(resource: Pick<DoctorResourceRecord, "kind" | "contentType" | "filename">): ResourceKind {
  if (resource.kind === "sheet") return "document";
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
  lastValidatedAt: string | null;
};

/** Compte les contenus réels du parcours : contenus Kivoir + ressources visibles du médecin (hors anciens exercices). */
export function getPathwayStats(conditionId: string, doctorResources: DoctorResourceRecord[]): PathwayStats {
  const guide = getPathwayGuide(conditionId);
  const own = doctorResources.filter(
    (resource) => resource.conditionId === conditionId && resource.status === "active" && resourceKind(resource) !== "exercise",
  );
  const ownKinds = own.map(resourceKind);
  const dates = [
    ...(guide?.recommendations ?? []).map((item) => item.validatedAt),
    ...own.map((resource) => resource.validatedAt ?? undefined),
  ].filter((value): value is string => Boolean(value));
  dates.sort();
  return {
    recommendations: guide?.recommendations.length ?? 0,
    warnings: guide?.warnings.length ?? 0,
    documents: ownKinds.filter((kind) => kind === "document" || kind === "sheet").length,
    videos: (guide?.videos.length ?? 0) + ownKinds.filter((kind) => kind === "video").length,
    lastValidatedAt: dates.at(-1) ?? null,
  };
}

export function findCondition(id: string | undefined): Condition | undefined {
  return conditions.find((condition) => condition.id === id);
}

type DoctorIdentity = { id?: string | undefined; name?: string | undefined } | null | undefined;

/** QR public générique : uniquement l'identifiant public du cabinet et le parcours. */
export function buildPatientLink(origin: string, pathway: string, doctor: DoctorIdentity) {
  const params = new URLSearchParams({ pathway });
  if (doctor?.id) params.set("ref", doctor.id);
  return `${origin}/p/${encodeURIComponent(pathway)}?${params.toString()}`;
}

/** Ouvre l'espace patient en mode prévisualisation sans stockage navigateur. */
export function openPatientPreview(pathway: string, doctor: DoctorIdentity, section = "") {
  const condition = findCondition(pathway);
  if (!condition) return;
  const params = new URLSearchParams({ pathway });
  if (doctor?.id) params.set("ref", doctor.id);
  window.location.assign(`/patient${section}?${params.toString()}`);
}

export function doctorGreetingName(name: string | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return /^(dr|docteur)\.?\s/i.test(trimmed) ? trimmed : `Dr ${trimmed}`;
}
