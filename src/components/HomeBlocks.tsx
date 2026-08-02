import { AlertTriangle, ArrowRight, Clock, HeartPulse, Stethoscope } from "lucide-react";
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
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Une douleur au genou, à la cheville, à la hanche ou au pied ?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Les troubles musculo-squelettiques les plus courants des membres inférieurs : comprendre la suite, savoir qui
          consulter et à quel moment.
        </p>
      </div>
    </section>
  );
}

export function EntryGrid() {
  return (
    <section className="pb-12 md:pb-16">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <EntryCard
          to="/orientation"
          icon={HeartPulse}
          title="Je ressens une douleur"
          description="Évaluez la situation et recevez une orientation vers le bon niveau de soins."
          tone="urgent"
        />
        <EntryCard
          to="/parcours"
          icon={Stethoscope}
          title="Le diagnostic est posé"
          description="Découvrez la chronologie type : soins, kiné, rééducation et retour à l'activité."
          tone="care"
        />
        <EntryCard
          to="/conseils"
          icon={Clock}
          title="Conseils du quotidien"
          description="Glace, repos, orthèse, sommeil : les bons réflexes entre deux consultations."
          tone="soothe"
        />
        <EntryCard
          to="/annuaire"
          icon={MapPin}
          title="Qui voir près de chez moi"
          description="Saint-Maur-des-Fossés : votre prochaine étape et les professionnels sur une carte."
          tone="care"
        />
      </div>
    </section>
  );
}
