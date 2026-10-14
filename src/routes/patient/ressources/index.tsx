import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, FileText, PlayCircle } from "lucide-react";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { ActionCard, LoadingState, NoPathwayState, PageHeading, SafetyNotice } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/ressources/")({
  component: ResourcesHub,
});

function plural(count: number, one: string, many: string) {
  return `${count} ${count > 1 ? many : one}`;
}

function ResourcesHub() {
  const { ready, guide } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const files = resources.data ?? [];
  const documentCount = files.filter((item) => !item.contentType?.startsWith("video/")).length + guide.sources.length;
  const videoCount = files.filter((item) => item.contentType?.startsWith("video/")).length + guide.videos.length;
  return (
    <div>
      <PageHeading back={{ to: "/patient", label: "Accueil" }} title="Mes ressources" description={`Documents, vidéos et exercices pour votre parcours « ${guide.name} ».`} />
      <div className="flex flex-col gap-3">
        <ActionCard to="/patient/ressources/documents" icon={FileText} tone="blue" title="Documents" description={resources.isLoading ? "Chargement…" : plural(documentCount, "document", "documents")} />
        <ActionCard to="/patient/ressources/videos" icon={PlayCircle} tone="violet" title="Vidéos" description={resources.isLoading ? "Chargement…" : plural(videoCount, "vidéo", "vidéos")} />
        <ActionCard to="/patient/ressources/exercices" icon={Dumbbell} tone="green" title="Exercices" description={plural(guide.exercises.length, "exercice", "exercices")} />
      </div>
      <div className="mt-6">
        <SafetyNotice />
      </div>
    </div>
  );
}
