import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, ErrorState, LoadingState, NoPathwayState, PageHeading, SectionTitle } from "@/components/patient/PatientUi";
import { formatTitle, resourceDisplayTitle } from "@/lib/typography";

export const Route = createFileRoute("/patient/ressources/videos")({
  component: VideosPage,
});

function VideosPage() {
  const { ready, guide } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const videos = (resources.data ?? []).filter((item) => item.contentType?.startsWith("video/"));
  return (
    <div>
      <PageHeading back={{ to: "/patient/ressources", label: "Mes ressources" }} title="Vidéos" />
      <SectionTitle>Transmises par votre cabinet</SectionTitle>
      {resources.isLoading ? (
        <LoadingState label="Chargement des vidéos…" />
      ) : resources.isError ? (
        <ErrorState message="Les vidéos n'ont pas pu être chargées." onRetry={() => void resources.refetch()} />
      ) : videos.length ? (
        <ul className="flex flex-col gap-4">
          {videos.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <video src={item.url} controls preload="metadata" playsInline className="aspect-video w-full bg-foreground">
                <track kind="captions" />
              </video>
              <p className="px-4 py-3 font-medium text-foreground">{resourceDisplayTitle(item.title)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucune vidéo transmise" description="Votre cabinet n'a pas encore partagé de vidéo pour ce parcours." />
      )}

      {guide.videos.length ? (
        <>
          <SectionTitle>Vidéos d&apos;information</SectionTitle>
          <ul className="flex flex-col gap-4">
            {guide.videos.map((item) => (
              <li key={item.url} className="overflow-hidden rounded-2xl border border-border bg-card">
                {item.videoId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${item.videoId}`}
                    title={item.label}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                ) : null}
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-accent">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{formatTitle(item.label)}</span>
                    <span className="block text-sm text-muted-foreground">{item.source}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">(ouvre un nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
