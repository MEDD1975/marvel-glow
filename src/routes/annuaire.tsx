import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Navigation,
  Phone,
  Search,
  Stethoscope,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import {
  cabinets,
  professionColor,
  professionOrder,
  isProfession,
  type Profession,
  type Cabinet,
} from "@/lib/directory";

type PublicNetwork = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  ownerName: string | null;
  practitioners: Array<{ id: string; name: string; profession: string; phone: string | null; email: string | null }>;
};

function normalizeProfession(value: string): Profession | null {
  const normalized = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return professionOrder.find((profession) => profession.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalized)
    ?? (normalized ? "Médecin" : null);
}

function toCabinets(networks: PublicNetwork[]): Cabinet[] {
  return networks.map((network) => {
    const ownerNeedle = network.ownerName?.replace(/^Dr\.?\s*/i, "").trim().toLowerCase();
    const matchingStaticCabinet = cabinets.find((cabinet) => {
      const cabinetName = cabinet.name.toLowerCase();
      return Boolean(ownerNeedle && cabinetName.includes(ownerNeedle));
    });
    const dynamicProviders = network.practitioners.flatMap((practitioner) => {
      const profession = normalizeProfession(practitioner.profession);
      if (!profession) return [];
      return [{
        id: practitioner.id,
        name: practitioner.name,
        profession,
        address: network.address,
        postalCode: "",
        city: "",
        phone: practitioner.phone ?? undefined,
        formattedPhone: practitioner.phone ?? undefined,
        cabinetId: network.id,
        cabinetName: network.name,
      }];
    });
    const dynamicNames = new Set(dynamicProviders.map((provider) => provider.name.trim().toLowerCase()));
    const preservedProviders = matchingStaticCabinet?.providers
      .filter((provider) => !dynamicNames.has(provider.name.trim().toLowerCase()))
      .map((provider) => ({ ...provider, cabinetId: network.id, cabinetName: network.name })) ?? [];

    return {
      id: network.id,
      name: network.ownerName ? `Cabinet du ${network.ownerName}` : network.name,
      providers: [...preservedProviders, ...dynamicProviders],
    };
  });
}

type Search = {
  cabinet?: string | undefined;
  profession?: Profession | undefined;
  doctor?: string | undefined;
};

function usePublicCabinets() {
  const [publicCabinets, setPublicCabinets] = useState<Cabinet[] | null>(null);
  useEffect(() => {
    let active = true;
    void fetch("/api/public-networks")
      .then((response) => response.ok ? response.json() : [])
      .then((data: PublicNetwork[]) => {
        if (active && data.length) setPublicCabinets(toCabinets(data));
        else if (active) setPublicCabinets([]);
      })
      .catch(() => { if (active) setPublicCabinets([]); });
    return () => { active = false; };
  }, []);
  return publicCabinets;
}

export const Route = createFileRoute("/annuaire")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cabinet: typeof search["cabinet"] === "string" ? search["cabinet"] : undefined,
    profession:
      typeof search["profession"] === "string" && isProfession(search["profession"])
        ? search["profession"]
        : undefined,
    doctor: typeof search["doctor"] === "string" ? search["doctor"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Réseau professionnel à Saint-Maur-des-Fossés — Kivoir" },
      {
        name: "description",
        content:
          "Dites où vous en êtes de votre parcours : Kivoir affiche les professionnels partenaires disponibles à Saint-Maur-des-Fossés.",
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

function CabinetChooser({ invalidId, profession, doctor }: { invalidId?: string; profession?: Profession; doctor?: string }) {
  const navigate = useNavigate({ from: "/annuaire" });
  const publicCabinets = usePublicCabinets();
  const sourceCabinets = publicCabinets ?? cabinets;
  const [query, setQuery] = useState(doctor ?? "");
  const [submittedQuery, setSubmittedQuery] = useState(doctor ?? "");
  const trimmed = query.trim();
  const matches = useMemo(
    () => (submittedQuery.length >= 2
      ? sourceCabinets.filter((cabinet) => {
          const search = submittedQuery.toLowerCase();
          return cabinet.name.toLowerCase().includes(search)
            || cabinet.providers.some((provider) => provider.name.toLowerCase().includes(search));
        })
      : []),
    [sourceCabinets, submittedQuery],
  );
  const doctorSuggestions = useMemo(
    () =>
      sourceCabinets
        .flatMap((cabinet) => cabinet.providers)
        .filter((provider) => provider.profession === "Médecin" || provider.profession === "Médecin généraliste" || provider.profession === "Médecin du sport")
        .map((provider) => provider.name)
        .filter((name, index, names) => names.indexOf(name) === index),
    [sourceCabinets],
  );
  const hasSearched = submittedQuery.length >= 2;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(trimmed);
    navigate({ search: { doctor: trimmed, profession } as Search, resetScroll: false });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Link
        to="/"
        search={{ started: true }}
        aria-label="Retourner à l’espace patient"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à mon espace patient
      </Link>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <span className="inline-flex rounded-full bg-care/10 px-3 py-1 text-xs font-semibold text-care">
          Réseau professionnel
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-balance text-foreground md:text-3xl">
          {invalidId ? "Ce cabinet n’est pas disponible" : "Retrouvez le réseau de votre médecin"}
        </h1>
        <p className="mt-2 max-w-xl leading-6 text-muted-foreground">
          {invalidId
            ? `L’identifiant « ${invalidId} » ne correspond à aucun cabinet. Saisissez le nom de votre médecin pour retrouver son carnet de recommandations.`
            : "Entrez le nom de votre médecin pour afficher son carnet de recommandations et les professionnels recommandés."}
        </p>

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-care/60">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="doctor-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
            Saisissez le nom de votre médecin, par exemple Dr A ou Dr B, puis cliquez sur Valider pour retrouver son réseau.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmittedQuery(trimmed);
              navigate({ search: { doctor: trimmed, profession } as Search, resetScroll: false });
            }}
            disabled={trimmed.length < 2}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-care px-4 py-2.5 text-sm font-semibold text-care-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Valider
          </button>
        </form>

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
  const { cabinet: cabinetId, profession, doctor } = Route.useSearch();
  const navigate = useNavigate({ from: "/annuaire" });
  const publicCabinets = usePublicCabinets();
  const sourceCabinets = publicCabinets ?? cabinets;
  const [professionFilter, setProfessionFilter] = useState<Profession | null>(profession ?? null);

  const selectedCabinet = sourceCabinets.find((cabinet) => cabinet.id === cabinetId) ?? null;
  const cabinetProviders = selectedCabinet?.providers ?? [];
  const availableProfessions = professionOrder.filter((profession) =>
    cabinetProviders.some((provider) => provider.profession === profession),
  );

  const list = useMemo(() => {
    const base = cabinetProviders.filter((provider) => {
      if (professionFilter) return provider.profession === professionFilter;
      return true;
    });
    return [...base].sort((a, b) => {
      return a.name.localeCompare(b.name, "fr");
    });
  }, [cabinetProviders, professionFilter]);

  if (!selectedCabinet) {
    return <CabinetChooser {...(cabinetId ? { invalidId: cabinetId } : {})} {...(profession ? { profession } : {})} {...(doctor ? { doctor } : {})} />;
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
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Retrouvez les professionnels du réseau de soins proposé par ce cabinet à Saint-Maur.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-foreground">Réseau professionnel</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setProfessionFilter(null)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              professionFilter === null ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous les professionnels
          </button>
          {availableProfessions.map((profession) => {
            const active = professionFilter === profession;
            return (
              <button
                key={profession}
                onClick={() => setProfessionFilter(active ? null : profession)}
                className="rounded-full border px-3 py-1.5 text-xs transition-colors"
                style={active ? { backgroundColor: professionColor[profession], color: "#fff", borderColor: professionColor[profession] } : { borderColor: "var(--border)", color: professionColor[profession] }}
              >
                {profession}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">

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
