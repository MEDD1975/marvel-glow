import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Eye,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { LoadingState, NoPathwayState, SafetyNotice } from "@/components/patient/PatientUi";
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
  details,
}: {
  to: string;
  icon: LucideIcon;
  tone: keyof typeof sectionTones;
  title: string;
  intro: string;
  ariaLabel?: string;
  details?: string[];
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
        {details?.length ? (
          <span className="mt-3 block space-y-1 text-sm leading-snug text-[#33445D]">
            {details.map((detail) => <span key={detail} className="block">• {detail}</span>)}
          </span>
        ) : null}
      </span>
      <ChevronRight className="h-6 w-6 shrink-0 text-[#0B63CE]" aria-hidden="true" />
    </Link>
  );
}

export function PatientHomeContent() {
  const { ready, guide, hasContext, cabinetName, doctorLabel } = usePatient();
  if (!ready) return <LoadingState />;

  const recommendationCount = guide?.recommendations.length ?? 0;
  const conditionZone = guide ? conditions.find((condition) => condition.id === guide.id)?.zone : undefined;
  const anatomyVisual = conditionZone ? zoneVisuals[conditionZone] : null;

  return (
    <div className="flex flex-col gap-4">
      {!hasContext || !guide ? <NoPathwayState /> : null}

      {hasContext && guide ? (
        <section
          aria-labelledby="diagnostic-title"
          className="relative overflow-hidden rounded-[24px] border border-[#C9DCF3] border-l-4 border-l-[#0B63CE] bg-[linear-gradient(135deg,#EAF3FF_0%,#F7FBFF_62%,#EEF9F5_100%)] px-5 py-5 shadow-[0_12px_30px_rgba(11,99,206,0.08)]"
        >
          <div className="flex items-center gap-3">
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
            <div className="mt-4 flex items-center gap-2 border-t border-[#C9DCF3] pt-3 text-sm text-[#526176]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0B63CE]" aria-hidden="true" />
              <span className="break-words">
                Parcours partagé par {cabinetName}
                {doctorLabel ? <span className="ml-1 text-xs text-[#6B7A90]">· {doctorLabel}</span> : null}
              </span>
            </div>
          ) : null}
        </section>
      ) : null}

      {hasContext && guide ? <>
      <HomeLinkCard
        to="/patient/parcours"
        icon={BookOpen}
        tone="blue"
        title="Comprendre mon parcours"
        intro={`Ce qui se passe habituellement pour ${guide.name.toLowerCase()}.`}
        details={guide.careSteps.slice(0, 2).map((step) => step.title)}
        ariaLabel="Comprendre mon parcours"
      />

      <HomeLinkCard
        to="/conseils"
        icon={CheckCircle2}
        tone="green"
        title="Retrouver mes conseils"
        intro={
          guide.recommendations.some((recommendation) => recommendation.validatedAt)
            ? recommendationCount === 1
              ? "La recommandation de votre professionnel de santé"
              : recommendationCount > 1
                ? `${recommendationCount} recommandations de votre professionnel de santé`
                : "Aucune recommandation complémentaire n’est disponible pour le moment."
            : recommendationCount === 1
              ? "1 conseil général à confirmer avec votre professionnel"
              : recommendationCount > 1
                ? `${recommendationCount} conseils généraux à confirmer avec votre professionnel`
                : "Aucun conseil complémentaire n’est disponible pour le moment."
        }
        details={guide.recommendations.slice(0, 3).map((recommendation) => recommendation.title)}
      />

      <p className="rounded-2xl border border-[#DCE5F0] bg-[#F7FAFE] px-4 py-3 text-sm leading-relaxed text-[#526176]">
        <span className="font-semibold text-[#101C33]">Si la gêne persiste :</span> recontactez le professionnel qui vous accompagne pour faire le point.
      </p>

      <HomeLinkCard
        to="/patient/surveiller"
        icon={Eye}
        tone="orange"
        title="Voir les points à surveiller"
        intro="Repérez les signes qui doivent vous amener à recontacter un professionnel de santé."
        ariaLabel="Voir les points à surveiller"
      />

      </> : null}

      <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Kivoir permet de retrouver les informations transmises par un professionnel de santé. Ces informations ne
        remplacent pas une consultation ni les décisions prises avec un professionnel. En cas de doute, d’évolution
        défavorable ou de situation préoccupante, demandez un avis professionnel.
      </p>

      <SafetyNotice />
    </div>
  );
}
