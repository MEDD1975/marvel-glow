import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  countLearningContent,
  isPlayableVideo,
  totalLearningContent,
} from "@/lib/learning-content";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import {
  DoctorResourceRow,
  PatientPageHeader,
  SourcesList,
  VideoCard,
  VideoCautionNote,
  videoFromLink,
  videoFromResource,
} from "@/components/patient/PatientBlocks";
import { LoadingState, NoPathwayState, SafetyNotice } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/ressources/")({
  head: () => ({
    meta: [
      { title: "Contenus pédagogiques — Kivoir" },
      {
        name: "description",
        content:
          "Vidéos, documents, fiches pédagogiques et sources complémentaires de votre parcours.",
      },
    ],
  }),
  component: ResourcesPage,
});

const groupTitle = "mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function ResourcesPage() {
  const { ready, guide } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const files = resources.data ?? [];
  const documents = files.filter((item) => !isPlayableVideo(item));
  const videos = [
    ...files.filter(isPlayableVideo).map(videoFromResource),
    ...guide.videos.map(videoFromLink),
  ];

  if (!resources.isLoading && totalLearningContent(countLearningContent(guide, files)) === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PatientPageHeader
          title="Contenus pédagogiques"
          intro="Vidéos et documents de votre parcours."
          pathwayName={guide.name}
        />
        <section
          className="rounded-2xl border border-[#E4EAF2] bg-[#FAFBFD] p-5"
          aria-labelledby="empty-resources-title"
        >
          <h2 id="empty-resources-title" className="text-base font-semibold text-foreground">
            Aucun contenu complémentaire n&apos;est disponible pour le moment.
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Les conseils transmis restent disponibles dans “À faire maintenant”.
          </p>
          <Link
            to="/conseils"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-[14px] border border-[#DCE5F0] bg-white px-4 text-sm font-semibold text-[#0B63CE] transition-colors hover:border-[#0B63CE] hover:bg-[#F2F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-auto"
          >
            Voir mes recommandations
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
        <SafetyNotice />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PatientPageHeader
        title="Contenus pédagogiques"
        intro="Vidéos et documents sélectionnés pour votre parcours, et sources complémentaires."
        pathwayName={guide.name}
      />

      <section aria-labelledby="documents-title">
        <h2 id="documents-title" className={groupTitle}>
          Documents
        </h2>
        {resources.isLoading ? (
          <LoadingState />
        ) : documents.length ? (
          <ul className="flex flex-col gap-2">
            {documents.map((resource) => (
              <li key={resource.id}>
                <DoctorResourceRow resource={resource} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Votre médecin n&apos;a pas encore partagé de document pour ce parcours.
          </p>
        )}
      </section>

      {videos.length ? (
        <section aria-labelledby="videos-title">
          <h2 id="videos-title" className={groupTitle}>
            Vidéos
          </h2>
          <div className="flex flex-col gap-4">
            <VideoCautionNote />
            <ul className="grid gap-4 md:grid-cols-2">
              {videos.map((video) => (
                <li key={video.key}>
                  <VideoCard video={video} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <SourcesList links={guide.sources} />

      <SafetyNotice />
    </div>
  );
}
