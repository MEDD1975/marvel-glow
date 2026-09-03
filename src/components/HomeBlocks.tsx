import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  ClipboardList,
  Compass,
  Lightbulb,
  MapPin,
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
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">Poser une question sur ma pathologie</span>
              <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                L&apos;Assistant Kivoir vous informe et peut vous partager des vidéos adaptées.
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-care transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>

          <Link
            to="/conseils"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-care/10 text-care">
              <Lightbulb className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">Des conseils en attendant mon rendez-vous</span>
              <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                Les bons gestes et repères pour agir en attendant votre prochain interlocuteur.
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-care transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <Link
            to="/parcours"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-care/10 text-care">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">Où j&apos;en suis dans mon parcours</span>
              <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                Retrouvez la prochaine étape et le professionnel de santé à consulter ensuite.
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-care transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/annuaire"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <MapPin className="h-5 w-5 shrink-0 text-care" aria-hidden="true" />
            Le réseau de mon médecin
          </Link>
          <Link
            to="/orientation"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ClipboardList className="h-5 w-5 shrink-0 text-care" aria-hidden="true" />
            Faire le point (questionnaire)
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageCircleQuestion className="h-4 w-4 text-care" aria-hidden="true" />
            Pourquoi utiliser l&apos;Assistant Kivoir&nbsp;?
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            <li className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-care" aria-hidden="true" />
              Votre médecin a identifié votre trouble et vous avez encore des questions&nbsp;?
            </li>
            <li className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-care" aria-hidden="true" />
              Dans l&apos;attente de votre prochain rendez-vous, vous souhaitez voir des vidéos
              d&apos;information ou avoir des conseils&nbsp;?
            </li>
            <li className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-care" aria-hidden="true" />
              Ou savoir avec quel professionnel de santé se poursuit votre prise en charge&nbsp;?
            </li>
          </ul>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <PlayCircle className="h-4 w-4 text-care" aria-hidden="true" />
          Sans compte · Disponible à tout moment · Vos réponses restent confidentielles
        </p>
      </div>
    </section>
  );
}
