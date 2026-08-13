import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Info,
  Lightbulb,
  Map as MapIcon,
  RefreshCcw,
  Stethoscope,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { LegDiagram } from "@/components/LegDiagram";
import { DoctorSummary } from "@/components/DoctorSummary";
import { conditionAdvice } from "@/lib/condition-advice";
import {
  conditions,
  levelCopy,
  triageQuestions,
  type Condition,
  type TriageLevel,
  type TriageOption,
} from "@/lib/conditions";

export const Route = createFileRoute("/orientation")({
  head: () => ({
    meta: [
      { title: "Repérer sa prochaine étape — Kivoir" },
      {
        name: "description",
        content:
          "Repérez les informations à préparer pour votre prochain échange avec un professionnel, sans interprétation de vos symptômes.",
      },
      { property: "og:title", content: "Orientation — Kivoir" },
      {
        property: "og:description",
        content:
          "Repérez les informations à préparer pour votre prochain échange avec un professionnel, sans interprétation de vos symptômes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrientationPage,
});

const zones = [
  { id: "Hanche", label: "Hanche", description: "Aine, fesse, haut de la cuisse" },
  { id: "Genou", label: "Genou", description: "Rotule, interligne, face interne ou externe" },
  { id: "Cheville", label: "Cheville", description: "Malléoles, tendon d'Achille, talon" },
  { id: "Pied", label: "Pied", description: "Plante, avant-pied, orteils, bord interne" },
];

const levelIcons: Record<TriageLevel, typeof AlertTriangle> = {
  urgent: AlertTriangle,
  professional: Stethoscope,
  "self-care": HeartPulse,
};

const levelLabels: Record<TriageLevel, string> = {
  urgent: "Urgent",
  professional: "Consultation médicale",
  "self-care": "Auto-soin surveillé",
};

const levelClasses: Record<TriageLevel, string> = {
  urgent: "border-urgent/20 bg-urgent/5 text-urgent",
  professional: "border-care/20 bg-care/5 text-care",
  "self-care": "border-soothe/40 bg-soothe/30 text-soothe-foreground",
};

const levelRank: Record<TriageLevel, number> = {
  "self-care": 0,
  professional: 1,
  urgent: 2,
};

const totalSteps = triageQuestions.length + 2; // zone + questions + précision de la zone

type Step =
  | { type: "zone" }
  | { type: "triage"; index: number }
  | { type: "condition" }
  | { type: "result" };

function OrientationPage() {
  const [zone, setZone] = useState<string | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [answers, setAnswers] = useState<TriageOption[]>([]);
  const step = getStep(zone, answers, condition);
  const stepNumber = getStepNumber(step);
  const currentQuestion = step.type === "triage" ? triageQuestions[step.index] : null;
  const zoneConditions = zone ? conditions.filter((c) => c.zone === zone) : conditions;

  const handleBack = () => {
    if (condition) {
      setCondition(null);
    } else if (answers.length > 0) {
      setAnswers(answers.slice(0, -1));
    } else if (zone) {
      setZone(null);
    }
  };

  const handleReset = () => {
    setZone(null);
    setCondition(null);
    setAnswers([]);
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-care">Orientation</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Trouvez votre prochaine étape</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">Quelques repères pour organiser votre prochain échange.</p>
        <Link to="/conseils" className="mt-5 inline-flex min-h-11 items-center text-base font-semibold text-care hover:underline">Comprendre l’orientation <ArrowRight aria-hidden="true" className="ml-2 size-5" /></Link>
      </div>

      <div className="mt-6 flex items-center gap-2" aria-label={`Étape ${stepNumber} sur ${totalSteps}`}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < stepNumber ? "bg-care" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-care/25 bg-care/5 p-7 shadow-sm md:p-10">
        <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wide text-care">Parcours guidé</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Répondez à quelques questions</h2><p className="mt-1 text-base leading-7 text-muted-foreground">5 questions essentielles pour vous guider sans poser de diagnostic.</p></div>
        {step.type === "zone" ? (
          <ZonePicker onSelect={setZone} />
        ) : step.type === "triage" && currentQuestion ? (
          <QuestionView
            key={currentQuestion.id}
            question={currentQuestion}
            stepNumber={stepNumber}
            onSelect={(option) => setAnswers([...answers, option])}
            onBack={handleBack}
          />
        ) : step.type === "condition" ? (
          <ConditionPicker
            zone={zone}
            zoneConditions={zoneConditions}
            onSelect={setCondition}
            onBack={handleBack}
          />
        ) : condition ? (
          <ResultView
            condition={condition}
            answers={answers}
            onBack={handleBack}
            onReset={handleReset}
          />
        ) : null}
      </div>

      <div className="mt-8">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}

function getStep(zone: string | null, answers: TriageOption[], condition: Condition | null): Step {
  if (!zone) return { type: "zone" };
  if (answers.length < triageQuestions.length) return { type: "triage", index: answers.length };
  if (!condition) return { type: "condition" };
  return { type: "result" };
}

function getStepNumber(step: Step): number {
  switch (step.type) {
    case "zone":
      return 1;
    case "triage":
      return 2 + step.index;
    case "condition":
      return totalSteps;
    case "result":
      return totalSteps;
  }
}

function ContextBlocks({ context, example }: { context: string; example: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-care/20 bg-care/5 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-care">
          <Info className="h-4 w-4" />
          Pourquoi cette question
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{context}</p>
      </div>
      <div className="rounded-xl border border-soothe/40 bg-soothe/20 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-soothe-foreground">
          <Lightbulb className="h-4 w-4" />
          Exemple de réponse
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{example}</p>
      </div>
    </div>
  );
}

function ZonePicker({ onSelect }: { onSelect: (zone: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          Où situez-vous votre douleur principale ?
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">Étape 1</span>
      </div>

<p className="text-sm text-muted-foreground">Choisissez la zone qui vous gêne le plus.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => onSelect(z.id)}
            className="group flex min-h-36 flex-col justify-center gap-3 rounded-3xl border border-border bg-background p-6 text-left transition-all hover:-translate-y-0.5 hover:border-care/50 hover:bg-care-muted/30 hover:shadow-sm"
          >
            <span className="text-2xl font-semibold tracking-tight text-foreground">{z.label}</span>
            <span className="text-base leading-6 text-muted-foreground">{z.description}</span>
            <span className="mt-1 text-xs font-semibold text-care opacity-0 transition-opacity group-hover:opacity-100">Choisir</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConditionPicker({
  zone,
  zoneConditions,
  onSelect,
  onBack,
}: {
  zone: string | null;
  zoneConditions: Condition[];
  onSelect: (condition: Condition) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          Où se situe précisément la douleur ?
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">Étape {totalSteps}</span>
      </div>

      <p className="text-sm text-muted-foreground">Cette dernière réponse aide à orienter les conseils. Elle ne sert pas à établir un diagnostic.</p>

      <div className="grid gap-4">
        {zoneConditions.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-care/40 hover:bg-care-muted/30"
          >
            <span className="w-14 shrink-0 sm:w-16">
              <LegDiagram spot={item.spot} label={item.name} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.zone}
                </span>
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.location}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Revenir aux questions
      </button>
    </div>
  );
}

function QuestionView({
  question,
  stepNumber,
  onSelect,
  onBack,
}: {
  question: (typeof triageQuestions)[number];
  stepNumber: number;
  onSelect: (option: TriageOption) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">{question.question}</h2>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">Étape {stepNumber}</span>
      </div>

      <ContextBlocks context={question.context} example={question.example} />

      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <button
            key={option.label}
            onClick={() => onSelect(option)}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-care/40 hover:bg-care-muted/30"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-care text-xs font-medium text-care">
              {index + 1}
            </span>
            <span>
              <span className="block text-foreground">{option.label}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{option.detail}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Revenir à l'étape précédente
      </button>
    </div>
  );
}

function ResultView({
  condition,
  answers,
  onBack,
  onReset,
}: {
  condition: Condition;
  answers: TriageOption[];
  onBack: () => void;
  onReset: () => void;
}) {
  const level = answers.reduce<TriageLevel>(
    (worst, answer) => (levelRank[answer.level] > levelRank[worst] ? answer.level : worst),
    "self-care",
  );
  const copy = levelCopy[level];
  const Icon = levelIcons[level];

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${levelClasses[level]}`}>
        <Icon className="h-6 w-6 shrink-0" />
        <div>
          <p className="text-sm font-medium">{levelLabels[level]}</p>
          <p className="text-lg font-semibold">{copy.title}</p>
        </div>
      </div>

      <p className="text-foreground">{copy.message}</p>

      <div>
        <h3 className="font-semibold text-foreground">Que faire maintenant ?</h3>
        <ul className="mt-2 space-y-2">
          {copy.actions.map((action) => (
            <li key={action} className="flex items-start gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-care" />
              {action}
            </li>
          ))}
        </ul>
      </div>

      <section className="rounded-3xl border border-care/25 bg-care/5 p-6 md:p-7" aria-labelledby="first-advice-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-care">À faire maintenant</p>
            <h3 id="first-advice-title" className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Premiers gestes prudents</h3>
          </div>
          <Lightbulb className="size-6 shrink-0 text-care" aria-hidden="true" />
        </div>
        <div className="mt-5 grid gap-3">
          {(conditionAdvice[condition.id]?.tips ?? []).slice(0, 3).map((tip) => (
            <div key={tip.title} className="rounded-2xl bg-background/80 p-4">
              <p className="text-base font-semibold text-foreground">{tip.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{tip.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to="/conseils" search={{ c: condition.id }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-care px-5 text-base font-semibold text-primary-foreground transition hover:bg-care/90">
            Voir tous les conseils <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
          <Link to="/annuaire" search={{ c: condition.id }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-care/30 bg-background px-5 text-base font-semibold text-care transition hover:bg-care/10">
            Trouver un professionnel <MapIcon aria-hidden="true" className="size-5" />
          </Link>
        </div>
        <p className="mt-5 text-base leading-7 text-foreground"><span className="font-semibold">À discuter en première intention :</span> {condition.whoToSee}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Ces conseils ne remplacent pas un examen et ne permettent pas de confirmer une cause.</p>
      </section>

      <div className="rounded-xl border border-border bg-muted/60 p-4">
        <div className="flex gap-4">
          <span className="w-14 shrink-0">
            <LegDiagram spot={condition.spot} label={condition.name} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">Zone et symptômes pris en compte</h3>
            <p className="mt-1 text-sm text-muted-foreground">Vos réponses servent à proposer des conseils prudents et une première orientation. Elles ne confirment pas une cause.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Zone décrite : </span>
              {condition.zone}
            </p>
          </div>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="inline font-medium text-foreground">Premier réflexe prudent : </dt>
            <dd className="inline text-muted-foreground">{condition.firstStep}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">Qui consulter : </dt>
            <dd className="inline text-muted-foreground">{condition.whoToSee}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">Délais habituels : </dt>
            <dd className="inline text-muted-foreground">{condition.delay}</dd>
          </div>
        </dl>
      </div>

      <DoctorSummary condition={condition} answers={answers} level={level} />

      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-medium text-foreground">Vos réponses</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            Zone de douleur — <span className="text-foreground">{condition.zone}</span>
          </li>
          {answers.map((answer, i) => (
            <li key={i}>
              {triageQuestions[i]?.question} — <span className="text-foreground">{answer.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/parcours"
          search={{ c: condition.id }}
          className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-care/90"
        >
          <MapIcon className="h-4 w-4" />
          Voir le parcours de soin de {condition.name}
        </Link>
        <Link
          to="/conseils"
          search={{ c: condition.id }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Conseils adaptés à {condition.name}
        </Link>
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
