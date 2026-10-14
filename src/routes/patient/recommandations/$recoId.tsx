import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, NoPathwayState, PageHeading, SafetyNotice, ValidationNote } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/recommandations/$recoId")({
  component: RecommendationDetail,
});

function RecommendationDetail() {
  const { recoId } = Route.useParams();
  const { ready, guide } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const index = guide.recommendations.findIndex((item) => item.id === recoId);
  const item = guide.recommendations[index];
  if (!item) {
    return <EmptyState title="Conseil introuvable" action={<Link className="font-semibold text-care" to="/patient/recommandations">Voir tous les conseils</Link>} />;
  }
  const next = guide.recommendations[index + 1];
  return (
    <article>
      <PageHeading back={{ to: "/patient/recommandations", label: "Mes conseils" }} title={item.title} description={item.intro} />
      {item.steps.length ? (
        <ol className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          {item.steps.map((step) => (
            <li key={step} className="flex items-start gap-3 text-base leading-relaxed text-foreground">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-tone-green-text" aria-hidden="true" />
              {step}
            </li>
          ))}
        </ol>
      ) : null}
      <div className="mt-5 flex flex-col gap-3">
        <SafetyNotice>{item.caution}</SafetyNotice>
        <ValidationNote validatedAt={item.validatedAt} validatedBy={item.validatedBy} source={item.source} />
      </div>
      {next ? (
        <Link
          to="/patient/recommandations/$recoId"
          params={{ recoId: next.id }}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent"
        >
          {`Conseil suivant : ${next.title}`}
        </Link>
      ) : (
        <Link
          to="/patient/surveiller"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent"
        >
          Voir les signes à surveiller
        </Link>
      )}
    </article>
  );
}
