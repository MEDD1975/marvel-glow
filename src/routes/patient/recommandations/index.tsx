import { createFileRoute } from "@tanstack/react-router";
import { usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, ListGroup, ListRow, LoadingState, NoPathwayState, PageHeading, SafetyNotice } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/recommandations/")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { ready, guide } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  return (
    <div>
      <PageHeading
        back={{ to: "/patient", label: "Accueil" }}
        title="Ce que je peux faire"
        description="Ces recommandations peuvent aider à soulager les symptômes et à favoriser la récupération."
      />
      {guide.recommendations.length ? (
        <ListGroup label="Recommandations">
          {guide.recommendations.map((item, index) => (
            <li key={item.id}>
              <ListRow
                to="/patient/recommandations/$recoId"
                params={{ recoId: item.id }}
                title={item.title}
                description={item.summary}
                leading={
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tone-blue text-sm font-semibold text-care" aria-hidden="true">
                    {index + 1}
                  </span>
                }
              />
            </li>
          ))}
        </ListGroup>
      ) : (
        <EmptyState title="Aucune recommandation pour ce parcours" description="Votre cabinet n'a pas encore ajouté de recommandation." />
      )}
      <div className="mt-6">
        <SafetyNotice>Suivez en priorité les consignes données lors de votre consultation.</SafetyNotice>
      </div>
    </div>
  );
}
