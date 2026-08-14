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
  getQuestionsForZone,
  questionsPerFlow,
  zoneDescriptions,
  zoneSpots,
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

const totalSteps = questionsPerFlow + 1; // zone + questions (tronc + zone + alerte)

type Step =
  | { type: "zone" }
  | { type: "triage"; index: number }
  | { type: "result" };

function OrientationPage() {
  const [zone, setZone] = useState<Zone | null>(null);
  const [answers, setAnswers] = useState<TriageOption[]>([]);
  const questions: TriageQuestion[] = zone ? getQuestionsForZone(zone) : [];
  const step = getStep(zone, answers, questions);
  const stepNumber = getStepNumber(step);
  const currentQuestion = step.type === "triage" ? questions[step.index] : null;

  const handleBack = () => {
    if (answers.length > 0) {
      setAnswers(answers.slice(0, -1));
    } else if (zone) {
      setZone(null);
    }
  };

  const handleReset = () => {
    setZone(null);
    setAnswers([]);
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-care">Questionnaire Kivoir</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Préparez votre consultation</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">Des questions adaptées à votre douleur du membre inférieur (hanche, genou, cheville, pied), pour permettre au médecin de gagner du temps pendant l’échange. À la fin, un QR code résume vos réponses pour votre médecin.</p>
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
        ) : zone ? (
          <ResultView
            zone={zone}
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
  questions: TriageQuestion[],
): Step {
  if (!zone) return { type: "zone" };
  if (answers.length < questions.length) return { type: "triage", index: answers.length };
  return { type: "result" };
}

function getStepNumber(step: Step): number {
  switch (step.type) {
    case "zone":
      return 1;
    case "triage":
      return 2 + step.index;
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

<p className="text-sm text-muted-foreground">Choisissez la zone qui vous gêne le plus. Kivoir accompagne uniquement les douleurs du membre inférieur (hanche, genou, cheville, pied).</p>

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
  zone,
  answers,
  questions,
  onBack,
  onReset,
}: {
  zone: Zone;
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

      <DoctorSummary zone={zone} answers={answers} questions={questions} />

      <div className="rounded-xl border border-border bg-muted/60 p-4">
        <div className="flex gap-4">
          <span className="w-14 shrink-0">
            <LegDiagram spot={zoneSpots[zone]} label={zone} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">Zone décrite</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{zone}</span> — {zoneDescriptions[zone]}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-medium text-foreground">Vos réponses</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            Zone de douleur — <span className="text-foreground">{zone}</span>
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
