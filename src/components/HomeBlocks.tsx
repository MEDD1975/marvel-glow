import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bot,
  Compass,
  Lightbulb,
  MessageCircleQuestion,
  PlayCircle,
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

function openAssistant() {
  window.dispatchEvent(new CustomEvent("kivoir:open-assistant"));
}

export function AssistantHome() {
  return (
    <section className="px-4 pb-8 pt-8 md:pb-12 md:pt-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-care">
          <Bot className="h-4 w-4" aria-hidden="true" />
          Proposé par votre médecin
        </div>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Bienvenue sur Kivoir
        </h1>
        <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground">
          Votre outil d&apos;aide au parcours de soins, à utiliser quand vous voulez entre deux
          rendez-vous. Que souhaitez-vous faire&nbsp;?
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={openAssistant}
            className="group flex items-center gap-4 rounded-2xl border border-care/25 bg-care/5 p-4 text-left transition-colors hover:bg-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-care/15 text-care">
              <MessageCircleQuestion className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-sm leading-6 text-foreground">
              Votre médecin a identifié votre trouble et vous avez encore des questions&nbsp;?
            </span>
          </button>

          <button
            type="button"
            onClick={openAssistant}
            className="group flex items-center gap-4 rounded-2xl border border-care/25 bg-care/5 p-4 text-left transition-colors hover:bg-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-care/15 text-care">
              <Lightbulb className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-sm leading-6 text-foreground">
              Dans l&apos;attente de vos prochains rendez-vous, vous souhaitez voir des vidéos
              d&apos;information ou avoir des conseils&nbsp;?
            </span>
          </button>

          <button
            type="button"
            onClick={openAssistant}
            className="group flex items-center gap-4 rounded-2xl border border-care/25 bg-care/5 p-4 text-left transition-colors hover:bg-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-care/15 text-care">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-sm leading-6 text-foreground">
              Vous souhaitez savoir avec quel professionnel de santé se passe la suite de votre prise
              en charge&nbsp;?
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={openAssistant}
          className="group mt-5 flex w-full items-center gap-3 rounded-2xl bg-primary p-4 text-left text-primary-foreground shadow-md shadow-primary/15 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Poser vos questions à l&apos;Assistant Kivoir</span>
            <span className="mt-0.5 block text-sm text-primary-foreground/85">
              Appuyez ici pour poser votre question dès maintenant
            </span>
          </span>
        </button>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <PlayCircle className="h-4 w-4 text-care" aria-hidden="true" />
          Sans compte · Disponible à tout moment · Vos réponses restent confidentielles
        </p>
      </div>
    </section>
  );
}
