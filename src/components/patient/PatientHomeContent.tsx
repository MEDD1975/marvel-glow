import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, ChevronRight, GraduationCap, ShieldCheck, Signpost, type LucideIcon } from "lucide-react";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { countLearningContent, formatLearningSummary, totalLearningContent } from "@/lib/learning-content";
import { LoadingState, SafetyNotice } from "@/components/patient/PatientUi";

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

function HomeSection({
  id,
  icon: Icon,
  tone,
  title,
  intro,
  children,
}: {
  id: string;
  icon: LucideIcon;
  tone: keyof typeof sectionTones;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  const classes = sectionTones[tone];
  return (
    <section aria-labelledby={id} className={`rounded-[18px] border bg-white p-4 shadow-[0_1px_3px_rgba(16,28,51,0.04)] ${classes.border}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={id} className="text-base font-semibold leading-snug text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{intro}</p>
        </div>
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

function HomeLinkCard({ to, icon: Icon, tone, title, intro }: { to: string; icon: LucideIcon; tone: keyof typeof sectionTones; title: string; intro: string }) {
  const classes = sectionTones[tone];
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-[18px] border p-4 shadow-[0_1px_3px_rgba(16,28,51,0.04)] transition-colors hover:border-[#0B63CE] hover:bg-[#F2F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${linkCardSurfaces[tone] ?? "bg-white"} ${classes.border}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}>
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

const buttonClasses =
  "inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-[14px] border border-[#DCE5F0] bg-white px-4 text-sm font-semibold text-[#0B63CE] shadow-[0_1px_3px_rgba(16,28,51,0.04)] transition-colors hover:border-[#0B63CE] hover:bg-[#F2F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-auto";

function SectionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={buttonClasses}>
      {children}
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function PatientHomeContent() {
  const { ready, guide, hasContext, cabinetName } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;

  const learningCounts = countLearningContent(guide, resources.data ?? []);
  const learningTotal = totalLearningContent(learningCounts);
  const learningTitle = guide ? `Mieux comprendre votre ${lowercaseFirst(guide.name)}` : "Mieux comprendre votre atteinte";

  const recommendationCount = guide?.recommendations.length ?? 0;
  const warnings = guide?.warnings ?? [];
  const visibleWarnings = warnings.slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="home-title" className="mb-2">
        <h1 id="home-title" className="text-balance text-[clamp(1.875rem,8.5vw,2.125rem)] font-bold leading-[1.15] tracking-tight text-[#101C33] md:text-4xl">
          Gardez les conseils de votre médecin à portée de main
        </h1>
        <p className="mt-3 max-w-prose text-pretty text-base leading-relaxed text-[#526176] md:text-lg">
          Retrouvez quoi faire maintenant, les points à surveiller et quand demander un nouvel avis.
        </p>
      </section>

      {hasContext && guide ? (
        <section
          aria-labelledby="diagnostic-title"
          className="rounded-2xl border border-[#D6E4F5] border-l-4 border-l-[#0B63CE] bg-[#F1F6FD] px-5 py-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0B63CE] md:text-[13px]">
            Parcours transmis par votre médecin
          </p>
          <h2 id="diagnostic-title" className="mt-1.5 text-pretty break-words text-2xl font-bold leading-tight text-[#101C33] md:text-[1.75rem]">
            {guide.name}
          </h2>
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
        title="À faire maintenant"
        intro={recommendationCount ? `${recommendationCount} conseils à appliquer après la consultation` : "Les conseils à appliquer après la consultation"}
      />

      {learningTotal > 0 ? (
        <HomeLinkCard to="/patient/ressources" icon={GraduationCap} tone="learn" title={learningTitle} intro={formatLearningSummary(learningCounts)} />
      ) : (
        <div className="flex items-center gap-3 rounded-[18px] border border-[#E4EAF2] bg-[#FAFBFD] p-4" aria-live="polite">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#6B7A90]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold leading-snug text-foreground">{learningTitle}</span>
            <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
              {resources.isLoading ? "Recherche des contenus disponibles…" : "Aucun contenu complémentaire n’est disponible pour le moment."}
            </span>
          </span>
        </div>
      )}

      <HomeLinkCard to="/parcours" icon={Signpost} tone="blue" title="Comment évolue votre situation ?" intro="Choisissez votre situation pour savoir quoi faire." />

      <HomeSection id="surveiller-title" icon={AlertTriangle} tone="neutral" title="Points à surveiller" intro="Ces signes nécessitent une réaction plus rapide : contactez sans attendre un professionnel de santé.">
        {visibleWarnings.length ? (
          <ul className="mb-3 flex flex-col gap-2">
            {visibleWarnings.map((warning) => (
              <li key={warning.id} className="flex gap-2.5 text-sm leading-snug text-foreground">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E5484D]" aria-hidden="true" />
                {warning.label}
              </li>
            ))}
          </ul>
        ) : null}
        <SectionLink to="/patient/surveiller">{warnings.length > visibleWarnings.length ? "Voir tous les signes à surveiller" : "Voir les signes à surveiller"}</SectionLink>
      </HomeSection>

      <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Kivoir affiche un parcours d’information sélectionné par votre professionnel de santé. Aucun compte patient n’est nécessaire. Ne saisissez aucune information personnelle ou médicale.
      </p>

      <SafetyNotice />
    </div>
  );
}
