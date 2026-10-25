import { createFileRoute } from "@tanstack/react-router";
import { usePatient } from "@/components/patient/PatientProvider";
import { LoadingState, NoPathwayState, PageHeading, SafetyNotice } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/parcours")({
  component: PathwayPage,
});

function PathwayPage() {
  const { ready, guide } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  return (
    <div>
      <PageHeading back={{ to: "/patient", label: "Accueil" }} title="Comprendre mon parcours" description={`Les grandes étapes habituelles pour « ${guide.name} ». Votre prise en charge peut différer.`} />
      <ol className="relative flex flex-col gap-4 border-l-2 border-border pl-6">
        {guide.careSteps.map((step, index) => (
          <li key={step.id} className="relative">
            <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-care text-xs font-semibold text-primary-foreground" aria-hidden="true">
              {index + 1}
            </span>
            <h2 className="font-semibold text-foreground">{step.title}</h2>
            <p className="mt-1 text-base leading-relaxed text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <SafetyNotice>Ces étapes expliquent le parcours habituel. Votre professionnel de santé peut les adapter selon votre examen, vos symptômes et votre évolution.</SafetyNotice>
      </div>
    </div>
  );
}
