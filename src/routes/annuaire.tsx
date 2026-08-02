import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  Stethoscope,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { conditions } from "@/lib/conditions";
import {
  cityCenter,
  distanceKm,
  journeySteps,
  professionColor,
  professionOrder,
  providers,
  type Profession,
} from "@/lib/directory";

const ProviderMap = lazy(() => import("@/components/ProviderMap"));

type Search = { c?: string | undefined; step?: string | undefined };

export const Route = createFileRoute("/annuaire")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    c: typeof search["c"] === "string" ? search["c"] : undefined,
    step: typeof search["step"] === "string" ? search["step"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Prochaine étape et professionnels à Saint-Maur-des-Fossés — Kivoir" },
      {
        name: "description",
        content:
          "Dites où vous en êtes de votre parcours : Kivoir indique le professionnel à voir ensuite et les praticiens disponibles à Saint-Maur-des-Fossés, sur une carte.",
      },
      {
        property: "og:title",
        content: "Prochaine étape et professionnels à Saint-Maur-des-Fossés — Kivoir",
      },
      {
        property: "og:description",
        content:
          "Kiné, podologue, imagerie, rhumatologue, chirurgien : qui voir ensuite et où, près de chez vous à Saint-Maur-des-Fossés.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnuairePage,
});

function AnnuairePage() {
  const { c, step } = Route.useSearch();
  const navigate = useNavigate({ from: "/annuaire" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [professionFilter, setProfessionFilter] = useState<Profession | null>(null);

  const condition = conditions.find((item) => item.id === c) ?? null;
  const currentStep = journeySteps.find((item) => item.id === step) ?? null;

  const recommended = currentStep?.next ?? [];

  const list = useMemo(() => {
    const base = providers.filter((provider) => {
      if (professionFilter) return provider.profession === professionFilter;
      if (recommended.length > 0) return recommended.includes(provider.profession);
      return true;
    });
    return [...base].sort((a, b) => {
      const ra = recommended.indexOf(a.profession);
      const rb = recommended.indexOf(b.profession);
      if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
      return distanceKm(cityCenter, a) - distanceKm(cityCenter, b);
    });
  }, [professionFilter, recommended]);

  const setSearch = (next: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }), resetScroll: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-care/10 px-3 py-1 text-xs font-medium text-care">
        <MapPin className="h-3.5 w-3.5" /> Saint-Maur-des-Fossés (94)
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
        Où en êtes-vous ? On vous dit qui voir ensuite, et où.
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Indiquez l'étape de votre parcours : Kivoir affiche le professionnel suivant, puis les
        praticiens correspondants près de chez vous.
      </p>

      {/* Étape 1 — trouble */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          1. Votre trouble (optionnel)
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {conditions.map((item) => {
            const active = item.id === condition?.id;
            return (
              <button
                key={item.id}
                onClick={() => setSearch({ c: active ? undefined : item.id })}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-care bg-care text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-care/40 hover:text-foreground"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Étape 2 — parcours */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          2. Où en êtes-vous de votre parcours ?
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {journeySteps.map((item) => {
            const active = item.id === currentStep?.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setProfessionFilter(null);
                  setSearch({ step: active ? undefined : item.id });
                }}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-care bg-care/5 shadow-sm"
                    : "border-border bg-card hover:border-care/40 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">{item.label}</p>
                  {active && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.context}</p>
                <p className="mt-2 text-xs italic text-muted-foreground">{item.example}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Prochaine étape */}
      {currentStep && (
        <section className="mt-8 rounded-2xl border border-care/30 bg-care/5 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Navigation className="h-4 w-4 text-care" />
            Votre prochaine étape
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {currentStep.next.map((profession, index) => (
              <span key={profession} className="flex items-center gap-2">
                {index > 0 && <span className="text-xs text-muted-foreground">ou</span>}
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: professionColor[profession] }}
                >
                  {profession}
                </span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-foreground">{currentStep.advice}</p>
          {condition && (
            <p className="mt-2 text-sm text-muted-foreground">
              Pour {condition.name.toLowerCase()} : {condition.whoToSee}{" "}
              <Link
                to="/parcours"
                search={{ c: condition.id }}
                className="inline-flex items-center gap-1 font-medium text-care underline-offset-2 hover:underline"
              >
                Voir le parcours complet <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          )}
        </section>
      )}

      {/* Carte + liste */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            3. Professionnels à Saint-Maur-des-Fossés
          </h2>
          <span className="text-xs text-muted-foreground">{list.length} résultat(s)</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setProfessionFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              professionFilter === null
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {currentStep ? "Suggérés pour mon étape" : "Tous"}
          </button>
          {professionOrder.map((profession) => {
            const active = professionFilter === profession;
            return (
              <button
                key={profession}
                onClick={() => setProfessionFilter(active ? null : profession)}
                className="rounded-full border px-3 py-1 text-xs transition-colors"
                style={
                  active
                    ? { backgroundColor: professionColor[profession], color: "#fff", borderColor: professionColor[profession] }
                    : { borderColor: "var(--border)", color: professionColor[profession] }
                }
              >
                {profession}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <ClientOnly
              fallback={<div className="h-[320px] w-full animate-pulse bg-muted md:h-[460px]" />}
            >
              <Suspense
                fallback={<div className="h-[320px] w-full animate-pulse bg-muted md:h-[460px]" />}
              >
                <ProviderMap providers={list} activeId={activeId} onSelect={setActiveId} />
              </Suspense>
            </ClientOnly>
          </div>

          <ul className="space-y-3 lg:max-h-[460px] lg:overflow-y-auto lg:pr-1">
            {list.map((provider) => {
              const active = provider.id === activeId;
              const km = distanceKm(cityCenter, provider);
              return (
                <li key={provider.id}>
                  <button
                    onClick={() => setActiveId(provider.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active ? "border-care bg-care/5 shadow-sm" : "border-border bg-card hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: professionColor[provider.profession] }}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{provider.name}</p>
                        <p
                          className="text-xs font-medium"
                          style={{ color: professionColor[provider.profession] }}
                        >
                          {provider.profession}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {provider.address} · {provider.district} · {km.toFixed(1)} km du centre
                        </p>
                        {provider.note && (
                          <p className="mt-1 text-sm text-muted-foreground">{provider.note}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {provider.directAccess ? "Accès direct possible" : "Ordonnance conseillée"}
                          </span>
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="inline-flex items-center gap-1 rounded-full bg-urgent/10 px-2 py-0.5 text-xs font-medium text-urgent"
                            >
                              <Phone className="h-3 w-3" /> {provider.phone}
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${provider.name} ${provider.address} Saint-Maur-des-Fossés`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-care/10 px-2 py-0.5 text-xs font-medium text-care"
                          >
                            <Navigation className="h-3 w-3" /> Itinéraire
                          </a>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-care" />
          <span>
            Annuaire local en cours de constitution sur Saint-Maur-des-Fossés. Les structures
            affichées sont des repères de démonstration : vérifiez toujours les coordonnées et
            disponibilités avant de vous déplacer.
          </span>
        </p>
      </section>

      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}
