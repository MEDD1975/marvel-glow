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
  "Cet outil numérique ne remplace pas un avis médical. En cas de doute, consultez un professionnel de santé.";

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
    <section className="px-4 pb-10 pt-8 md:pb-14 md:pt-12">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/80 bg-card p-5 shadow-sm md:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-care">
          <Bot className="h-4 w-4" aria-hidden="true" />
          Proposé par votre médecin
        </div>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-4xl">
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
            className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-care/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/10">
              <MessageCircleQuestion className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-sm leading-6 text-foreground">
              Votre médecin a identifié votre trouble et vous avez encore des questions&nbsp;?
            </span>
          </button>

          <button
            type="button"
            onClick={openAssistant}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-care/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/10">
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
            className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-care/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/10">
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
          className="group mt-6 flex w-full items-center gap-4 rounded-2xl bg-primary p-4 text-left text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-5"
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
