import { AlertTriangle, ArrowRight, HeartPulse, MapPin, PlayCircle, Stethoscope } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const medicalDisclaimer = "Cette application informe et ne remplace pas un avis médical. En cas de doute, consultez un professionnel de santé.";

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-urgent/20 bg-urgent/5 p-4 text-sm text-foreground ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-urgent" aria-hidden="true" />
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
    care: "bg-care/10 text-care group-hover:bg-care/15",
    urgent: "bg-urgent/10 text-urgent group-hover:bg-urgent/15",
    soothe: "bg-soothe/30 text-soothe-foreground group-hover:bg-soothe/40",
  };

  return (
    <Link
      to={to}
      className="group flex min-h-36 flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-care/40 hover:shadow-md"
    >
      <div className={`flex size-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-care">
        Ouvrir <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export type HomeSource = "affiche" | "carte" | "direct";

const sourceIntro: Record<HomeSource, { badge: string; title: string; lead: string }> = {
  affiche: { badge: "Proposé par votre médecin", title: "Trouvez la bonne prochaine étape", lead: "Répondez à 3 questions simples. Sans compte, sans jugement." },
  carte: { badge: "Votre parcours de soins", title: "Comprenez quoi faire maintenant", lead: "Des repères simples pour avancer sereinement." },
  direct: { badge: "Votre guide santé", title: "Que faire pour votre douleur ?", lead: "Choisissez la situation qui vous ressemble." },
};

export function HomeHero({ source = "direct" }: { source?: HomeSource }) {
  const intro = sourceIntro[source];
  const carteFirst = source === "carte";

  return (
    <section className="px-4 pb-8 pt-8 md:pb-12 md:pt-14">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-care/10 px-3 py-1 text-xs font-semibold text-care">
            <Stethoscope aria-hidden="true" />
            {intro.badge}
          </span>
          <h1 className="mt-4 max-w-xl text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{intro.title}</h1>
          <p className="mt-3 max-w-lg text-base leading-6 text-muted-foreground md:text-lg">{intro.lead}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/orientation"
            className={`group flex min-h-48 flex-col gap-4 rounded-3xl border-2 border-urgent/25 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-urgent/50 hover:shadow-lg ${carteFirst ? "order-2" : "order-1"}`}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-urgent/10 text-urgent">
              <HeartPulse aria-hidden="true" className="size-7" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">J&apos;ai une douleur</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Urgence, professionnel à consulter, première étape.</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-urgent">Démarrer <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span>
          </Link>

          <Link
            to="/parcours"
            className={`group flex min-h-48 flex-col gap-4 rounded-3xl border-2 border-care/25 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/50 hover:shadow-lg ${carteFirst ? "order-1" : "order-2"}`}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-care/10 text-care">
              <Stethoscope aria-hidden="true" className="size-7" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">J&apos;ai déjà un diagnostic</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Les prochaines étapes, dans le bon ordre.</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-care">Voir la suite <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>3 minutes</span><span>Sans compte</span><span>Aucune donnée enregistrée</span>
        </div>
      </div>
    </section>
  );
}

export function EntryGrid() {
  return (
    <section className="px-4 pb-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Besoin d&apos;une autre aide ?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <EntryCard to="/conseils" icon={PlayCircle} title="Exercices adaptés" description="Vidéos et conseils selon votre trouble." tone="soothe" />
          <EntryCard to="/annuaire" icon={MapPin} title="Trouver un professionnel" description="Les ressources utiles près de chez vous." tone="care" />
        </div>
      </div>
    </section>
  );
}
