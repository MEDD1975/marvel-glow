import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronDown, NotebookPen } from "lucide-react";
import { PatientShell } from "@/components/patient/PatientShell";
import { useFollowUpSteps, usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, SafetyNotice } from "@/components/patient/PatientUi";
import { LocalCareTimeline } from "@/components/LocalCareTimeline";

type ParcoursSearch = { pathway?: string | undefined; doctorName?: string | undefined };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
    doctorName: typeof search["doctorName"] === "string" ? search["doctorName"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "La suite de mon parcours — Kivoir" },
      { name: "description", content: "Les prochaines étapes de votre parcours de soins et vos notes personnelles." },
    ],
  }),
  component: ParcoursRoute,
});

function ParcoursRoute() {
  const search = Route.useSearch();
  return (
    <PatientShell search={search} requireFreshContext>
      <ParcoursPage />
    </PatientShell>
  );
}

type TimelineStep = { id: string; title: string; description: string; status?: string | undefined; delay?: string | undefined };

function ParcoursPage() {
  const { ready, guide, context } = usePatient();
  const followUp = useFollowUpSteps();

  if (!ready || followUp.isLoading) return <LoadingState />;

  const doctorSteps: TimelineStep[] = (followUp.data ?? []).map((step) => ({
    id: step.id,
    title: step.title,
    description: step.instruction,
    delay: step.delayText ?? undefined,
  }));
  const steps: TimelineStep[] = doctorSteps.length ? doctorSteps : guide?.careSteps ?? [];

  if (!guide) {
    return (
      <div className="flex flex-col gap-8">
        <EmptyState
          title="Aucun parcours ouvert"
          description="Scannez le QR code remis par votre professionnel de santé pour retrouver les prochaines étapes de votre parcours."
          action={
            <Link
              to="/annuaire"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent"
            >
              Rechercher un cabinet
            </Link>
          }
        />
        <PersonalNotes conditionId={context.pathwayId} doctorName={context.doctorName} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          to="/patient"
          className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à mon espace patient
        </Link>
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">La suite de mon parcours</h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Retrouvez les grandes étapes prévues après votre consultation.
        </p>
        {guide ? <p className="mt-3 inline-flex rounded-full bg-tone-violet px-2.5 py-0.5 text-[13px] font-medium text-tone-violet-text">{`Parcours : ${guide.name}`}</p> : null}
      </div>

      {steps.length ? (
        <section aria-labelledby="etapes-title">
          <h2 id="etapes-title" className="sr-only">Étapes du parcours</h2>
          <ol className="relative flex flex-col">
            {steps.map((step, index) => {
              const done = Boolean(step.status);
              const last = index === steps.length - 1;
              return (
                <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {!last ? <span aria-hidden="true" className="absolute left-[15px] top-9 h-[calc(100%-2.25rem)] w-0.5 rounded-full bg-tone-violet-border/40" /> : null}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      done ? "bg-tone-violet-text text-card" : "border-2 border-tone-violet-border/60 bg-card text-tone-violet-text"
                    }`}
                    aria-hidden="true"
                  >
                    {done ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl border border-tone-violet-border/30 bg-tone-violet/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold leading-snug text-foreground">{step.title}</h3>
                      {step.status ? <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-tone-violet-text">{step.status}</span> : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    {step.delay ? <p className="mt-1.5 text-xs font-medium text-tone-violet-text">{step.delay}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            {doctorSteps.length ? "Étapes définies par votre médecin." : "Étapes indicatives, en attente de personnalisation par votre cabinet."}
          </p>
        </section>
      ) : (
        <EmptyState
          title="Aucun parcours ouvert"
          description="Scannez le QR code remis par votre professionnel de santé pour afficher les étapes de votre parcours."
        />
      )}

      <PersonalNotes conditionId={context.pathwayId} doctorName={context.doctorName} />

      <SafetyNotice>Ces étapes sont indicatives. Les décisions médicales restent prises avec votre professionnel de santé.</SafetyNotice>
    </div>
  );
}

function PersonalNotes({ conditionId, doctorName }: { conditionId: string | undefined; doctorName: string | undefined }) {
  return (
    <details className="group rounded-2xl border border-border bg-card">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <NotebookPen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Mes notes personnelles
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground">Notez les professionnels vus ou prévus. Ces notes restent sur cet appareil.</p>
        <LocalCareTimeline
          {...(conditionId ? { conditionId } : {})}
          {...(doctorName ? { initialProviderName: doctorName } : {})}
          initialProviderProfession="Médecin"
        />
      </div>
    </details>
  );
}

export default Route;
