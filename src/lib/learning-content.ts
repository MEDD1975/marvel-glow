import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import type { ResourceLink } from "@/lib/condition-resources";

const VIDEO_HOSTS =
  /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|dailymotion\.com|dai\.ly)$/i;
const VIDEO_FILE = /\.(mp4|webm|mov|m4v|ogv)$/i;

function parseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * A resource is shown as a video only when it is actually playable: an uploaded video file
 * or a link to a video platform. Web pages tagged with the generic "video/*" type are links.
 */
export function isPlayableVideo(resource: Pick<DoctorResourceRecord, "url" | "contentType">) {
  const type = resource.contentType ?? "";
  if (type.startsWith("video/") && type !== "video/*") return true;
  const url = parseUrl(resource.url);
  return Boolean(url && (VIDEO_HOSTS.test(url.hostname) || VIDEO_FILE.test(url.pathname)));
}

export function youtubeThumbnail(rawUrl: string) {
  const url = parseUrl(rawUrl);
  if (!url) return undefined;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
  else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    id =
      url.searchParams.get("v") ??
      url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ??
      null;
  }
  return id && /^[\w-]{6,}$/.test(id) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

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
export function countLearningContent(
  guide: LearningSource | null | undefined,
  resources: DoctorResourceRecord[] = [],
): LearningCounts {
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
    if (isPlayableVideo(resource)) add(resource.url, "videos");
    else if (
      resource.kind === "link" ||
      resource.kind === "video" ||
      resource.contentType === "video/*"
    )
      add(resource.url, "links");
    else if (resource.kind === "sheet") add(resource.url, "sheets");
    else add(resource.url, "documents");
  }
  for (const video of guide?.videos ?? []) add(video.url, "videos");
  for (const link of guide?.sources ?? [])
    add(link.url, link.kind === "video" ? "videos" : "links");

  return counts;
}

export function totalLearningContent(counts: LearningCounts) {
  return counts.videos + counts.documents + counts.sheets + counts.links;
}

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count > 1 ? pluralForm : singular}`;

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
