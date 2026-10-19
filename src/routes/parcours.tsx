import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  MessageCircleQuestion,
  ThumbsUp,
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
      { title: "Et si la gêne évolue ? — Kivoir" },
      {
        name: "description",
        content: "Retrouvez simplement quoi faire selon l’évolution que vous observez.",
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
  action: string;
  to: "/conseils" | "/annuaire" | "/patient/surveiller";
}> = [
  {
    id: "info-amelioration",
    tone: "blue",
    icon: <ThumbsUp className="h-5 w-5" aria-hidden="true" />,
    title: "Si ça s’améliore",
    text: "Continuez à suivre les conseils transmis par votre professionnel de santé.",
    action: "Voir mes conseils",
    to: "/conseils",
  },
  {
    id: "info-persistance",
    tone: "orange",
    icon: <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />,
    title: "Si la gêne persiste",
    text: "Un nouvel avis peut être utile pour faire le point et décider de la suite.",
    action: "Voir qui contacter",
    to: "/annuaire",
  },
  {
    id: "info-signe",
    tone: "red",
    icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
    title: "Si un signe vous inquiète",
    text: "Consultez les points à surveiller et demandez un avis lorsque cela est nécessaire.",
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
          Et si la gêne évolue ?
        </h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Retrouvez simplement quoi faire selon l’évolution que vous observez.
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
            className={`rounded-[18px] border p-4 shadow-[0_1px_3px_rgba(16,28,51,0.04)] ${tones[block.tone]}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--icon-bg)] text-[var(--icon-fg)]">
                {block.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={block.id} className="text-base font-semibold leading-snug text-foreground">
                  {block.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{block.text}</p>
              </div>
            </div>
            <Link to={block.to} className={`${actionButton} mt-4`}>
              {block.action}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
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
