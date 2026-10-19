import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Ban, CheckCircle2, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { PatientShell } from "@/components/patient/PatientShell";
import { usePatient } from "@/components/patient/PatientProvider";
import { BackToHome, CompactLinks, SourcesList } from "@/components/patient/PatientBlocks";
import { EmptyState, LoadingState, SafetyNotice, ValidationNote } from "@/components/patient/PatientUi";
import { conditionAdvice } from "@/lib/condition-advice";
import { generalLinks } from "@/lib/condition-resources";
import type { PathwayGuide, Recommendation } from "@/lib/patient-guides";

type ConseilsSearch = {
  c?: string | undefined;
  pathway?: string | undefined;
  doctor?: string | undefined;
  doctorName?: string | undefined;
  reco?: string | undefined;
};

const str = (value: unknown) => (typeof value === "string" ? value : undefined);

export const Route = createFileRoute("/conseils")({
  validateSearch: (search: Record<string, unknown>): ConseilsSearch => ({
    c: str(search["c"]),
    pathway: str(search["pathway"]),
    doctor: str(search["doctor"]),
    doctorName: str(search["doctorName"]),
    reco: str(search["reco"]),
  }),
  head: () => ({
    meta: [
      { title: "Mes recommandations — Kivoir" },
      {
        name: "description",
        content: "Les recommandations transmises pour votre parcours, en complément des consignes de votre professionnel.",
      },
      { property: "og:title", content: "Mes recommandations — Kivoir" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConseilsRoute,
});

function ConseilsRoute() {
  const search = Route.useSearch();
  return (
    <PatientShell search={search}>
      <ConseilsPage reco={search.reco} />
    </PatientShell>
  );
}

const sectionHeading = "text-xl font-semibold tracking-tight text-foreground";

function ConseilsPage({ reco }: { reco: string | undefined }) {
  const { ready, guide } = usePatient();
  const { hash } = useLocation();

  useEffect(() => {
    if (!ready) return;
    if (reco) {
      window.scrollTo({ top: 0 });
      return;
    }
    if (hash) document.getElementById(hash)?.scrollIntoView({ block: "start" });
  }, [ready, hash, reco]);

  if (!ready) return <LoadingState />;

  if (!guide) {
    return (
      <div className="flex flex-col gap-6">
        <BackToHome />
        <h1 className="text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground">Mes recommandations</h1>
        <EmptyState
          title="Aucun parcours ouvert"
          description="Scannez le QR code transmis par votre professionnel de santé pour accéder aux informations correspondant à votre parcours."
          action={
            <Link to="/annuaire" className="inline-flex min-h-11 items-center rounded-xl bg-tone-blue px-4 text-sm font-semibold text-care">
              Rechercher un cabinet
            </Link>
          }
        />
        <SourcesList links={generalLinks.filter((link) => link.kind === "site")} />
        <SafetyNotice />
      </div>
    );
  }

  const selected = reco ? guide.recommendations.find((item) => item.id === reco) : undefined;
  if (selected) return <RecommendationDetail item={selected} />;

  return (
    <div className="flex flex-col gap-12">
      <div>
        <BackToHome />
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">Mes recommandations</h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Retrouvez les conseils transmis pour cette étape de votre parcours.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-tone-blue px-2.5 py-0.5 text-[13px] font-medium text-care">{`Parcours : ${guide.name}`}</p>
      </div>

      <EssentialGestures guide={guide} />
      <CompactLinks
        title="Besoin d’un autre repère ?"
        links={[
          { to: "/patient/surveiller", label: "Voir les points à surveiller" },
          { to: "/patient/ressources", label: "Consulter mes ressources" },
        ]}
      />
      <SafetyNotice>Ces informations ne remplacent pas les consignes données lors de votre consultation.</SafetyNotice>
    </div>
  );
}

function EssentialGestures({ guide }: { guide: PathwayGuide }) {
  const avoid = conditionAdvice[guide.id]?.avoid ?? [];
  return (
    <section aria-labelledby="gestes-title" id="gestes" className="scroll-mt-20">
      <h2 id="gestes-title" className={sectionHeading}>Les gestes essentiels</h2>
      {guide.recommendations.length ? (
        <ul className="mt-4 divide-y divide-tone-green-border/20 overflow-hidden rounded-2xl border border-tone-green-border/25 bg-tone-green/50">
          {guide.recommendations.map((item) => (
            <li key={item.id}>
              <Link
                to="/conseils"
                search={(prev: ConseilsSearch) => ({ ...prev, reco: item.id })}
                className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-tone-green/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-tone-green-text">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{item.title}</span>
                  {item.summary ? <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted-foreground">{item.summary}</span> : null}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState title="Aucune recommandation pour ce parcours" description="Votre cabinet n'a pas encore ajouté de recommandation." />
        </div>
      )}
      {avoid.length ? (
        <details className="group mt-4 rounded-2xl border border-border bg-card">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-medium text-foreground">
            <span className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Les erreurs fréquentes à éviter
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {avoid.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-muted-foreground">{`• ${item}`}</li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        {guide.recommendations.some((item) => item.validatedAt)
          ? "Contenus validés par votre cabinet."
          : "Contenus de démonstration, en attente de validation médicale."}
      </p>
    </section>
  );
}

function RecommendationDetail({ item }: { item: Recommendation }) {
  const backLink = (
    <Link
      to="/conseils"
      search={(prev: ConseilsSearch) => ({ ...prev, reco: undefined })}
      hash="gestes"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Retour à mes recommandations
    </Link>
  );
  return (
    <article className="flex flex-col gap-6">
      <div>
        <div className="-ml-2 mb-2 px-2">{backLink}</div>
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground">{item.title}</h1>
      </div>

      <section aria-labelledby="objectif-title" className="rounded-2xl border border-tone-green-border/25 bg-tone-green/50 p-4">
        <h2 id="objectif-title" className="text-sm font-semibold text-tone-green-text">Objectif</h2>
        <p className="mt-1 text-base leading-relaxed text-foreground">{item.intro}</p>
      </section>

      {item.steps.length ? (
        <section aria-labelledby="etapes-title">
          <h2 id="etapes-title" className="mb-3 text-base font-semibold text-foreground">Comment faire</h2>
          <ol className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            {item.steps.map((step) => (
              <li key={step} className="flex items-start gap-3 text-base leading-relaxed text-foreground">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-tone-green-text" aria-hidden="true" />
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="transmis-title" className="rounded-2xl border border-care/15 bg-tone-blue/60 p-4">
        <h2 id="transmis-title" className="flex items-center gap-2 text-sm font-semibold text-care">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Conseil transmis
        </h2>
        {item.caution ? <p className="mt-1 text-sm leading-relaxed text-foreground">{item.caution}</p> : null}
        <div className="mt-2">
          <ValidationNote validatedAt={item.validatedAt} validatedBy={item.validatedBy} source={item.source} />
        </div>
      </section>

      <Link
        to="/conseils"
        search={(prev: ConseilsSearch) => ({ ...prev, reco: undefined })}
        hash="gestes"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent"
      >
        Retour à mes recommandations
      </Link>
    </article>
  );
}
