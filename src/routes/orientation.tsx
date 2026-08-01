import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  HeartPulse,
  Info,
  Lightbulb,
  Map as MapIcon,
  RefreshCcw,
  Stethoscope,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { LegDiagram } from "@/components/LegDiagram";
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
      { title: "Orientation — Kivoir" },
      {
        name: "description",
        content:
          "Choisissez votre trouble musculo-squelettique du membre inférieur et répondez à trois questions expliquées pour savoir qui consulter et quand.",
      },
      { property: "og:title", content: "Orientation — Kivoir" },
      {
        property: "og:description",
        content:
          "Choisissez votre trouble musculo-squelettique du membre inférieur et répondez à trois questions expliquées pour savoir qui consulter et quand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrientationPage,
});

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

const totalSteps = triageQuestions.length + 1;

function OrientationPage() {
  const [condition, setCondition] = useState<Condition | null>(null);
  const [answers, setAnswers] = useState<TriageOption[]>([]);

  const questionIndex = answers.length;
  const currentQuestion = triageQuestions[questionIndex];
  const isFinished = condition !== null && questionIndex >= triageQuestions.length;

  const handleBack = () => {
    if (answers.length > 0) setAnswers(answers.slice(0, -1));
    else setCondition(null);
  };

  const handleReset = () => {
    setCondition(null);
    setAnswers([]);
  };

  const stepNumber = condition === null ? 1 : Math.min(questionIndex + 2, totalSteps);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Orientation rapide</h1>
      <p className="mt-2 text-muted-foreground">
        Chaque question est accompagnée de son contexte et d'un exemple de réponse, pour vous aider à choisir sans hésiter.
      </p>

      <div className="mt-6 flex items-center gap-2" aria-label={`Étape ${stepNumber} sur ${totalSteps}`}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < stepNumber ? "bg-care" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        {condition === null ? (
          <ConditionPicker onSelect={setCondition} />
        ) : isFinished ? (
          <ResultView
            condition={condition}
            answers={answers}
            onBack={handleBack}
            onReset={handleReset}
          />
        ) : currentQuestion ? (
          <QuestionView
            key={currentQuestion.id}
            question={currentQuestion}
            condition={condition}
            stepNumber={stepNumber}
            onSelect={(option) => setAnswers([...answers, option])}
            onBack={handleBack}
          />
        ) : null}
      </div>

      <div className="mt-8">
        <MedicalDisclaimer />
      </div>
    </main>
  );
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

function ConditionPicker({ onSelect }: { onSelect: (condition: Condition) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          Quel trouble correspond le mieux à votre situation ?
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">Étape 1</span>
      </div>

      <ContextBlocks
        context="Les troubles musculo-squelettiques du membre inférieur n'ont pas le même parcours de soins. Choisir la zone et le trouble suspecté permet d'adapter les conseils, les délais et le professionnel à consulter."
        example="Exemple de réponse : « J'ai mal sous le talon dès les premiers pas du matin » → Aponévrosite plantaire. Si vous hésitez, choisissez le trouble dont la description ressemble le plus à vos symptômes."
      />

      <div className="grid gap-4">
        {conditions.map((item) => (
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
              <span className="mt-2 block space-y-1.5 text-sm">
                <span className="block text-muted-foreground">
                  <span className="font-medium text-foreground">Où ça fait mal : </span>
                  {item.location}
                </span>
                <span className="block text-muted-foreground">
                  <span className="font-medium text-foreground">Ce que ça donne : </span>
                  {item.feels}
                </span>
                <span className="block text-muted-foreground">
                  <span className="font-medium text-foreground">Ça se déclenche quand : </span>
                  {item.triggers}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionView({
  question,
  condition,
  stepNumber,
  onSelect,
  onBack,
}: {
  question: (typeof triageQuestions)[number];
  condition: Condition;
  stepNumber: number;
  onSelect: (option: TriageOption) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-care">{condition.name}</p>
          <h2 className="mt-1 text-lg font-semibold text-card-foreground">{question.question}</h2>
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

      <div className="rounded-xl border border-border bg-muted/60 p-4">
        <div className="flex gap-4">
          <span className="w-14 shrink-0">
            <LegDiagram spot={condition.spot} label={condition.name} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{condition.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{condition.summary}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Où ça fait mal : </span>
              {condition.location}
            </p>
          </div>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="inline font-medium text-foreground">Premier réflexe : </dt>
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

      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-medium text-foreground">Vos réponses</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
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
