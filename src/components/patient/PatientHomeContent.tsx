import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FolderOpen, MessageCircleQuestion, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { ActionCard, LoadingState, SafetyNotice } from "@/components/patient/PatientUi";
import { conditions } from "@/lib/conditions";

type AdviceContact = { id: string; who: string; when: string };

function adviceContactsFor(pathwayId: string | undefined): AdviceContact[] {
  const whoToSee = conditions.find((item) => item.id === pathwayId)?.whoToSee.toLowerCase() ?? "";
  const careProviders = [
    whoToSee.includes("kinésithérapeute") ? "kinésithérapeute" : null,
    whoToSee.includes("podologue") ? "podologue" : null,
  ].filter((item): item is string => Boolean(item));

  const careLabel = careProviders.length
    ? careProviders.map((item, index) => (index === 0 ? item.charAt(0).toUpperCase() + item.slice(1) : item)).join(" ou ")
    : "Professionnel indiqué";

  return [
    { id: "medecin", who: "Votre médecin", when: "Vous avez un doute ou votre état ne s’améliore pas comme prévu : contactez votre médecin." },
    { id: "soin", who: careLabel, when: "Une prise en charge vous a été prescrite ou conseillée : prenez rendez-vous avec le professionnel indiqué." },
    {
      id: "pharmacien",
      who: "Votre pharmacien",
      when: "Vous avez besoin d’aide pour comprendre ou utiliser un traitement déjà conseillé ou prescrit : demandez conseil à votre pharmacien.",
    },
  ];
}

const sectionTones = {
  green: { icon: "bg-[#F1F8F5] text-[#17855B]", border: "border-[#DCE5F0]" },
  blue: { icon: "bg-[#F2F6FB] text-[#0B63CE]", border: "border-[#DCE5F0]" },
  orange: { icon: "bg-white text-[#9A6100]", border: "border-[#F0DBAE] bg-[#FFF9ED]" },
  neutral: { icon: "bg-[#FDECEC] text-[#B4232A]", border: "border-[#DCE5F0]" },
} as const;

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
      className={`flex items-center gap-3 rounded-[18px] border bg-white p-4 shadow-[0_1px_3px_rgba(16,28,51,0.04)] transition-colors hover:border-[#0B63CE] hover:bg-[#F7FAFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${classes.border}`}
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
  const { ready, guide, hasContext, senderLabel } = usePatient();
  if (!ready) return <LoadingState />;

  const recommendationCount = guide?.recommendations.length ?? 0;
  const warnings = guide?.warnings ?? [];
  const visibleWarnings = warnings.slice(0, 4);
  const contacts = adviceContactsFor(guide?.id);

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="home-title" className="mb-2">
        <h1 id="home-title" className="text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
          Vos repères après la consultation
        </h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Je fais, j’observe, je demande un avis si nécessaire, je réagis en cas d’alerte.
        </p>
      </section>

      {hasContext ? (
        <section aria-labelledby="diagnostic-title" className="rounded-[14px] border border-[#DCE5F0] border-l-4 border-l-[#0B63CE] bg-white px-4 py-3">
          <h2 id="diagnostic-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Votre diagnostic
          </h2>
          {guide ? <p className="mt-1 text-base font-semibold text-[#101C33]">{guide.name}</p> : null}
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-[#526176]">
            <ShieldCheck className="h-4 w-4 text-[#0B63CE]" aria-hidden="true" />
            {senderLabel}
          </p>
        </section>
      ) : null}

      <HomeLinkCard
        to="/conseils"
        icon={CheckCircle2}
        tone="green"
        title="À faire maintenant"
        intro={recommendationCount ? `${recommendationCount} conseils à appliquer après la consultation` : "Les conseils à appliquer après la consultation"}
      />

      <HomeLinkCard to="/parcours" icon={TrendingUp} tone="blue" title="Suivre votre évolution" intro="Les repères pour adapter vos activités" />

      <HomeSection
        id="avis-title"
        icon={MessageCircleQuestion}
        tone="orange"
        title="Quand demander un avis ?"
        intro="En cas de doute, si l’évolution est plus lente que prévu ou si vous avez besoin d’aide. Vous n’avez pas à consulter tous ces professionnels."
      >
        <details className="group">
          <summary className={`${buttonClasses} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            Voir quand demander un avis
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="mt-3 flex flex-col divide-y divide-[#F0DBAE] rounded-[14px] border border-[#F0DBAE] bg-white">
            {contacts.map((contact) => (
              <li key={contact.id} className="px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{contact.who}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{contact.when}</p>
              </li>
            ))}
          </ul>
          <Link to="/annuaire" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[#0B63CE] hover:underline">
            Trouver un professionnel
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </details>
      </HomeSection>

      <HomeSection id="surveiller-title" icon={AlertTriangle} tone="neutral" title="À surveiller" intro="Ces signes nécessitent une réaction plus rapide : contactez sans attendre un professionnel de santé.">
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

      <section aria-labelledby="secondary-title" className="mt-2">
        <h2 id="secondary-title" className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pour aller plus loin
        </h2>
        <ActionCard to="/patient/ressources" icon={FolderOpen} tone="blue" title="Mes ressources" description="Conseils, documents et vidéos sélectionnés pour votre parcours" />
      </section>

      <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Kivoir affiche un parcours d’information sélectionné par votre professionnel de santé. Aucun compte patient n’est nécessaire. Ne saisissez aucune information personnelle ou médicale.
      </p>

      <SafetyNotice />
    </div>
  );
}
