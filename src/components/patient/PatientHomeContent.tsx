import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Signpost,
  type LucideIcon,
} from "lucide-react";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { countLearningContent, formatLearningSummary, totalLearningContent } from "@/lib/learning-content";
import { LoadingState, SafetyNotice } from "@/components/patient/PatientUi";
import { conditions } from "@/lib/conditions";
import { zoneVisuals } from "@/lib/zone-visuals";

const sectionTones = {
  green: {
    icon: "bg-[#E5F6EE] text-[#16845B]",
    border: "border-[#BFE8D3] bg-[#F4FCF8]",
  },
  blue: {
    icon: "bg-[#E3EEFF] text-[#1764C0]",
    border: "border-[#C5DAF7] bg-[#F5F9FF]",
  },
  orange: {
    icon: "bg-[#FFF0CF] text-[#9A6100]",
    border: "border-[#F2D9A5] bg-[#FFFBF2]",
  },
  neutral: {
    icon: "bg-[#FCE5E5] text-[#B4232A]",
    border: "border-[#F0C7C7] bg-[#FFF8F8]",
  },
} as const;

const linkCardSurfaces: Partial<Record<keyof typeof sectionTones, string>> = {
};

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
      className={`flex min-h-[104px] items-center gap-4 rounded-[22px] border px-5 py-5 shadow-[0_4px_12px_rgba(16,28,51,0.045)] transition-all hover:-translate-y-0.5 hover:border-[#0B63CE] hover:shadow-[0_8px_20px_rgba(11,99,206,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${linkCardSurfaces[tone] ?? "bg-white"} ${classes.border}`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${classes.icon}`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[1.08rem] font-bold leading-snug text-[#101C33]">{title}</span>
        <span className="mt-1 block text-[0.98rem] leading-snug text-[#526176]">{intro}</span>
      </span>
      <ChevronRight className="h-6 w-6 shrink-0 text-[#0B63CE]" aria-hidden="true" />
    </Link>
  );
}

export function PatientHomeContent() {
  const { ready, guide, hasContext, cabinetName } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;

  const resourceCounts = countLearningContent(guide, resources.data ?? []);
  const resourceTotal = totalLearningContent(resourceCounts);

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
          Les prochaines étapes après votre consultation
        </h1>
        <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed text-[#526176] md:text-lg">
          Retrouvez les conseils de votre médecin, les bons gestes à adopter et les professionnels adaptés à votre situation.
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

      {resourceTotal > 0 ? (
        <HomeLinkCard
          to="/patient/ressources"
          icon={GraduationCap}
          tone="blue"
          title="Ressources utiles"
          intro={formatLearningSummary(resourceCounts)}
        />
      ) : null}

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
