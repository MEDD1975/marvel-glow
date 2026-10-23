import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  MessageCircleQuestion,
} from "lucide-react";
import type { ReactNode } from "react";
import { PatientShell } from "@/components/patient/PatientShell";
import { usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, SafetyNotice } from "@/components/patient/PatientUi";

type ParcoursSearch = { pathway?: string | undefined };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Que faire pour la suite ? — Kivoir" },
      {
        name: "description",
        content: "Découvrez quoi faire si la gêne persiste ou si vous avez un doute.",
      },
    ],
  }),
  component: ParcoursRoute,
});

function ParcoursRoute() {
  const search = Route.useSearch();
  return (
    <PatientShell search={search} requireFreshContext>
      <ParcoursPage />
    </PatientShell>
  );
}

type Tone = "blue" | "orange" | "red";

const infoBlocks: Array<{
  id: string;
  tone: Tone;
  icon: ReactNode;
  title: string;
  text: string;
  action?: string;
  to?: "/conseils" | "/annuaire" | "/patient/surveiller";
}> = [
  {
    id: "info-persistance",
    tone: "orange",
    icon: <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />,
    title: "Si la gêne persiste",
    text: "Recontactez le professionnel qui vous accompagne. Il vous indiquera la suite la plus adaptée à votre situation.",

  },
  {
    id: "info-signe",
    tone: "red",
    icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
    title: "Si un signe vous inquiète",
    text: "Consultez les points à surveiller et demandez rapidement un avis si nécessaire.",
    action: "Voir les points à surveiller",
    to: "/patient/surveiller",
  },
];

const tones: Record<Tone, string> = {
  blue: "border-[#DCE5F0] bg-white [--icon-bg:#F2F6FB] [--icon-fg:#0B63CE]",
  orange: "border-[#F0DBAE] bg-[#FFF9ED] [--icon-bg:#FFFFFF] [--icon-fg:#9A6100]",
  red: "border-[#F3C9C9] bg-white [--icon-bg:#FDECEC] [--icon-fg:#B4232A]",
};

const actionButton =
  "inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-[14px] border border-[#DCE5F0] bg-white px-4 text-sm font-semibold text-[#0B63CE] transition-colors hover:border-[#0B63CE] hover:bg-[#F7FAFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ParcoursPage() {
  const { ready, guide } = usePatient();

  if (!ready) return <LoadingState />;

  if (!guide) {
    return (
      <EmptyState
        title="Aucun parcours ouvert"
        description="Scannez le QR code transmis par votre professionnel de santé pour accéder aux informations correspondant à votre parcours."
        action={
          <Link
            to="/annuaire"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Rechercher un cabinet
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <Link
          to="/patient"
          className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à mon espace patient
        </Link>
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
          Que faire pour la suite ?
        </h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Les conseils essentiels sont déjà disponibles dans « À faire maintenant ». Cette page indique uniquement quoi faire si la situation ne s’améliore pas ou devient préoccupante.
        </p>
        <p className="mt-4 inline-flex rounded-xl bg-[#EAF2FC] px-3 py-2 text-sm font-semibold text-[#0B63CE]">
          Parcours : {guide.name}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {infoBlocks.map((block) => (
          <section
            key={block.id}
            aria-labelledby={block.id}
            className={`rounded-[22px] border p-5 shadow-[0_4px_14px_rgba(16,28,51,0.045)] ${tones[block.tone]}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--icon-bg)] text-[var(--icon-fg)]">
                {block.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={block.id} className="text-[1.08rem] font-bold leading-snug text-[#101C33]">
                  {block.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{block.text}</p>
              </div>
            </div>
            {block.action && block.to ? (
              <Link to={block.to} className={`${actionButton} mt-5 min-h-14 rounded-2xl px-5 text-[0.98rem]`}>
                {block.action}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </section>
        ))}
      </div>

      <SafetyNotice>
        Ces informations sont générales et ne remplacent pas l’avis d’un professionnel de santé.
      </SafetyNotice>
    </div>
  );
}

export default Route;
