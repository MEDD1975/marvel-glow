import { AlertTriangle, ArrowRight, HeartPulse, MapPin, PlayCircle, Stethoscope } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const medicalDisclaimer = "Cette application est un outil d'information. Elle ne remplace pas un avis médical, un diagnostic ou un traitement. En cas de doute, consultez un professionnel de santé.";

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-urgent/20 bg-urgent/5 p-4 text-sm text-foreground ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-urgent" />
        <p>{medicalDisclaimer}</p>
      </div>
    </div>
  );
}

export function EntryCard({
  to,
  icon: Icon,
  title,
  description,
  tone,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tone: "care" | "urgent" | "soothe";
}) {
  const toneClasses = {
    care: "bg-care/10 text-care hover:bg-care/15",
    urgent: "bg-urgent/10 text-urgent hover:bg-urgent/15",
    soothe: "bg-soothe/30 text-soothe-foreground hover:bg-soothe/40",
  };

  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1 text-sm font-medium text-care">
        Commencer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export function HomeHero() {
  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
          Une douleur au genou, à la cheville, à la hanche ou au pied ?
        </h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">
          Kivoir vous dit <strong className="text-foreground">qui consulter</strong>, dans quel ordre et dans quel
          délai. Choisissez votre situation :
        </p>
      </div>

      <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
        <Link
          to="/orientation"
          className="group flex flex-col gap-3 rounded-2xl border-2 border-urgent/30 bg-card p-6 text-left shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-urgent/10 text-urgent">
            <HeartPulse className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-card-foreground">
            J'ai mal, je ne sais pas quoi faire
          </h2>
          <p className="text-sm text-muted-foreground">
            3 questions pour repérer les signes d'urgence et savoir qui consulter en premier.
          </p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-urgent">
            Décrire ma douleur <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/parcours"
          className="group flex flex-col gap-3 rounded-2xl border-2 border-care/30 bg-card p-6 text-left shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-care/10 text-care">
            <Stethoscope className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-card-foreground">J'ai déjà un diagnostic</h2>
          <p className="text-sm text-muted-foreground">
            Voyez la suite du parcours : kiné, imagerie, spécialiste, délais et étapes à venir.
          </p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-care">
            Voir mon parcours <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-muted-foreground">
        3 minutes, sans compte, sans donnée enregistrée.
      </p>
    </section>
  );
}

export function EntryGrid() {
  return (
    <section className="px-4 pb-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ou allez directement à…
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <EntryCard
            to="/conseils"
            icon={PlayCircle}
            title="Vidéos & exercices"
            description="Choisissez votre trouble pour voir immédiatement des vidéos et des exercices adaptés."
            tone="urgent"
          />
          <EntryCard
            to="/annuaire"
            icon={MapPin}
            title="Qui voir près de chez moi"
            description="Saint-Maur-des-Fossés : votre prochaine étape et les professionnels sur une carte."
            tone="care"
          />
        </div>
      </div>
    </section>
  );
}


