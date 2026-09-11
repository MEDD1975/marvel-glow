import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Ban, Dumbbell, ExternalLink, FileText, Info, Play, Thermometer } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { dailyTips } from "@/lib/care-data";
import { conditions } from "@/lib/conditions";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";
import { conditionResources, generalLinks } from "@/lib/condition-resources";
import { readStoredPathway, writeStoredPathway } from "@/lib/patient-pathway";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";

function matchCondition(value: string | undefined) {
  if (!value) return null;
  const normalized = decodeURIComponent(value).trim().toLowerCase();
  return (
    conditions.find(
      (item) => item.id === normalized || item.name.trim().toLowerCase() === normalized,
    ) ?? null
  );
}

type ConseilsSearch = { c?: string | undefined; pathway?: string | undefined };

export const Route = createFileRoute("/conseils")({
  validateSearch: (search: Record<string, unknown>): ConseilsSearch => ({
    c: typeof search["c"] === "string" ? search["c"] : undefined,
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Bibliothèque de conseils — Kivoir" },
      {
        name: "description",
        content:
          "Vidéos, exercices, bons réflexes et signes d’alerte adaptés à votre trouble, en complément des consignes de votre professionnel.",
      },
      { property: "og:title", content: "Conseils et vidéos — Kivoir" },
      {
        property: "og:description",
        content:
          "Vidéos, exercices, bons réflexes et signes d’alerte adaptés à votre trouble, en complément des consignes de votre professionnel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConseilsPage,
});

function ConseilsPage() {
  const { c, pathway } = Route.useSearch();
  const navigate = useNavigate({ from: "/conseils" });
  const urlValue = c ?? pathway;
  const [activeId, setActiveId] = useState<string | undefined>(() => matchCondition(urlValue)?.id);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (urlValue !== undefined) {
      const matchedId = matchCondition(urlValue)?.id;
      setActiveId(matchedId);
      writeStoredPathway(matchedId);
      setHydrated(true);
    } else if (!hydrated) {
      setActiveId(readStoredPathway() ?? undefined);
      setHydrated(true);
    }
  }, [urlValue, hydrated]);
  const selected = activeId ? conditions.find((item) => item.id === activeId) ?? null : null;
  const conditionId = activeId;
  const [doctorResources, setDoctorResources] = useState<DoctorResourceRecord[]>([]);
  useEffect(() => {
    if (!selected) {
      setDoctorResources([]);
      return;
    }
    void fetch(`/api/doctor-resources?conditionId=${encodeURIComponent(selected.id)}`).then(async (response) => {
      if (!response.ok) return [] as DoctorResourceRecord[];
      return response.json() as Promise<DoctorResourceRecord[]>;
    }).then(setDoctorResources);
  }, [selected?.id]);
  const visibleConditions = selected ? [selected] : [];
  const advice = selected ? conditionAdvice[selected.id] : undefined;
  const resources = selected ? conditionResources[selected.id] : undefined;
  const exercises = resources?.exercises ?? [];
  const links = selected ? (resources?.links ?? []) : generalLinks;
  const videoLinks = links.filter((l) => l.kind === "video");
  const siteLinks = links.filter((l) => l.kind !== "video");


  const tips = advice?.tips ?? dailyTips;
  const avoid = advice?.avoid ?? [];
  const redFlags = advice ? [...advice.redFlags, ...generalRedFlags] : generalRedFlags;
  const select = (id: string | undefined) => {
    setActiveId(id);
    writeStoredPathway(id);
    setHydrated(true);
    navigate({ search: { c: id }, resetScroll: false });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Link
          to="/"
          search={{ started: true, pathway: conditionId }}
          aria-label="Retourner à l’espace patient"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à mon espace patient
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">Bibliothèque de conseils</h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
          Consultez ces repères pour préparer votre prochain échange. Ils ne remplacent pas les consignes de votre professionnel.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {!selected && (
          <button
            onClick={() => select(undefined)}
            className="rounded-full border border-care bg-care px-3 py-1.5 text-sm text-primary-foreground"
          >
            Conseils généraux
          </button>
        )}
        {visibleConditions.map((item) => (
          <button
            key={item.id}
            onClick={() => select(item.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              selected?.id === item.id
                ? "border-care bg-care text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-accent"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {doctorResources.length > 0 && (
        <section className="mt-8 rounded-2xl border border-care/30 bg-care/5 p-5" aria-labelledby="doctor-library-title">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground"><FileText className="h-5 w-5 text-care" /><h2 id="doctor-library-title">Bibliothèque de conseils de votre médecin</h2></div>
          <p className="mt-1 text-sm text-muted-foreground">Les vidéos, photos et documents partagés par votre médecin sont regroupés ici pour ce parcours.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {doctorResources.map((resource) => {
              const isImage = resource.contentType?.startsWith("image/");
              const isVideo = resource.contentType?.startsWith("video/");
              return <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent">
                {isImage ? <img src={resource.url} alt={`Aperçu de ${resource.title}`} className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-care/10 text-care">{isVideo ? <Play className="h-5 w-5" aria-hidden="true" /> : <FileText className="h-5 w-5" aria-hidden="true" />}</span>}
                <span><span className="block font-medium text-card-foreground">{resource.title}</span><span className="mt-1 block text-xs text-muted-foreground">{isVideo ? "Vidéo" : isImage ? "Photo" : "Document"} · {resource.filename ?? resource.source ?? "Fichier partagé"}</span></span><ExternalLink className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
              </a>;
            })}
          </div>
        </section>
      )}

      {selected && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-card-foreground">{selected.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selected.summary}</p>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-care/30 bg-care/5 p-5">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Play className="h-5 w-5 text-care" />
          Vidéos et exercices {selected ? `— ${selected.name}` : ""}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Vidéos d'explication et d'exercices, sélectionnées auprès de kinésithérapeutes et de sources
          médicales. Elles s'ouvrent sur YouTube dans un nouvel onglet.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {videoLinks.map((link, i) => (
            <article key={i} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              {link.videoId && (
                <iframe
                  className="aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${link.videoId}?rel=0&hl=fr`}
                  title={link.label}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-card-foreground">{link.label}</h3>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-care hover:underline"
                >
                  Voir d'autres vidéos sur YouTube <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
        {!selected && (
          <p className="mt-4 text-xs text-muted-foreground">
            Sélectionnez maintenant votre trouble dans la liste ci-dessus pour afficher sa vidéo adaptée.
          </p>
        )}
      </section>


      <section className="mt-10">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Thermometer className="h-5 w-5 text-care" />
          {selected ? `Les bons réflexes — ${selected.name}` : "Les bons réflexes du quotidien"}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold text-card-foreground">{tip.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tip.content}</p>
            </div>
          ))}
        </div>
      </section>

      {exercises.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Dumbbell className="h-5 w-5 text-care" />
            Exercices qui soulagent — {selected?.name}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            À faire chez soi, sans matériel ou presque. Arrêtez si la douleur dépasse 4/10 ou persiste plus de 24 h après.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-card-foreground">{ex.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{ex.how}</p>
                <p className="mt-3 inline-flex rounded-full bg-care/10 px-3 py-1 text-xs font-medium text-care">{ex.dosage}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <ExternalLink className="h-5 w-5 text-care" />
          Sources d'information fiables
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {siteLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-care/10 text-care">
                <ExternalLink className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-card-foreground">{link.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{link.source}</span>
              </span>
            </a>
          ))}
        </div>
      </section>


      {avoid.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Ban className="h-5 w-5 text-urgent" />
            Les erreurs fréquentes à éviter
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {avoid.map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-sm">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <AlertTriangle className="h-5 w-5 text-urgent" />
          Signes d'alerte : consultez rapidement
        </div>
        <div className="mt-4 rounded-2xl border border-urgent/20 bg-urgent/5 p-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      </section>


      <section className="mt-12 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-care" />
          <div>
            <h3 className="font-semibold text-card-foreground">Pour les professionnels de santé</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ce parcours est conçu comme un support pédagogique pour les patients. Il peut être complété ou
              adapté selon les protocoles de votre établissement ou de votre spécialité.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}
