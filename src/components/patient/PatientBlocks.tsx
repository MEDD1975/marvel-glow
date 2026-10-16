import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import { ValidationNote } from "@/components/patient/PatientUi";
import type { ResourceLink } from "@/lib/condition-resources";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import type { PathwayGuide } from "@/lib/patient-guides";
import { formatTitle, resourceDisplayTitle } from "@/lib/typography";

export function BackToHome() {
  return (
    <Link
      to="/patient"
      className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Retour à mon espace patient
    </Link>
  );
}

export function PatientPageHeader({
  title,
  intro,
  pathwayName,
}: {
  title: string;
  intro?: string;
  pathwayName?: string | undefined;
}) {
  return (
    <div>
      <BackToHome />
      <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      {intro ? (
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
      {pathwayName ? (
        <p className="mt-3 inline-flex rounded-full bg-tone-blue px-2.5 py-0.5 text-[13px] font-medium text-care">{`Parcours : ${pathwayName}`}</p>
      ) : null}
    </div>
  );
}

export function CompactLinks({
  title,
  links,
}: {
  title?: string;
  links: Array<{ to: string; label: string }>;
}) {
  return (
    <nav
      aria-label={title ?? "Autres rubriques"}
      className="rounded-2xl border border-border bg-card p-4"
    >
      {title ? <h2 className="text-sm font-semibold text-foreground">{title}</h2> : null}
      <ul className={`${title ? "mt-2" : ""} flex flex-col divide-y divide-border`}>
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex min-h-11 items-center justify-between gap-3 text-sm font-medium text-care hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function resourceFormat(resource: DoctorResourceRecord) {
  const type = resource.contentType ?? "";
  if (type.startsWith("video/")) return { label: "Vidéo", icon: Play };
  if (type.startsWith("image/")) return { label: "Image", icon: ImageIcon };
  if (type === "application/pdf" || resource.filename?.toLowerCase().endsWith(".pdf"))
    return { label: "PDF", icon: FileText };
  if (!type && resource.url) return { label: "Lien", icon: ExternalLink };
  return { label: "Document", icon: FileText };
}

export function DoctorResourceRow({ resource }: { resource: DoctorResourceRecord }) {
  const format = resourceFormat(resource);
  const Icon = format.icon;
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tone-blue text-care">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">
          {resourceDisplayTitle(resource.title)}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[format.label, "Partagé par votre médecin", resource.source].filter(Boolean).join(" · ")}
        </span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
    </a>
  );
}

export type PatientVideo = {
  key: string;
  title: string;
  url: string;
  thumbnailUrl?: string | undefined;
  source?: string | null | undefined;
};

export function videoFromLink(video: ResourceLink): PatientVideo {
  return {
    key: video.url,
    title: formatTitle(video.label),
    url: video.url,
    thumbnailUrl: video.videoId
      ? `https://i.ytimg.com/vi/${encodeURIComponent(video.videoId)}/hqdefault.jpg`
      : undefined,
    source: video.source,
  };
}

export function videoFromResource(resource: DoctorResourceRecord): PatientVideo {
  return {
    key: resource.id,
    title: resourceDisplayTitle(resource.title),
    url: resource.url,
    source: resource.source,
  };
}

export function VideoCard({ video }: { video: PatientVideo }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const showThumbnail = Boolean(video.thumbnailUrl) && !thumbnailFailed;
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4EAF2] bg-card transition-colors hover:border-[#0B63CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative block aspect-video w-full overflow-hidden bg-[#EEF4FC]">
        {showThumbnail ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            onError={() => setThumbnailFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="absolute inset-0 bg-gradient-to-br from-[#F4F8FD] to-[#E3EDFA]"
            aria-hidden="true"
          />
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center ${showThumbnail ? "bg-[#0F1B2D]/15" : ""}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#0B63CE] shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-105">
            <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-base font-semibold leading-snug text-foreground">{video.title}</span>
        <span className="text-sm text-muted-foreground">
          Vidéo · Sélectionnée par votre médecin
        </span>
        {video.source ? (
          <span className="text-xs text-muted-foreground">Source : {video.source}</span>
        ) : null}
      </span>
      <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
    </a>
  );
}

export function VideoCautionNote() {
  return (
    <p className="rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      Contenus pédagogiques sélectionnés pour ce parcours. Les vidéos ne remplacent pas les
      consignes données par un professionnel de santé.
    </p>
  );
}

export function SourcesList({
  links,
  title = "Sources complémentaires",
}: {
  links: ResourceLink[];
  title?: string;
}) {
  if (!links.length) return null;
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{link.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{link.source}</span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
