import { createFileRoute } from "@tanstack/react-router";
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
