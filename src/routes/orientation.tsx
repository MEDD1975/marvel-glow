import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
  RefreshCcw,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { LegDiagram } from "@/components/LegDiagram";
import { DoctorSummary } from "@/components/DoctorSummary";
import {
  conditions,
  getQuestionsForZone,
  questionsPerFlow,
  type Condition,
  type TriageOption,
  type TriageQuestion,
  type Zone,
} from "@/lib/conditions";

export const Route = createFileRoute("/orientation")({
  head: () => ({
    meta: [
      { title: "Questionnaire de pré-consultation — Kivoir" },
      {
        name: "description",
        content:
          "Décrivez votre douleur et votre gêne pour aider le professionnel à préparer la consultation.",
      },
      { property: "og:title", content: "Questionnaire de pré-consultation — Kivoir" },
      {
        property: "og:description",
        content:
          "Décrivez votre douleur et votre gêne pour aider le professionnel à préparer la consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrientationPage,
});

const zones: { id: Zone; label: string; description: string }[] = [
  { id: "Hanche", label: "Hanche", description: "Aine, fesse, haut de la cuisse" },
  { id: "Genou", label: "Genou", description: "Rotule, interligne, face interne ou externe" },
  { id: "Cheville", label: "Cheville", description: "Malléoles, tendon d'Achille, talon" },
  { id: "Pied", label: "Pied", description: "Plante, avant-pied, orteils, bord interne" },
];

const totalSteps = questionsPerFlow + 2; // zone + questions (tronc + zone + alerte) + précision de la zone

type Step =
  | { type: "zone" }
  | { type: "triage"; index: number }
  | { type: "condition" }
  | { type: "result" };

function OrientationPage() {
  const [zone, setZone] = useState<Zone | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [answers, setAnswers] = useState<TriageOption[]>([]);
  const questions: TriageQuestion[] = zone ? getQuestionsForZone(zone) : [];
  const step = getStep(zone, answers, condition, questions);
  const stepNumber = getStepNumber(step);
  const currentQuestion = step.type === "triage" ? questions[step.index] : null;
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
        <p className="text-sm font-semibold uppercase tracking-wide text-care">Questionnaire Kivoir</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Préparez votre consultation</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">Des questions adaptées à la zone qui vous fait mal, pour permettre au médecin de gagner du temps pendant l’échange. À la fin, un QR code résume vos réponses pour votre médecin.</p>
        <Link to="/conseils" className="mt-5 inline-flex min-h-11 items-center text-base font-semibold text-care hover:underline">Voir les conseils et vidéos <ArrowRight aria-hidden="true" className="ml-2 size-5" /></Link>
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
        <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wide text-care">Avant la consultation</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Décrivez ce que vous ressentez</h2><p className="mt-1 text-base leading-7 text-muted-foreground">Vos réponses sont déclaratives. Le professionnel les interprète avec son examen clinique et décide de la suite.</p></div>
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
            questions={questions}
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

function getStep(
  zone: Zone | null,
  answers: TriageOption[],
  condition: Condition | null,
  questions: TriageQuestion[],
): Step {
  if (!zone) return { type: "zone" };
  if (answers.length < questions.length) return { type: "triage", index: answers.length };
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

function ZonePicker({ onSelect }: { onSelect: (zone: Zone) => void }) {
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
          Quelle zone décrit le mieux votre douleur ?
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">Étape {totalSteps}</span>
      </div>

      <p className="text-sm text-muted-foreground">Cette précision complète votre description. Elle n’établit aucun diagnostic : c’est le médecin qui l’interprète.</p>

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
  question: TriageQuestion;
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
  questions,
  onBack,
  onReset,
}: {
  condition: Condition;
  answers: TriageOption[];
  questions: TriageQuestion[];
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-care/20 bg-care/5 p-4 text-care">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <div>
          <p className="text-sm font-medium">Questionnaire terminé</p>
          <p className="text-lg font-semibold text-foreground">Merci, votre description est prête pour le médecin</p>
        </div>
      </div>

      <p className="text-muted-foreground">
        Vos réponses sont déclaratives et n’établissent aucun diagnostic. Le médecin les consultera, réalisera son
        examen et vous expliquera la suite : examens éventuels, traitement et professionnels à voir.
      </p>

      <DoctorSummary condition={condition} answers={answers} questions={questions} />

      <div className="rounded-xl border border-border bg-muted/60 p-4">
        <div className="flex gap-4">
          <span className="w-14 shrink-0">
            <LegDiagram spot={condition.spot} label={condition.name} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">Zone décrite</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{condition.zone}</span> — {condition.location}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-medium text-foreground">Vos réponses</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            Zone de douleur — <span className="text-foreground">{condition.zone}</span>
          </li>
          {answers.map((answer, i) => (
            <li key={i}>
              {questions[i]?.question} — <span className="text-foreground">{answer.label}</span>
            </li>
          ))}
        </ul>
      </div>

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
