import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { countLearningContent, totalLearningContent } from "@/lib/learning-content";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { DoctorResourceRow, ExerciseList, PatientPageHeader, SourcesList, VideoCard } from "@/components/patient/PatientBlocks";
import { LoadingState, NoPathwayState, SafetyNotice } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/ressources/")({
  head: () => ({
    meta: [
      { title: "Mes ressources — Kivoir" },
      { name: "description", content: "Documents, vidéos, exercices et sources sélectionnés pour votre parcours." },
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
  const documents = files.filter((item) => !item.contentType?.startsWith("video/"));
  const videoFiles = files.filter((item) => item.contentType?.startsWith("video/"));

  if (!resources.isLoading && totalLearningContent(countLearningContent(guide, files)) === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PatientPageHeader title="Mes ressources" intro="Contenus pédagogiques de votre parcours." pathwayName={guide.name} />
        <section className="rounded-2xl border border-[#E4EAF2] bg-[#FAFBFD] p-5" aria-labelledby="empty-resources-title">
          <h2 id="empty-resources-title" className="text-base font-semibold text-foreground">Aucun contenu complémentaire pour le moment</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Les conseils transmis restent disponibles dans “À faire maintenant”.</p>
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
        title="Mes ressources"
        intro="Retrouvez les contenus sélectionnés pour votre parcours et des sources complémentaires."
        pathwayName={guide.name}
      />

      <section aria-labelledby="documents-title">
        <h2 id="documents-title" className={groupTitle}>Documents</h2>
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
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Votre médecin n&apos;a pas encore partagé de document pour ce parcours.</p>
        )}
      </section>

      <section aria-labelledby="videos-title">
        <h2 id="videos-title" className={groupTitle}>Vidéos</h2>
        {videoFiles.length || guide.videos.length ? (
          <div className="flex flex-col gap-3">
            {videoFiles.length ? (
              <ul className="flex flex-col gap-2">
                {videoFiles.map((resource) => (
                  <li key={resource.id}>
                    <DoctorResourceRow resource={resource} />
                  </li>
                ))}
              </ul>
            ) : null}
            {guide.videos.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {guide.videos.map((video) => (
                  <li key={video.url}>
                    <VideoCard video={video} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Aucune vidéo pour ce parcours.</p>
        )}
      </section>

      <section aria-labelledby="exercices-title">
        <h2 id="exercices-title" className={groupTitle}>Exercices</h2>
        {guide.exercises.length ? (
          <ExerciseList exercises={guide.exercises} />
        ) : (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Aucun exercice pour ce parcours.</p>
        )}
      </section>

      <SourcesList links={guide.sources} />

      <SafetyNotice />
    </div>
  );
}
