import { createFileRoute } from "@tanstack/react-router";
import { usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, NoPathwayState, PageHeading, SafetyNotice, ValidationNote } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/ressources/exercices")({
  component: ExercisesPage,
});

function ExercisesPage() {
  const { ready, guide } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  return (
    <div>
      <PageHeading
        back={{ to: "/patient/ressources", label: "Mes ressources" }}
        title="Exercices"
        description="Réalisez ces exercices uniquement s'ils vous ont été recommandés par votre professionnel de santé."
      />
      {guide.exercises.length ? (
        <div className="flex flex-col gap-6">
          {guide.phases.map((phase) => {
            const items = guide.exercises.filter((exercise) => exercise.phaseId === phase.id);
            if (!items.length) return null;
            return (
              <section key={phase.id} aria-labelledby={`phase-${phase.id}`}>
                <h2 id={`phase-${phase.id}`} className="text-base font-semibold text-foreground">{phase.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {items.map((exercise) => (
                    <li key={exercise.id} className="rounded-2xl border border-border bg-card p-4">
                      <h3 className="font-semibold text-foreground">{exercise.title}</h3>
                      <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-base leading-relaxed text-foreground marker:text-muted-foreground">
                        {exercise.instructions.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {exercise.frequency ? `Fréquence : ${exercise.frequency}` : "Fréquence : selon les consignes de votre professionnel."}
                      </p>
                      <div className="mt-2">
                        <ValidationNote validatedAt={exercise.validatedAt} validatedBy={exercise.validatedBy} source={exercise.source} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Aucun exercice pour ce parcours" />
      )}
      <div className="mt-6">
        <SafetyNotice>Arrêtez immédiatement un exercice en cas de douleur vive et demandez conseil.</SafetyNotice>
      </div>
    </div>
  );
}
