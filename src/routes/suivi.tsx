import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, ListChecks, MapPin } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { conditions } from "@/lib/conditions";
import { readStoredPathway, writeStoredPathway } from "@/lib/patient-pathway";
import { readFollowUpProgress, writeFollowUpProgress } from "@/lib/follow-up-progress";
import type { FollowUpAnswer, FollowUpStepRecord } from "@/lib/follow-up-db";

type SuiviSearch = { c?: string | undefined; pathway?: string | undefined };

export const Route = createFileRoute("/suivi")({
  validateSearch: (search: Record<string, unknown>): SuiviSearch => ({
    c: typeof search["c"] === "string" ? search["c"] : undefined,
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mon suivi — Kivoir" },
      { name: "description", content: "Suivez, étape par étape, les consignes définies par votre professionnel de santé." },
      { property: "og:title", content: "Mon suivi — Kivoir" },
      { property: "og:description", content: "Suivez, étape par étape, les consignes définies par votre professionnel de santé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuiviPage,
});

function matchConditionId(value: string | undefined) {
  if (!value) return undefined;
  const normalized = decodeURIComponent(value).trim().toLowerCase();
  return conditions.find((item) => item.id === normalized || item.name.trim().toLowerCase() === normalized)?.id;
}

function SuiviPage() {
  const { c, pathway } = Route.useSearch();
  const urlValue = c ?? pathway;
  const [conditionId, setConditionId] = useState<string | undefined>(() => matchConditionId(urlValue));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (urlValue !== undefined) {
      const matched = matchConditionId(urlValue);
      setConditionId(matched);
      writeStoredPathway(matched);
      setHydrated(true);
    } else if (!hydrated) {
      setConditionId(readStoredPathway() ?? undefined);
      setHydrated(true);
    }
  }, [urlValue, hydrated]);

  const condition = conditionId ? conditions.find((item) => item.id === conditionId) ?? null : null;

  const [steps, setSteps] = useState<FollowUpStepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [activeRedirect, setActiveRedirect] = useState<{ stepId: string; message: string } | null>(null);

  useEffect(() => {
    if (!conditionId) {
      setSteps([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setCompletedStepIds(readFollowUpProgress(conditionId).completedStepIds);
    void fetch(`/api/follow-up-steps?conditionId=${encodeURIComponent(conditionId)}`)
      .then(async (response) => (response.ok ? ((await response.json()) as FollowUpStepRecord[]) : []))
      .then((rows) => {
        if (!cancelled) setSteps(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conditionId]);

  const persist = (nextCompleted: string[]) => {
    setCompletedStepIds(nextCompleted);
    if (conditionId) writeFollowUpProgress(conditionId, { completedStepIds: nextCompleted });
  };

  const completedSet = useMemo(() => new Set(completedStepIds.filter((id) => steps.some((step) => step.id === id))), [completedStepIds, steps]);
  const currentIndex = steps.findIndex((step) => !completedSet.has(step.id));
  const currentStep = currentIndex >= 0 ? steps[currentIndex] : null;
  const allDone = steps.length > 0 && currentIndex === -1;

  const completeCurrent = () => {
    if (!currentStep) return;
    setActiveRedirect(null);
    persist([...completedStepIds.filter((id) => id !== currentStep.id), currentStep.id]);
  };

  const handleAnswer = (answer: FollowUpAnswer) => {
    if (!currentStep) return;
    if (answer.action === "redirect") {
      setActiveRedirect({ stepId: currentStep.id, message: answer.redirectMessage ?? "Ce signal justifie l’avis d’un professionnel." });
      return;
    }
    completeCurrent();
  };

  const resetProgress = () => {
    setActiveRedirect(null);
    persist([]);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          to="/"
          search={{ started: true, pathway: conditionId }}
          aria-label="Retourner à l’espace patient"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à mon espace patient
        </Link>
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-care/10 px-3 py-1.5 text-sm font-semibold text-care">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Mon suivi
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">{condition ? `Suivi — ${condition.name}` : "Mon suivi"}</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Avancez à votre rythme dans les étapes définies par votre professionnel de santé. Répondez aux questions lorsqu’elles apparaissent.
        </p>
      </div>

      {!condition ? (
        <div className="mt-10 rounded-2xl border border-border bg-card px-5 py-6 text-center">
          <p className="text-lg font-semibold text-foreground">Ouvrez le lien remis par votre professionnel</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Votre suivi s’affiche après avoir scanné la carte QR de votre médecin.</p>
          <Link to="/conseils" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-care">Consulter la bibliothèque de conseils <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      ) : loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement de votre suivi…</p>
      ) : steps.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-center">
          <p className="text-lg font-semibold text-foreground">Aucune étape n’a encore été définie</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Votre professionnel de santé n’a pas encore ajouté d’étapes de suivi pour ce trouble. Revenez plus tard ou consultez vos conseils.</p>
          <Link to="/conseils" search={{ c: condition.id }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-care">Voir la bibliothèque de conseils <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      ) : (
        <>
          {/* Frise de progression */}
          <ol className="mt-8 flex flex-col gap-2" aria-label="Progression du suivi">
            {steps.map((step, index) => {
              const done = completedSet.has(step.id);
              const isCurrent = step.id === currentStep?.id;
              return (
                <li key={step.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${isCurrent ? "border-care bg-care/5" : done ? "border-border bg-card" : "border-border bg-card"}`}>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-care" aria-hidden="true" />
                  ) : (
                    <Circle className={`h-5 w-5 shrink-0 ${isCurrent ? "text-care" : "text-muted-foreground/40"}`} aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${done || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{index + 1}. {step.title}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${isCurrent ? "text-care" : done ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                    {done ? "Validée" : isCurrent ? "En cours" : "À venir"}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Étape en cours */}
          {currentStep ? (
            <section className="mt-6 rounded-2xl border border-care/30 bg-card p-6 shadow-sm" aria-labelledby="current-step-title">
              {currentStep.delayText ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-care/10 px-3 py-1 text-xs font-semibold text-care"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{currentStep.delayText}</p>
              ) : null}
              <h2 id="current-step-title" className="mt-3 text-xl font-semibold text-foreground">{currentStep.title}</h2>
              {currentStep.instruction ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentStep.instruction}</p> : null}

              {currentStep.question ? (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-foreground">{currentStep.question}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {currentStep.answers.map((answer) => (
                      <button
                        key={answer.id}
                        type="button"
                        onClick={() => handleAnswer(answer)}
                        className="inline-flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-care hover:bg-care/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {answer.label}
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={completeCurrent}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-care px-4 py-2.5 text-sm font-semibold text-care-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  J’ai suivi cette étape
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}

              {activeRedirect && activeRedirect.stepId === currentStep.id ? (
                <div className="mt-5 rounded-xl border border-urgent/30 bg-urgent/5 p-4" role="status">
                  <p className="text-sm font-medium text-foreground">{activeRedirect.message}</p>
                  <Link
                    to="/annuaire"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Trouver un professionnel dans l’annuaire
                  </Link>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Suivi terminé */}
          {allDone ? (
            <section className="mt-6 rounded-2xl border border-care/30 bg-care/5 p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-care" aria-hidden="true" />
              <h2 className="mt-2 text-lg font-semibold text-foreground">Vous avez parcouru toutes les étapes</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Continuez à suivre les consignes de votre professionnel. En cas de doute ou d’aggravation, recontactez-le.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link to="/conseils" search={{ c: condition.id }} className="inline-flex items-center gap-2 rounded-xl border border-care/40 bg-card px-4 py-2.5 text-sm font-semibold text-care hover:bg-care/10">Revoir mes conseils</Link>
                <button type="button" onClick={resetProgress} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground">Recommencer le suivi</button>
              </div>
            </section>
          ) : null}
        </>
      )}

      <div className="mt-10">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}
