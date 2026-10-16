import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import type { ResourceLink } from "@/lib/condition-resources";

export type LearningCounts = { videos: number; documents: number; sheets: number; links: number };

type LearningSource = {
  videos?: ResourceLink[];
  sources?: ResourceLink[];
};

/**
 * Counts educational content attached to the open pathway: curated pathway videos/links
 * plus the doctor's active resources (the API already excludes hidden/deleted ones).
 * Exercises are never counted. Each URL is counted once.
 */
export function countLearningContent(guide: LearningSource | null | undefined, resources: DoctorResourceRecord[] = []): LearningCounts {
  const seen = new Set<string>();
  const counts: LearningCounts = { videos: 0, documents: 0, sheets: 0, links: 0 };
  const add = (url: string, category: keyof LearningCounts) => {
    const key = url.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    counts[category] += 1;
  };

  for (const resource of resources) {
    if (resource.status !== "active" || resource.kind === "exercise") continue;
    if (resource.kind === "video" || resource.contentType?.startsWith("video/")) add(resource.url, "videos");
    else if (resource.kind === "link") add(resource.url, "links");
    else if (resource.kind === "sheet") add(resource.url, "sheets");
    else add(resource.url, "documents");
  }
  for (const video of guide?.videos ?? []) add(video.url, "videos");
  for (const link of guide?.sources ?? []) add(link.url, link.kind === "video" ? "videos" : "links");

  return counts;
}

export function totalLearningContent(counts: LearningCounts) {
  return counts.videos + counts.documents + counts.sheets + counts.links;
}

const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count > 1 ? pluralForm : singular}`;

export function formatLearningSummary(counts: LearningCounts) {
  const parts = [
    counts.videos ? plural(counts.videos, "vidéo", "vidéos") : null,
    counts.documents ? plural(counts.documents, "document", "documents") : null,
    counts.sheets ? plural(counts.sheets, "fiche pédagogique", "fiches pédagogiques") : null,
    counts.links ? plural(counts.links, "lien utile", "liens utiles") : null,
  ].filter(Boolean) as string[];
  if (parts.length === 1) {
    const total = totalLearningContent(counts);
    return `${parts[0]} disponible${total > 1 ? "s" : ""}`;
  }
  return parts.join(" · ");
}
