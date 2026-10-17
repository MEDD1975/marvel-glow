import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Signpost,
  type LucideIcon,
} from "lucide-react";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import {
  countLearningContent,
  formatLearningSummary,
  totalLearningContent,
} from "@/lib/learning-content";
import { LoadingState, SafetyNotice } from "@/components/patient/PatientUi";
import { conditions } from "@/lib/conditions";
import { zoneVisuals } from "@/lib/zone-visuals";

const sectionTones = {
  green: { icon: "bg-[#F1F8F5] text-[#17855B]", border: "border-[#DCE5F0]" },
  blue: { icon: "bg-[#F2F6FB] text-[#0B63CE]", border: "border-[#DCE5F0]" },
  orange: { icon: "bg-white text-[#9A6100]", border: "border-[#F0DBAE] bg-[#FFF9ED]" },
  neutral: { icon: "bg-[#FDECEC] text-[#B4232A]", border: "border-[#DCE5F0]" },
  learn: { icon: "bg-[#0B63CE] text-white", border: "border-[#C9DCF3]" },
} as const;

const linkCardSurfaces: Partial<Record<keyof typeof sectionTones, string>> = {
  learn: "bg-[#F5F9FE]",
};

function lowercaseFirst(name: string) {
  const second = name.charAt(1);
  if (second && second === second.toUpperCase() && second !== second.toLowerCase()) return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function HomeLinkCard({
  to,
  icon: Icon,
  tone,
  title,
  intro,
  ariaLabel,
}: {
  to: string;
  icon: LucideIcon;
  tone: keyof typeof sectionTones;
  title: string;
  intro: string;
  ariaLabel?: string;
}) {
  const classes = sectionTones[tone];
  return (
    <Link
      to={to}
      aria-label={ariaLabel ? `${ariaLabel} – ${intro}` : undefined}
      className={`flex items-center gap-3 rounded-[18px] border p-4 shadow-[0_1px_3px_rgba(16,28,51,0.04)] transition-colors hover:border-[#0B63CE] hover:bg-[#F2F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${linkCardSurfaces[tone] ?? "bg-white"} ${classes.border}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-snug text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{intro}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#0B63CE]" aria-hidden="true" />
    </Link>
  );
}

export function PatientHomeContent() {
  const { ready, guide, hasContext, cabinetName } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;

  const learningCounts = countLearningContent(guide, resources.data ?? []);
  const learningTotal = totalLearningContent(learningCounts);
  const learningTitle = guide
    ? `Mieux comprendre votre ${lowercaseFirst(guide.name)}`
    : "Mieux comprendre votre atteinte";

  const recommendationCount = guide?.recommendations.length ?? 0;
  const conditionZone = guide ? conditions.find((condition) => condition.id === guide.id)?.zone : undefined;
  const anatomyVisual = conditionZone ? zoneVisuals[conditionZone] : null;

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="home-title" className="mb-2">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#0B63CE]">Votre parcours, simplement</p>
        <h1
          id="home-title"
          className="max-w-[16ch] text-balance font-display text-[clamp(2.15rem,9vw,3rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[#101C33] md:max-w-[18ch] md:text-5xl"
        >
          Les bons gestes pour récupérer sereinement
        </h1>
        <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed text-[#526176] md:text-lg">
          Votre médecin a préparé les prochaines étapes. Commencez par ce qui compte maintenant.
        </p>
      </section>

      {hasContext && guide ? (
        <section
          aria-labelledby="diagnostic-title"
          className="relative overflow-hidden rounded-[24px] border border-[#C9DCF3] border-l-4 border-l-[#0B63CE] bg-[linear-gradient(135deg,#EAF3FF_0%,#F7FBFF_62%,#EEF9F5_100%)] px-5 py-5 shadow-[0_12px_30px_rgba(11,99,206,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0B63CE] md:text-[13px]">
            Parcours transmis par votre médecin
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <h2
              id="diagnostic-title"
              className="min-w-0 flex-1 text-pretty break-words text-2xl font-bold leading-tight text-[#101C33] md:text-[1.75rem]"
            >
              {guide.name}
            </h2>
            <img
              src={anatomyVisual?.src ?? ""}
              alt={anatomyVisual?.alt ?? ""}
              loading="eager"
              decoding="async"
              className="h-14 w-14 shrink-0 rounded-xl bg-white/80 object-cover ring-1 ring-[#C9DCF3]"
            />
          </div>
          {cabinetName ? (
            <p className="mt-2 flex items-start gap-1.5 text-sm leading-snug text-[#526176] md:text-[15px]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0B63CE]" aria-hidden="true" />
              <span className="break-words">{cabinetName}</span>
            </p>
          ) : null}
        </section>
      ) : null}

      <HomeLinkCard
        to="/conseils"
        icon={CheckCircle2}
        tone="green"
        title="Commencer maintenant"
        intro={
          recommendationCount
            ? `${recommendationCount} conseils à appliquer après la consultation`
            : "Les conseils à appliquer après la consultation"
        }
      />

      {learningTotal > 0 ? (
        <HomeLinkCard
          to="/patient/ressources"
          icon={GraduationCap}
          tone="learn"
          title={learningTitle}
          intro={formatLearningSummary(learningCounts)}
        />
      ) : (
        <div
          className="flex items-center gap-3 rounded-[18px] border border-[#E4EAF2] bg-[#FAFBFD] p-4"
          aria-live="polite"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#6B7A90]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold leading-snug text-foreground">
              {learningTitle}
            </span>
            <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
              {resources.isLoading
                ? "Recherche des contenus disponibles…"
                : "Aucun contenu complémentaire n’est disponible pour le moment."}
            </span>
          </span>
        </div>
      )}

      <HomeLinkCard
        to="/parcours"
        icon={Signpost}
        tone="blue"
        title="Et si la gêne évolue ?"
        intro="Retrouvez simplement quoi faire selon l’évolution que vous observez."
      />

      <HomeLinkCard
        to="/patient/surveiller"
        icon={AlertTriangle}
        tone="neutral"
        title="Points à surveiller"
        intro="Sachez dans quelles situations demander rapidement un avis."
        ariaLabel="Voir les points à surveiller"
      />

      <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Kivoir affiche un parcours d’information sélectionné par votre professionnel de santé. Aucun
        compte patient n’est nécessaire. Ne saisissez aucune information personnelle ou médicale.
      </p>

      <SafetyNotice />
    </div>
  );
}
