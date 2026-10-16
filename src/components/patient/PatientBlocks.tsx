import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Dumbbell, ExternalLink, FileText, Image as ImageIcon, Play } from "lucide-react";
import { ValidationNote } from "@/components/patient/PatientUi";
import type { ResourceLink } from "@/lib/condition-resources";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import type { PathwayGuide } from "@/lib/patient-guides";
import { resourceDisplayTitle } from "@/lib/typography";

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

export function PatientPageHeader({ title, intro, pathwayName }: { title: string; intro?: string; pathwayName?: string | undefined }) {
  return (
    <div>
      <BackToHome />
      <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">{title}</h1>
      {intro ? <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">{intro}</p> : null}
      {pathwayName ? (
        <p className="mt-3 inline-flex rounded-full bg-tone-blue px-2.5 py-0.5 text-[13px] font-medium text-care">{`Parcours : ${pathwayName}`}</p>
      ) : null}
    </div>
  );
}

export function CompactLinks({ title, links }: { title?: string; links: Array<{ to: string; label: string }> }) {
  return (
    <nav aria-label={title ?? "Autres rubriques"} className="rounded-2xl border border-border bg-card p-4">
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
  if (type === "application/pdf" || resource.filename?.toLowerCase().endsWith(".pdf")) return { label: "PDF", icon: FileText };
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
        <span className="block font-medium text-foreground">{resourceDisplayTitle(resource.title)}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[format.label, "Partagé par votre médecin", resource.source].filter(Boolean).join(" · ")}
        </span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
    </a>
  );
}

export function VideoCard({ video }: { video: ResourceLink }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {video.videoId ? (
        playing ? (
          <iframe
            className="aspect-video w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&hl=fr&autoplay=1`}
            title={video.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block aspect-video w-full overflow-hidden bg-muted"
            aria-label={`Lire la vidéo : ${video.label}`}
          >
            <img src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card/95 text-care shadow-sm transition-transform group-hover:scale-105">
                <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
              </span>
            </span>
          </button>
        )
      ) : null}
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug text-foreground">{video.label}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{["Vidéo", video.source].filter(Boolean).join(" · ")}</p>
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-care hover:underline">
          Ouvrir sur YouTube <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function ExerciseList({ exercises }: { exercises: PathwayGuide["exercises"] }) {
  return (
    <ul className="flex flex-col gap-2">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <details className="group rounded-2xl border border-border bg-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tone-blue text-care">
                <Dumbbell className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">{exercise.title}</span>
                <span className="block text-xs text-muted-foreground">Exercice · Uniquement s&apos;il vous a été recommandé</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="px-4 pb-4">
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-foreground">
                {exercise.instructions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {exercise.frequency ? <p className="mt-2 text-sm text-muted-foreground">{exercise.frequency}</p> : null}
              <div className="mt-3">
                <ValidationNote validatedAt={exercise.validatedAt} validatedBy={exercise.validatedBy} source={exercise.source} />
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

export function SourcesList({ links, title = "Sources fiables complémentaires" }: { links: ResourceLink[]; title?: string }) {
  if (!links.length) return null;
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
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
