import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
} from "lucide-react";
import { PatientShell } from "@/components/patient/PatientShell";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, SafetyNotice, ValidationNote } from "@/components/patient/PatientUi";
import { conditionAdvice } from "@/lib/condition-advice";
import { generalLinks, type ResourceLink } from "@/lib/condition-resources";
import { emergencyNumbers, type PathwayGuide, type Recommendation } from "@/lib/patient-guides";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import { formatPhone, phoneHref } from "@/lib/typography";

type ConseilsSearch = {
  c?: string | undefined;
  pathway?: string | undefined;
  doctor?: string | undefined;
  doctorName?: string | undefined;
  note?: string | undefined;
  reco?: string | undefined;
};

const str = (value: unknown) => (typeof value === "string" ? value : undefined);

export const Route = createFileRoute("/conseils")({
  validateSearch: (search: Record<string, unknown>): ConseilsSearch => ({
    c: str(search["c"]),
    pathway: str(search["pathway"]),
    doctor: str(search["doctor"]),
    doctorName: str(search["doctorName"]),
    note: str(search["note"]),
    reco: str(search["reco"]),
  }),
  head: () => ({
    meta: [
      { title: "Mes recommandations — Kivoir" },
      {
        name: "description",
        content: "Les recommandations, les points à surveiller et les ressources transmis pour votre parcours, en complément des consignes de votre professionnel.",
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
  const { ready, guide, context } = usePatient();
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
          description="Scannez le QR code remis par votre professionnel de santé pour afficher les recommandations de votre parcours."
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
        {context.note ? (
          <p className="mt-4 rounded-xl bg-tone-blue px-4 py-3 text-sm text-foreground">
            <span className="font-semibold">Consigne de votre médecin : </span>
            {context.note}
          </p>
        ) : null}
      </div>

      <EssentialGestures guide={guide} />
      <WarningSection guide={guide} />
      <ResourcesSection guide={guide} />
      <SafetyNotice>Ces informations ne remplacent pas les consignes données lors de votre consultation.</SafetyNotice>
    </div>
  );
}

function BackToHome() {
  return (
    <Link
      to="/patient"
      className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Retour à mon espace patient
    </Link>
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

function WarningSection({ guide }: { guide: PathwayGuide }) {
  const { cabinetName, cabinetPhone, context } = usePatient();
  const [open, setOpen] = useState(false);
  const cabinetHref = phoneHref(cabinetPhone);
  return (
    <section aria-labelledby="surveiller-title" id="surveiller" className="scroll-mt-20">
      <h2 id="surveiller-title" className={sectionHeading}>Ce que je dois surveiller</h2>
      <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
        Demandez rapidement un avis professionnel si vous observez l&apos;un de ces signes ou si votre évolution vous inquiète.
      </p>
      <ul className="mt-4 flex flex-col gap-2" aria-label="Signes à surveiller">
        {guide.warnings.map((warning) => (
          <li key={warning.id} className="flex items-start gap-3 rounded-xl border border-tone-orange-border/40 bg-tone-orange/70 px-4 py-3 text-base leading-snug text-foreground">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tone-orange-text" aria-hidden="true" />
            {warning.label}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="avis-options"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Demander un avis
      </button>

      {open ? (
        <div id="avis-options" className="mt-3 flex flex-col gap-3">
          {cabinetHref ? (
            <a href={cabinetHref} className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-4 hover:bg-accent">
              <Phone className="h-5 w-5 shrink-0 text-care" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-foreground">{`Contacter ${cabinetName ?? "mon cabinet"}`}</span>
                <span className="block text-sm text-muted-foreground">{formatPhone(cabinetPhone)}</span>
              </span>
            </a>
          ) : (
            <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Aucun numéro de cabinet n&apos;a été transmis avec ce parcours. Contactez le professionnel de santé qui vous suit.
            </p>
          )}
          {context.note ? (
            <p className="rounded-xl bg-tone-blue px-4 py-3 text-sm text-foreground">
              <span className="font-semibold">Instructions de votre médecin : </span>
              {context.note}
            </p>
          ) : null}
          <div className="rounded-2xl border border-tone-red-border/40 bg-tone-red p-4 text-tone-red-text">
            <p className="font-semibold">En cas d&apos;urgence vitale</p>
            <p className="mt-1 text-sm">Appelez immédiatement les secours.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {emergencyNumbers.map((item) => (
                <a key={item.id} href={`tel:${item.number}`} className="flex min-h-14 flex-col items-center justify-center rounded-xl bg-card text-foreground">
                  <span className="text-xl font-bold">{item.number}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ResourcesSection({ guide }: { guide: PathwayGuide }) {
  const doctorResources = useDoctorResources();
  const items = doctorResources.data ?? [];
  return (
    <section aria-labelledby="ressources-title" id="ressources" className="scroll-mt-20">
      <h2 id="ressources-title" className={sectionHeading}>Mes ressources</h2>
      <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
        Retrouvez les contenus sélectionnés pour votre parcours et des sources complémentaires.
      </p>

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contenus choisis par votre médecin</h3>
      {doctorResources.isLoading ? (
        <LoadingState />
      ) : items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((resource) => (
            <li key={resource.id}>
              <DoctorResourceRow resource={resource} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Votre médecin n&apos;a pas encore partagé de contenu pour ce parcours.</p>
      )}

      <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vidéos et exercices</h3>
      {guide.videos.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {guide.videos.map((video) => (
            <li key={video.url}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      ) : null}
      {guide.exercises.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {guide.exercises.map((exercise) => (
            <li key={exercise.id}>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tone-blue text-care">
                    <Dumbbell className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{exercise.title}</span>
                    <span className="block text-xs text-muted-foreground">Exercice · Uniquement s&apos;il vous a été recommandé</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-4 pb-4">
                  <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-foreground">
                    {exercise.instructions.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  {exercise.frequency ? <p className="mt-2 text-sm text-muted-foreground">{exercise.frequency}</p> : null}
                  <div className="mt-3">
                    <ValidationNote validatedAt={exercise.validatedAt} validatedBy={exercise.validatedBy} source={exercise.source} />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : null}
      {!guide.videos.length && !guide.exercises.length ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Aucune vidéo ni exercice pour ce parcours.</p>
      ) : null}

      <SourcesList links={guide.sources} />
    </section>
  );
}

function resourceFormat(resource: DoctorResourceRecord) {
  const type = resource.contentType ?? "";
  if (type.startsWith("video/")) return { label: "Vidéo", icon: Play };
  if (type.startsWith("image/")) return { label: "Image", icon: ImageIcon };
  if (type === "application/pdf" || resource.filename?.toLowerCase().endsWith(".pdf")) return { label: "PDF", icon: FileText };
  if (!type && resource.url) return { label: "Lien", icon: ExternalLink };
  return { label: "Document", icon: FileText };
}

function DoctorResourceRow({ resource }: { resource: DoctorResourceRecord }) {
  const format = resourceFormat(resource);
  const Icon = format.icon;
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tone-blue text-care">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{resource.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[format.label, "Partagé par votre médecin", resource.source].filter(Boolean).join(" · ")}
        </span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
    </a>
  );
}

function VideoCard({ video }: { video: ResourceLink }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {video.videoId ? (
        playing ? (
          <iframe
            className="aspect-video w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&hl=fr&autoplay=1`}
            title={video.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block aspect-video w-full overflow-hidden bg-muted"
            aria-label={`Lire la vidéo : ${video.label}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card/95 text-care shadow-sm transition-transform group-hover:scale-105">
                <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
              </span>
            </span>
          </button>
        )
      ) : null}
      <div className="p-4">
        <h4 className="text-sm font-semibold leading-snug text-foreground">{video.label}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{["Vidéo", video.source].filter(Boolean).join(" · ")}</p>
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-care hover:underline">
          Ouvrir sur YouTube <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function SourcesList({ links }: { links: ResourceLink[] }) {
  if (!links.length) return null;
  return (
    <>
      <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sources fiables complémentaires</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{link.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{link.source}</span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
