import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
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
import { askCareAgent } from "@/lib/care-agent";
import { LegDiagram } from "@/components/LegDiagram";
import { DoctorSummary } from "@/components/DoctorSummary";
type CarePlan = {
  level: TriageLevel;
  title: string;
  summary: string;
  condition: string;
  nextStep: string;
  timeline: string;
  stages: { label: string; title: string; detail: string }[];
  escalation: string[];
  resources: string[];
};

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
          "Décrivez votre douleur, répondez à trois questions expliquées et découvrez quel trouble du membre inférieur correspond à votre situation.",
      },
      { property: "og:title", content: "Orientation — Kivoir" },
      {
        property: "og:description",
        content:
          "Décrivez votre douleur, répondez à trois questions expliquées et découvrez quel trouble du membre inférieur correspond à votre situation.",
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

const totalSteps = triageQuestions.length + 3; // zone + 3 triage + 1 trouble choice

type Step =
  | { type: "zone" }
  | { type: "triage"; index: number }
  | { type: "condition" }
  | { type: "result" };

function OrientationPage() {
  const [zone, setZone] = useState<string | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [answers, setAnswers] = useState<TriageOption[]>([]);
  const [agentMessage, setAgentMessage] = useState("");
  const [agentReply, setAgentReply] = useState<CarePlan | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  const handleAgentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agentMessage.trim() || agentLoading) return;
    setAgentLoading(true);
    setAgentReply("");
    try {
      const response = await askCareAgent({ data: { message: agentMessage, zone: zone ?? undefined } });
      setAgentReply(parseCarePlan(response.text));
    } catch {
      setAgentReply(null);
    } finally {
      setAgentLoading(false);
    }
  };

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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Orientation rapide</h1>
      <p className="mt-2 text-muted-foreground">
        Dites-nous d'abord où vous avez mal, puis répondez à 3 questions expliquées. Kivoir vous proposera les troubles les plus probables et ce qu'il faut faire.
      </p>

      <div className="mt-6 flex items-center gap-2" aria-label={`Étape ${stepNumber} sur ${totalSteps}`}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < stepNumber ? "bg-care" : "bg-muted"}`}
          />
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-care/20 bg-care/5 p-5 md:p-6" aria-labelledby="agent-title">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-care text-primary-foreground"><HeartPulse aria-hidden="true" /></div>
          <div>
            <h2 id="agent-title" className="font-semibold text-foreground">Parler à l’assistant parcours de soins</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Décrivez votre douleur. L’assistant vous aide à trouver la prochaine étape parmi les 10 situations étudiées.</p>
          </div>
        </div>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleAgentSubmit}>
          <input
            value={agentMessage}
            onChange={(event) => setAgentMessage(event.target.value)}
            placeholder="Ex. douleur sur le côté du genou depuis 2 semaines…"
            aria-label="Décrivez votre douleur"
            maxLength={800}
            className="min-h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none ring-care transition focus:ring-2"
          />
          <button type="submit" disabled={agentLoading || agentMessage.trim().length < 3} className="min-h-11 rounded-xl bg-care px-5 text-sm font-semibold text-primary-foreground transition hover:bg-care/90 disabled:cursor-not-allowed disabled:opacity-50">
            {agentLoading ? "Analyse…" : "Être orienté"}
          </button>
        </form>
        {agentReply ? <CarePlanCard plan={agentReply} /> : null}
        <p className="mt-3 text-xs text-muted-foreground">Cet assistant ne pose pas de diagnostic. En cas de signe inquiétant ou d’urgence, appelez le 15 ou le 112.</p>
      </section>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
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

function parseCarePlan(text: string): CarePlan {
  try {
    const parsed = JSON.parse(text) as CarePlan;
    if (parsed.title && parsed.nextStep && Array.isArray(parsed.stages)) return parsed;
  } catch {
    // The local fallback is always JSON; this protects the UI from a provider returning prose.
  }
  return {
    level: "professional",
    title: "Consultation à organiser",
    summary: text,
    condition: "Douleur du membre inférieur",
    nextStep: "Prenez rendez-vous avec votre médecin généraliste pour une première évaluation.",
    timeline: "Dans les prochains jours",
    stages: [{ label: "1re ligne", title: "Médecin généraliste", detail: "Évalue la situation et vous oriente vers le professionnel adapté." }],
    escalation: ["Douleur intense, aggravation ou signe inhabituel : demandez un avis rapidement."],
    resources: ["Parcours guidé", "Conseils validés", "Annuaire des professionnels"],
  };
}

function CarePlanCard({ plan }: { plan: CarePlan }) {
  const Icon = levelIcons[plan.level];
  return (
    <div className={`mt-4 rounded-2xl border p-5 ${levelClasses[plan.level]}`} role="status">
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 shrink-0" />
        <div><p className="text-xs font-semibold uppercase tracking-wide">Parcours proposé</p><h3 className="mt-1 text-xl font-semibold">{plan.title}</h3><p className="mt-1 text-sm leading-6">{plan.summary}</p></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-background/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide">Situation étudiée</p><p className="mt-1 font-medium">{plan.condition}</p></div>
        <div className="rounded-xl bg-background/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide">Prochaine étape · {plan.timeline}</p><p className="mt-1 font-medium">{plan.nextStep}</p></div>
      </div>
      <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wide">Votre parcours, dans l’ordre</p><ol className="mt-3 grid gap-3">{plan.stages.map((stage, index) => <li key={`${stage.title}-${index}`} className="flex gap-3 rounded-xl bg-background/70 p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-care text-xs font-semibold text-primary-foreground">{index + 1}</span><div><p className="font-semibold">{stage.title}</p><p className="text-sm leading-6">{stage.detail}</p></div></li>)}</ol></div>
      <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wide">Quand accélérer</p><ul className="mt-2 grid gap-1 text-sm">{plan.escalation.map((item) => <li key={item}>• {item}</li>)}</ul></div>
      <div className="mt-5 flex flex-wrap gap-2">{plan.resources.map((resource) => <span key={resource} className="rounded-full bg-background/70 px-3 py-1 text-xs font-medium">{resource}</span>)}</div>
    </div>
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

      <ContextBlocks
        context="La localisation de la douleur est le premier élément qui permet d'orienter le diagnostic. Chaque zone du membre inférieur a ses pathologies typiques et son réseau de soins."
        example="Exemple de réponse : « J'ai mal à l'intérieur du genou, juste sous la rotule, depuis quelques jours » → choisissez Genou."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => onSelect(z.id)}
            className="flex flex-col gap-1 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-care/40 hover:bg-care-muted/30"
          >
            <span className="font-medium text-foreground">{z.label}</span>
            <span className="text-sm text-muted-foreground">{z.description}</span>
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
          Quel trouble ressemble le plus à votre situation ?
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">Étape {totalSteps}</span>
      </div>

      <ContextBlocks
        context="Vous avez indiqué la zone et les signes principaux. On affiche maintenant les troubles les plus fréquents de cette zone. Choisissez celui dont la description, la localisation et les déclencheurs correspondent le mieux à ce que vous ressentez."
        example="Exemple de réponse : « Mal sous le talon aux premiers pas du matin » → Aponévrosite plantaire."
      />

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
