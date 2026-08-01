import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RefreshCcw, AlertTriangle, Stethoscope, HeartPulse, Info } from "lucide-react";
import { Header } from "@/components/Header";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { orientationTree, type OrientationStep, type OrientationResult } from "@/lib/care-data";

export const Route = createFileRoute("/orientation")({
  head: () => ({
    meta: [
      { title: "Orientation — ChevilleClaire" },
      { name: "description", content: "Résevez une orientation rapide selon votre situation : douleur aiguë, diagnostic posé ou signes d'alerte." },
      { property: "og:title", content: "Orientation — ChevilleClaire" },
      { property: "og:description", content: "Résevez une orientation rapide selon votre situation : douleur aiguë, diagnostic posé ou signes d'alerte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrientationPage,
});

const levelIcons: Record<OrientationResult["level"], typeof AlertTriangle> = {
  urgent: AlertTriangle,
  professional: Stethoscope,
  "self-care": HeartPulse,
  monitor: Info,
};

const levelTitles: Record<OrientationResult["level"], string> = {
  urgent: "Urgent",
  professional: "Consultation médicale",
  "self-care": "Auto-soin surveillé",
  monitor: "Surveillance",
};

const levelClasses: Record<OrientationResult["level"], string> = {
  urgent: "border-urgent/20 bg-urgent/5 text-urgent",
  professional: "border-care/20 bg-care/5 text-care",
  "self-care": "border-soothe/40 bg-soothe/30 text-soothe-foreground",
  monitor: "border-muted bg-muted text-muted-foreground",
};

function OrientationPage() {
  const [history, setHistory] = useState<OrientationStep[]>([
    { kind: "question", node: orientationTree[0] },
  ]);
  const current = history[history.length - 1];

  const handleOption = (option: { label: string; nextId?: string; result?: OrientationResult }) => {
    if (option.result) {
      setHistory([...history, { kind: "result", result: option.result }]);
    } else if (option.nextId) {
      const next = orientationTree.find((n) => n.id === option.nextId);
      if (next) setHistory([...history, { kind: "question", node: next }]);
    }
  };

  const handleBack = () => {
    if (history.length > 1) setHistory(history.slice(0, -1));
  };

  const handleReset = () => setHistory([{ kind: "question", node: orientationTree[0] }]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Orientation rapide</h1>
        <p className="mt-2 text-muted-foreground">
          Répondez à quelques questions simples pour savoir quel niveau de soins correspond à votre situation.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          {current.kind === "result" ? (
            <ResultView result={current.result} onBack={handleBack} onReset={handleReset} />
          ) : (
            <QuestionView step={current} onOption={handleOption} onBack={handleBack} historyLength={history.length} />
          )}
        </div>

        <div className="mt-8">
          <MedicalDisclaimer />
        </div>
      </main>
    </div>
  );
}

function ResultView({
  result,
  onBack,
  onReset,
}: {
  result: OrientationResult;
  onBack: () => void;
  onReset: () => void;
}) {
  const Icon = levelIcons[result.level];
  const levelTitle = levelTitles[result.level];
  const levelClass = levelClasses[result.level];

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${levelClass}`}>
        <Icon className="h-6 w-6 shrink-0" />
        <div>
          <p className="text-sm font-medium">{levelTitle}</p>
          <p className="text-lg font-semibold">{result.title}</p>
        </div>
      </div>

      <p className="text-foreground">{result.message}</p>

      <div>
        <h3 className="font-semibold text-foreground">Que faire ?</h3>
        <ul className="mt-2 space-y-2">
          {result.actions.map((action: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-care" />
              {action}
            </li>
          ))}
        </ul>
      </div>

      {(result.whoToSee || result.when) && (
        <div className="rounded-xl bg-muted p-4">
          {result.whoToSee && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Qui consulter :</span> {result.whoToSee}
            </p>
          )}
          {result.when && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Quand :</span> {result.when}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RefreshCcw className="h-4 w-4" />
          Recommencer
        </button>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
      </div>
    </div>
  );
}

function QuestionView({
  step,
  onOption,
  onBack,
  historyLength,
}: {
  step: Extract<OrientationStep, { kind: "question" }>;
  onOption: (option: { label: string; nextId?: string; result?: OrientationResult }) => void;
  onBack: () => void;
  historyLength: number;
}) {
  const current = step.node;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">{current.question}</h2>
        <span className="text-xs text-muted-foreground">Étape {historyLength}</span>
      </div>
      <div className="grid gap-3">
        {current.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onOption(option)}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-care/40 hover:bg-care-muted/30"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-care text-xs font-medium text-care">
              {index + 1}
            </span>
            <span className="text-foreground">{option.label}</span>
          </button>
        ))}
      </div>
      {historyLength > 1 && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Revenir à la question précédente
        </button>
      )}
    </div>
  );
}
