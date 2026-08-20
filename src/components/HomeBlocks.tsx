import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  MessageCircleQuestion,
  TrendingUp,
} from "lucide-react";

export const medicalDisclaimer =
  "Cette application informe et ne remplace pas un avis médical. En cas de doute, consultez un professionnel de santé.";

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-urgent/20 bg-urgent/5 p-4 text-sm text-foreground ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-urgent" aria-hidden="true" />
        <p>{medicalDisclaimer}</p>
      </div>
    </div>
  );
}

const capabilities = [
  {
    icon: TrendingUp,
    title: "Évaluer votre récupération",
    description: "Faites le point sur votre évolution et identifiez ce qui mérite votre attention.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Comprendre douleurs et consignes",
    description: "Posez vos questions avec vos mots, depuis chez vous, quand vous en avez besoin.",
  },
  {
    icon: MapPin,
    title: "Être orienté au bon moment",
    description: "Retrouvez le professionnel adapté dans le réseau de soins de votre médecin.",
  },
];

function openAssistant() {
  window.dispatchEvent(new CustomEvent("kivoir:open-assistant"));
}

export function AssistantHome() {
  return (
    <>
      <section className="px-4 pb-10 pt-10 md:pb-16 md:pt-16">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-care/20 bg-card shadow-sm">
            <div className="flex flex-col gap-10 p-6 md:p-10 lg:flex-row lg:items-center lg:p-12">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-care/20 bg-care/10 px-3 py-1.5 text-xs font-semibold text-care">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  Votre suivi continue à la maison
                </span>
                <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] text-card-foreground md:text-6xl">
                  Après la consultation, vous n&apos;êtes pas seul.
                </h1>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-xl">
                  L&apos;Assistant Kivoir vous accompagne dans votre récupération, répond à vos
                  questions sur vos douleurs ou vos consignes et vous aide à savoir quand revoir un
                  professionnel de santé.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openAssistant}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    Parler à l&apos;Assistant Kivoir
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <Link
                    to="/annuaire"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-care/30 bg-background px-5 py-3 text-sm font-semibold text-care transition-colors hover:bg-care/10"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Accéder au réseau de mon médecin
                  </Link>
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Sans compte · Disponible à tout moment · Vos réponses restent confidentielles
                </p>
              </div>

              <aside className="shrink-0 rounded-2xl border border-border bg-background p-5 lg:w-80">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-care/10 text-care">
                    <Bot className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Assistant Kivoir</p>
                    <p className="text-xs text-muted-foreground">Compagnon post-consultation</p>
                  </div>
                </div>
                <p className="mt-5 rounded-2xl rounded-bl-md border border-border bg-card p-4 text-sm leading-6 text-card-foreground">
                  Bonjour. Comment évolue votre douleur depuis votre consultation ?
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" aria-hidden="true" />
                    Une réponse claire et adaptée à votre situation
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" aria-hidden="true" />
                    Une orientation si votre évolution le nécessite
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 md:pb-16" aria-labelledby="assistant-capabilities">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-care">À vos côtés entre deux rendez-vous</p>
            <h2
              id="assistant-capabilities"
              className="mt-2 text-balance text-2xl font-semibold text-foreground md:text-3xl"
            >
              Le bon repère, au moment où une question se pose
            </h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {capabilities.map((capability) => (
              <article key={capability.title} className="rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-care/10 text-care">
                  <capability.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-card-foreground">{capability.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-care/20 bg-care/5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-sm font-semibold text-care">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Besoin de consulter ?
              </p>
              <h2 className="mt-2 text-balance text-xl font-semibold text-foreground md:text-2xl">
                Retrouvez les spécialistes recommandés par votre médecin
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Accédez directement à l&apos;annuaire de son réseau de soins et trouvez le bon
                professionnel sans repartir de zéro.
              </p>
            </div>
            <Link
              to="/annuaire"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ouvrir l&apos;Annuaire
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
