import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, MessageCircleQuestion, Phone, ThumbsUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PatientShell } from "@/components/patient/PatientShell";
import { usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, SafetyNotice } from "@/components/patient/PatientUi";
import { adviceContactsFor } from "@/lib/advice-contacts";

type ParcoursSearch = { pathway?: string | undefined };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Comment évolue votre situation ? — Kivoir" },
      { name: "description", content: "Choisissez la situation qui vous correspond pour savoir quoi faire." },
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

type Situation = "improves" | "no-change" | "worse";

const choices: Array<{ id: Situation; label: string; idle: string; active: string }> = [
  { id: "improves", label: "Ça s’améliore", idle: "border-[#DCE5F0] bg-white text-foreground", active: "border-[#0B63CE] bg-[#F2F6FB] text-[#0B63CE]" },
  { id: "no-change", label: "Ça ne s’améliore pas", idle: "border-[#DCE5F0] bg-white text-foreground", active: "border-[#C98A1B] bg-[#FFF9ED] text-[#8A5600]" },
  { id: "worse", label: "Ça s’aggrave", idle: "border-[#DCE5F0] bg-white text-foreground", active: "border-[#D9534F] bg-[#FDF2F2] text-[#9F1F25]" },
];

const primaryButton = "inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-[14px] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const secondaryButton = `${primaryButton} border border-[#DCE5F0] bg-white text-[#0B63CE] hover:border-[#0B63CE] hover:bg-[#F7FAFE]`;

function ParcoursPage() {
  const { ready, guide } = usePatient();
  const [situation, setSituation] = useState<Situation | null>(null);

  if (!ready) return <LoadingState />;

  if (!guide) {
    return (
      <EmptyState
        title="Aucun parcours ouvert"
        description="Scannez le QR code remis par votre professionnel de santé pour retrouver votre parcours."
        action={<Link to="/annuaire" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent">Rechercher un cabinet</Link>}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <Link to="/patient" className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à mon espace patient
        </Link>
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">Comment évolue votre situation ?</h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">Choisissez la situation qui vous correspond pour savoir quoi faire.</p>
        <p className="mt-4 inline-flex rounded-xl bg-[#EAF2FC] px-3 py-2 text-sm font-semibold text-[#0B63CE]">Parcours : {guide.name}</p>
      </div>

      <fieldset>
        <legend className="sr-only">Votre situation</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {choices.map((choice) => {
            const selected = situation === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSituation(choice.id)}
                className={`min-h-14 flex-1 rounded-[14px] border-2 px-4 text-left text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? choice.active : choice.idle}`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">{situation ? <SituationResult situation={situation} /> : null}</div>

      <SafetyNotice>Votre choix n’est ni enregistré ni transmis. Ces repères ne remplacent pas l’avis de votre professionnel de santé.</SafetyNotice>
    </div>
  );
}

function ResultCard({ tone, icon, title, text, children }: { tone: "blue" | "orange" | "red"; icon: ReactNode; title: string; text: string; children: ReactNode }) {
  const tones = {
    blue: "border-[#DCE5F0] bg-white [--icon-bg:#F2F6FB] [--icon-fg:#0B63CE]",
    orange: "border-[#F0DBAE] bg-[#FFF9ED] [--icon-bg:#FFFFFF] [--icon-fg:#9A6100]",
    red: "border-[#F3C9C9] bg-white [--icon-bg:#FDECEC] [--icon-fg:#B4232A]",
  } as const;
  return (
    <section aria-labelledby="result-title" className={`rounded-[18px] border p-4 shadow-[0_1px_3px_rgba(16,28,51,0.04)] ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--icon-bg)] text-[var(--icon-fg)]">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 id="result-title" className="text-base font-semibold leading-snug text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function SituationResult({ situation }: { situation: Situation }) {
  if (situation === "improves") {
    return (
      <ResultCard tone="blue" icon={<ThumbsUp className="h-5 w-5" aria-hidden="true" />} title="Continuez progressivement" text="Poursuivez les recommandations de votre parcours et reprenez progressivement vos activités selon votre ressenti.">
        <Link to="/conseils" className={secondaryButton}>Voir mes recommandations<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
        <Link to="/patient/ressources" className={secondaryButton}>Voir mes ressources<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
      </ResultCard>
    );
  }
  if (situation === "no-change") return <AdviceResult />;
  return (
    <ResultCard tone="red" icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />} title="Vérifiez les points à surveiller" text="Consultez les points à surveiller de votre parcours et suivez la conduite indiquée si l’un de ces signes apparaît.">
      <Link to="/patient/surveiller" className={`${primaryButton} bg-[#B4232A] text-white hover:bg-[#9F1F25]`}>Voir les points à surveiller<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
    </ResultCard>
  );
}

function AdviceResult() {
  const { guide, cabinetPhone } = usePatient();
  const [open, setOpen] = useState(false);
  const contacts = adviceContactsFor(guide?.id);

  return (
    <ResultCard tone="orange" icon={<MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />} title="Il peut être utile de demander un avis" text="Si la gêne persiste ou si vous avez un doute, consultez les repères de votre parcours pour savoir vers quel professionnel vous tourner.">
      <button type="button" aria-expanded={open} aria-controls="avis-list" onClick={() => setOpen((value) => !value)} className={`${primaryButton} border border-[#F0DBAE] bg-white text-[#8A5600] hover:border-[#C98A1B]`}>
        Voir quand demander un avis
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open ? (
        <div id="avis-list" className="flex flex-col gap-2">
          <h3 className="mt-1 text-sm font-semibold text-foreground">Quand demander un avis ?</h3>
          <ul className="flex flex-col divide-y divide-[#F0DBAE] rounded-[14px] border border-[#F0DBAE] bg-white">
            {contacts.map((contact) => (
              <li key={contact.id} className="px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{contact.who}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{contact.when}</p>
              </li>
            ))}
          </ul>
          {cabinetPhone ? (
            <a href={`tel:${cabinetPhone}`} className={`${primaryButton} bg-[#0B63CE] text-white hover:bg-[#0A56B3]`}>
              <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden="true" />Contacter mon cabinet</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
          <Link to="/annuaire" className={secondaryButton}>Trouver un professionnel<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      ) : null}
    </ResultCard>
  );
}

export default Route;
