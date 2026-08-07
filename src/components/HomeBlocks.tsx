import {
  AlertTriangle,
  ArrowRight,
  Bone,
  Footprints,
  HeartPulse,
  MapPin,
  Move,
  PersonStanding,
  PlayCircle,
  Stethoscope,
} from "lucide-react";
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

export type HomeSource = "affiche" | "carte" | "direct";

const sourceIntro: Record<HomeSource, { badge: string; title: string }> = {
  affiche: {
    badge: "En salle d'attente",
    title: "Préparez votre consultation en 3 minutes",
  },
  carte: {
    badge: "Carte de votre médecin",
    title: "Tout savoir sur votre trouble",
  },
  direct: {
    badge: "Outil proposé par votre médecin",
    title: "Où avez-vous mal ?",
  },
};

const zones: { label: "Genou" | "Cheville" | "Hanche" | "Pied"; icon: React.ElementType }[] = [
  { label: "Genou", icon: Bone },
  { label: "Cheville", icon: Move },
  { label: "Hanche", icon: PersonStanding },
  { label: "Pied", icon: Footprints },
];

export function HomeHero({ source = "direct" }: { source?: HomeSource }) {
  const intro = sourceIntro[source];

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-care/10 px-3 py-1 text-xs font-semibold text-care">
          <Stethoscope className="h-3.5 w-3.5" />
          {intro.badge}
        </span>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {intro.title}
        </h1>
      </div>

      {/* Sélecteur visuel par zone du corps */}
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {zones.map(({ label, icon: Icon }) => (
          <Link
            key={label}
            to="/orientation"
            search={{ zone: label }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-care/40 hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-care/10 text-care transition-colors group-hover:bg-care group-hover:text-care-foreground">
              <Icon className="h-8 w-8" />
            </span>
            <span className="text-sm font-semibold text-card-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-muted-foreground">
        Sans compte, sans donnée enregistrée.
      </p>
    </section>
  );
}

const primaryActions: {
  to: string;
  icon: React.ElementType;
  title: string;
  tone: "urgent" | "care";
}[] = [
  { to: "/orientation", icon: HeartPulse, title: "J'ai mal, que faire ?", tone: "urgent" },
  { to: "/parcours", icon: Stethoscope, title: "J'ai déjà un diagnostic", tone: "care" },
];

export function EntryGrid() {
  const secondary = [
    { to: "/conseils", icon: PlayCircle, title: "Vidéos & exercices" },
    { to: "/annuaire", icon: MapPin, title: "Qui voir près de chez moi" },
  ];

  return (
    <section className="px-4 pb-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {primaryActions.map(({ to, icon: Icon, title, tone }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-4 rounded-2xl border-2 bg-card p-5 shadow-sm transition-all hover:shadow-md ${
                tone === "urgent" ? "border-urgent/30 hover:border-urgent/60" : "border-care/30 hover:border-care/60"
              }`}
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                  tone === "urgent" ? "bg-urgent/10 text-urgent" : "bg-care/10 text-care"
                }`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className="text-lg font-semibold text-card-foreground">{title}</span>
              <ArrowRight
                className={`ml-auto h-5 w-5 transition-transform group-hover:translate-x-1 ${
                  tone === "urgent" ? "text-urgent" : "text-care"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {secondary.map(({ to, icon: Icon, title }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-care/40 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soothe/40 text-soothe-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-card-foreground">{title}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
