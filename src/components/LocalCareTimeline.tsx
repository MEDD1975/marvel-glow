import { useEffect, useMemo, useState } from "react";
import { Check, Circle } from "lucide-react";
import type { Condition } from "@/lib/conditions";

type TimelineStep = { id: string; label: string; detail: string };

const defaultSteps: TimelineStep[] = [
  { id: "understand", label: "Comprendre mes repères", detail: "Relire les informations remises et noter mes questions." },
  { id: "first-actions", label: "Mettre en place les bons réflexes", detail: "Appliquer progressivement les conseils généraux adaptés à mon quotidien." },
  { id: "observe", label: "Observer mon évolution", detail: "Prendre un temps pour regarder ce qui s’améliore ou persiste." },
  { id: "next-step", label: "Préparer la prochaine étape", detail: "Savoir quand demander un avis et préparer mon échange avec un professionnel." },
];

const stepsByCondition: Record<string, TimelineStep[]> = {
  "entorse-cheville": [
    { id: "ankle-protect", label: "Protéger et comprendre", detail: "Repérer les conseils reçus pour protéger votre cheville." },
    { id: "ankle-move", label: "Reprendre les mouvements", detail: "Observer progressivement votre mobilité, sans forcer." },
    { id: "ankle-activity", label: "Reprendre les activités", detail: "Identifier les activités reprises confortablement." },
    { id: "ankle-review", label: "Faire le point", detail: "Préparer vos questions ou demander un avis si besoin." },
  ],
  "aponevrosite-plantaire": [
    { id: "foot-understand", label: "Comprendre mes repères", detail: "Relire les explications et conseils transmis." },
    { id: "foot-habits", label: "Adapter mes habitudes", detail: "Observer l’effet des adaptations conseillées au quotidien." },
    { id: "foot-move", label: "Reprendre progressivement", detail: "Noter les mouvements et activités mieux tolérés." },
    { id: "foot-review", label: "Faire le point", detail: "Préparer la suite avec un professionnel si nécessaire." },
  ],
};

function storageKey(conditionId?: string) {
  return `kivoir-local-timeline:${conditionId ?? "general"}`;
}

export function LocalCareTimeline({ condition }: { condition: Condition | null }) {
  const steps = useMemo(() => stepsByCondition[condition?.id ?? ""] ?? defaultSteps, [condition?.id]);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(condition?.id));
      setCompleted(saved ? (JSON.parse(saved) as string[]) : []);
    } catch {
      setCompleted([]);
    }
  }, [condition?.id]);

  const toggle = (stepId: string) => {
    const next = completed.includes(stepId) ? completed.filter((id) => id !== stepId) : [...completed, stepId];
    setCompleted(next);
    window.localStorage.setItem(storageKey(condition?.id), JSON.stringify(next));
  };

  const reset = () => {
    setCompleted([]);
    window.localStorage.removeItem(storageKey(condition?.id));
  };

  return (
    <section className="mt-10 rounded-3xl border border-care/20 bg-card p-5 shadow-sm md:p-6" aria-labelledby="local-timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-care">Mon parcours &amp; étapes</p>
          <h2 id="local-timeline-title" className="mt-2 text-2xl font-semibold text-foreground">Mes repères, à mon rythme</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Cochez vous-même les étapes qui vous parlent. Cette frise est un outil d’auto-évaluation informatif, pas un calendrier médical.</p>
        </div>
        <span className="rounded-full bg-care/10 px-3 py-1.5 text-xs font-semibold text-care">{completed.length}/{steps.length} repères</span>
      </div>
      <ol className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const isDone = completed.includes(step.id);
          return (
            <li key={step.id}>
              <button type="button" onClick={() => toggle(step.id)} aria-pressed={isDone} className={`flex h-full w-full flex-col rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isDone ? "border-care bg-care/10" : "border-border bg-background hover:border-care/50"}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isDone ? "bg-care text-care-foreground" : "bg-muted text-muted-foreground"}`}>{isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}</span>
                  {isDone ? <span className="text-xs font-semibold text-care">Fait</span> : <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                </span>
                <span className="mt-4 font-semibold text-foreground">{step.label}</span>
                <span className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Vos coches restent uniquement dans ce navigateur, sans compte ni transmission.</p>
        <button type="button" onClick={reset} className="text-xs font-semibold text-care underline-offset-4 hover:underline">Réinitialiser mes repères</button>
      </div>
    </section>
  );
}

export { storageKey as localCareTimelineStorageKey };
export type { TimelineStep };
