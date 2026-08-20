import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  Search,
  Stethoscope,
} from "lucide-react";
import { DirectoryShareTools } from "@/components/DirectoryShareTools";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { conditions } from "@/lib/conditions";
import { pathways } from "@/lib/pathways";
import {
  cabinets,
  findCabinetsByPractitionerName,
  journeySteps,
  professionColor,
  professionOrder,
  isProfession,
  type Profession,
} from "@/lib/directory";

type Search = {
  cabinet?: string | undefined;
  c?: string | undefined;
  step?: string | undefined;
  profession?: Profession | undefined;
};

export const Route = createFileRoute("/annuaire")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cabinet: typeof search["cabinet"] === "string" ? search["cabinet"] : undefined,
    c: typeof search["c"] === "string" ? search["c"] : undefined,
    step: typeof search["step"] === "string" ? search["step"] : undefined,
    profession:
      typeof search["profession"] === "string" && isProfession(search["profession"])
        ? search["profession"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Prochaine étape et professionnels à Saint-Maur-des-Fossés — Kivoir" },
      {
        name: "description",
        content:
          "Dites où vous en êtes de votre parcours : Kivoir indique le professionnel à voir ensuite et affiche les praticiens disponibles à Saint-Maur-des-Fossés.",
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

function CabinetChooser({ invalidId, profession }: { invalidId?: string; profession?: Profession }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const matches = useMemo(() => (trimmed.length >= 2 ? findCabinetsByPractitionerName(trimmed) : []), [trimmed]);
  const doctorSuggestions = useMemo(
    () =>
      cabinets
        .flatMap((cabinet) => cabinet.providers)
        .filter((provider) => provider.profession === "Médecin généraliste" || provider.profession === "Médecin du sport")
        .map((provider) => provider.name)
        .filter((name, index, names) => names.indexOf(name) === index),
    [],
  );
  const hasSearched = trimmed.length >= 2;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <span className="inline-flex rounded-full bg-care/10 px-3 py-1 text-xs font-semibold text-care">
          Annuaire Kivoir
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-balance text-foreground md:text-3xl">
          {invalidId ? "Ce cabinet n’est pas disponible" : "Retrouvez le réseau de votre médecin"}
        </h1>
        <p className="mt-2 max-w-xl leading-6 text-muted-foreground">
          {invalidId
            ? `L’identifiant « ${invalidId} » ne correspond à aucun cabinet. Saisissez le nom de votre médecin pour retrouver son réseau de soins.`
            : "Entrez le nom de votre médecin pour afficher le réseau de soins de son cabinet et les professionnels recommandés."}
        </p>

        <div className="mt-6">
          <label htmlFor="doctor-search" className="text-sm font-medium text-foreground">
            Nom de votre médecin
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-care/60">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="doctor-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex. Dr A ou Dr B"
              list="doctor-name-suggestions"
              autoComplete="off"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <datalist id="doctor-name-suggestions">
              {doctorSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Commencez à taper « Dr A » ou « Dr B » pour voir les médecins disponibles.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {hasSearched && matches.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              Aucun médecin ne correspond à « {trimmed} » dans nos réseaux. Vérifiez l’orthographe ou essayez seulement le nom de famille.
            </p>
          ) : null}
          {matches.map((cabinet) => {
            const match = cabinet.providers.find((provider) =>
              provider.profession === "Médecin généraliste" || provider.profession === "Médecin du sport",
            ) ?? cabinet.providers[0];
            return (
              <Link
                key={cabinet.id}
                to="/annuaire"
                search={{ cabinet: cabinet.id, profession }}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-care/50"
              >
                <div>
                  <p className="font-semibold text-foreground">{cabinet.name}</p>
                  {match ? <p className="mt-1 text-sm text-care">{match.name}</p> : null}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cabinet.providers.length} professionnel{cabinet.providers.length > 1 ? "s" : ""} dans ce réseau
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-care" />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function AnnuairePage() {
  const { cabinet: cabinetId, c, step, profession } = Route.useSearch();
  const navigate = useNavigate({ from: "/annuaire" });
  const [professionFilter, setProfessionFilter] = useState<Profession | null>(profession ?? null);

  const selectedCabinet = cabinets.find((cabinet) => cabinet.id === cabinetId) ?? null;
  const cabinetProviders = selectedCabinet?.providers ?? [];
  const condition = conditions.find((item) => item.id === c) ?? null;
  const currentStep = journeySteps.find((item) => item.id === step) ?? null;

  const pathway = condition ? pathways[condition.id] : undefined;
  const conditionProfessionals = pathway
    ? pathway.actors
        .filter((actor) => actor.line <= 2)
        .map((actor) => {
          if (actor.role.includes("Urgences")) return "Urgences" as Profession;
          return professionOrder.find((profession) => actor.role.includes(profession));
        })
        .filter((profession): profession is Profession => Boolean(profession))
        .filter((profession, index, all) => all.indexOf(profession) === index)
    : [];
  // L’étape déclarée par le patient est prioritaire : elle décrit l’action immédiate.
  // Le trouble complète ensuite le contexte et les étapes suivantes du parcours.
  const recommended = currentStep?.next ?? conditionProfessionals;
  const nextAdvice = currentStep
    ? currentStep.advice
    : condition
      ? `${condition.name} : ${condition.firstStep} Professionnel à consulter : ${condition.whoToSee}`
      : undefined;

  const availableProfessions = professionOrder.filter((profession) =>
    cabinetProviders.some((provider) => provider.profession === profession),
  );

  const list = useMemo(() => {
    const base = cabinetProviders.filter((provider) => {
      if (professionFilter) return provider.profession === professionFilter;
      if (recommended.length > 0) return recommended.includes(provider.profession);
      return true;
    });
    return [...base].sort((a, b) => {
      const ra = recommended.indexOf(a.profession);
      const rb = recommended.indexOf(b.profession);
      if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
      return a.name.localeCompare(b.name, "fr");
    });
  }, [cabinetProviders, professionFilter, recommended]);

  const setSearch = (next: Partial<Search>) =>
    navigate({ search: (prev: Search) => ({ ...prev, ...next }), resetScroll: false });

  if (!selectedCabinet) {
    return <CabinetChooser {...(cabinetId ? { invalidId: cabinetId } : {})} {...(profession ? { profession } : {})} />;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-care/10 px-3 py-1 text-xs font-medium text-care">
          <MapPin className="h-3.5 w-3.5" /> Saint-Maur-des-Fossés (94)
        </p>
        <Link
          to="/annuaire"
          search={{}}
          className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Changer de cabinet
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-semibold text-balance text-foreground md:text-3xl">
        {selectedCabinet.name}
      </h1>
      <p className="mt-1 text-sm font-medium text-care">
        {selectedCabinet.providers.length} professionnel{selectedCabinet.providers.length > 1 ? "s" : ""} dans ce cabinet
      </p>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Indiquez l'étape de votre parcours : Kivoir affiche le professionnel suivant, puis les
        praticiens correspondants près de chez vous.
      </p>

      <DirectoryShareTools cabinet={selectedCabinet} />

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
              </button>
            );
          })}
        </div>
      </section>

      {/* Prochaine étape */}
      {currentStep && (
        <section className="mt-8 rounded-2xl border border-care/30 bg-care/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-care">Maintenant</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold text-foreground">
            <Navigation className="h-5 w-5 text-care" />
            Votre prochaine étape
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {recommended.map((profession, index) => (
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
          {nextAdvice && <p className="mt-3 max-w-2xl text-base leading-7 text-foreground">{nextAdvice}</p>}
          {condition && (
            <p className="mt-2 text-sm text-muted-foreground">
              Pour {condition.name.toLowerCase()} : {condition.whoToSee}{" "}
              <Link
                to="/parcours"
                search={{ pathway: condition.id }}
                className="inline-flex items-center gap-1 font-medium text-care underline-offset-2 hover:underline"
              >
                Voir le parcours complet <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          )}
        </section>
      )}

      {/* Liste dynamique issue du fichier JSON */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            3. Professionnels de ce cabinet
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
            {condition ? `Professionnels pour ${condition.name}` : currentStep ? "Suggérés pour mon étape" : "Tous"}
          </button>
          {availableProfessions.map((profession) => {
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

        {list.length > 0 ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {list.map((provider) => (
              <li
                key={provider.id}
                className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: professionColor[provider.profession] }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-balance text-foreground">{provider.name}</h3>
                    <p
                      className="mt-1 text-xs font-semibold"
                      style={{ color: professionColor[provider.profession] }}
                    >
                      {provider.profession}
                    </p>
                  </div>
                </div>

                <address className="mt-4 not-italic text-sm leading-6 text-muted-foreground">
                  {provider.address}
                  <br />
                  {provider.postalCode} {provider.city}
                </address>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-urgent/10 px-2.5 py-1 text-xs font-semibold text-urgent"
                    >
                      <Phone className="h-3.5 w-3.5" /> {provider.formattedPhone}
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${provider.name} ${provider.address} ${provider.postalCode} ${provider.city}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-care/10 px-2.5 py-1 text-xs font-semibold text-care"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Itinéraire
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Stethoscope className="mx-auto h-6 w-6 text-care" />
            <h3 className="mt-3 font-semibold text-foreground">Aucun professionnel pour ce filtre</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choisissez une autre spécialité ou affichez tous les professionnels.
            </p>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-care" />
          <span>
            Cet annuaire local est alimenté par le fichier de praticiens Kivoir. Vérifiez toujours
            les coordonnées et les disponibilités auprès du professionnel avant de vous déplacer.
          </span>
        </p>
      </section>

      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}
