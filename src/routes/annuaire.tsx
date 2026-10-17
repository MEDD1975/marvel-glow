import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, MapPin, Navigation, Phone, Search, ShieldCheck, Users } from "lucide-react";
import { PatientShell } from "@/components/patient/PatientShell";
import { categoryOf, usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState } from "@/components/patient/PatientUi";
import { professionOrder, isProfession, type Profession, type Cabinet } from "@/lib/directory";
import { professionalDisplayName } from "@/lib/professions";
import { formatCity, formatPhone, formatProviderName, formatStreet, phoneHref } from "@/lib/typography";

type PublicNetwork = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  ownerName: string | null;
  ownerProfession?: string | null;
  practitioners: Array<{ id: string; name: string; profession: string; phone: string | null; email: string | null; address: string | null; postalCode: string | null; city: string | null }>;
};

type Provider = Cabinet["providers"][number];

function parseNetworkAddress(value: string) {
  const match = value.match(/^(.*?),\s*(\d{5})\s+(.+)$/);
  return { address: match?.[1]?.trim() ?? value, postalCode: match?.[2] ?? "", city: match?.[3]?.trim() ?? "" };
}

function normalizeProfession(value: string): Profession | null {
  const normalized = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const aliases: Record<string, Profession> = {
    radiologue: "Radiologue",
    "centre de radiologie": "Radiologue",
    radiologie: "Radiologue",
    "chirurgien orthopediste": "Chirurgien orthopédiste",
    orthopediste: "Chirurgien orthopédiste",
    "chirurgie orthopedique": "Chirurgien orthopédiste",
  };
  return aliases[normalized]
    ?? professionOrder.find((profession) => profession.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalized)
    ?? (normalized ? "Médecin" : null);
}

function toCabinets(networks: PublicNetwork[]): Cabinet[] {
  return networks.map((network) => {
    const cabinetAddress = parseNetworkAddress(network.address);
    const dynamicProviders = network.practitioners.flatMap((practitioner) => {
      const practitionerName = practitioner.name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const isOrthopedicPractitioner = /(?:dr\.?\s*)?ortho\b/i.test(practitioner.name) || practitionerName.includes("orthop");
      const profession = isOrthopedicPractitioner
        ? "Chirurgien orthopédiste"
        : normalizeProfession(practitioner.profession);
      if (!profession) return [];
      const individualAddress = practitioner.address ? parseNetworkAddress(practitioner.address) : null;
      const rawCity = practitioner.city || individualAddress?.city || cabinetAddress.city;
      return [{
        id: practitioner.id,
        name: formatProviderName(practitioner.name),
        profession,
        address: formatStreet(individualAddress?.address || cabinetAddress.address, rawCity),
        postalCode: practitioner.postalCode || individualAddress?.postalCode || cabinetAddress.postalCode,
        city: formatCity(rawCity),
        phone: practitioner.phone ?? undefined,
        formattedPhone: practitioner.phone ?? undefined,
        cabinetId: network.id,
        cabinetName: network.name,
      }];
    });
    const ownerDisplay = professionalDisplayName(network.ownerName, network.ownerProfession);
    return {
      id: network.id,
      name: ownerDisplay ? `Professionnels recommandés par ${ownerDisplay}` : (network.name || "Professionnels recommandés"),
      searchNames: [ownerDisplay, network.name].filter((value): value is string => Boolean(value)),
      providers: dynamicProviders,
    };
  });
}

type Search = {
  cabinet?: string | undefined;
  profession?: Profession | undefined;
  doctor?: string | undefined;
  pro?: string | undefined;
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLocaleLowerCase("fr");
}

function cabinetMatchesQuery(cabinet: Cabinet, query: string): boolean {
  const search = normalizeSearchValue(query);
  if (search.length < 2) return false;
  const matchesCabinet = normalizeSearchValue(cabinet.name).includes(search);
  const matchesOwner = cabinet.searchNames?.some((name) => normalizeSearchValue(name).includes(search)) ?? false;
  const matchesPractitioner = cabinet.providers.some((provider) => normalizeSearchValue(provider.name).includes(search));
  return matchesCabinet || matchesOwner || matchesPractitioner;
}

/** Charge un cabinet par identifiant, les cabinets d'un médecin, ou tous les cabinets publics. */
function usePublicCabinets(options: { id?: string | undefined; owner?: string | undefined; enabled?: boolean }) {
  const { id, owner, enabled = true } = options;
  const [publicCabinets, setPublicCabinets] = useState<Cabinet[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setPublicCabinets(null);
    const endpoint = id
      ? `/api/public-networks?id=${encodeURIComponent(id)}`
      : owner
        ? `/api/public-networks?owner=${encodeURIComponent(owner)}`
        : "/api/public-networks";
    void fetch(endpoint)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PublicNetwork | PublicNetwork[] | null) => {
        if (!active) return;
        const networks = Array.isArray(data) ? data : data ? [data] : [];
        setPublicCabinets(toCabinets(networks));
      })
      .catch(() => {
        if (active) setPublicCabinets([]);
      });
    return () => {
      active = false;
    };
  }, [id, owner, enabled]);
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
    pro: typeof search["pro"] === "string" ? search["pro"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Professionnels recommandés — Kivoir" },
      {
        name: "description",
        content: "Les professionnels de santé communiqués par votre cabinet pour la suite de votre parcours, avec leurs coordonnées.",
      },
      { property: "og:title", content: "Professionnels recommandés — Kivoir" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnuaireRoute,
});

function AnnuaireRoute() {
  const search = Route.useSearch();
  return (
    <PatientShell search={search as Record<string, unknown>}>
      <AnnuairePage />
    </PatientShell>
  );
}

const DISCLAIMER =
  "Ces coordonnées sont communiquées à titre informatif. Vous restez libre de choisir votre professionnel de santé. Kivoir ne prend pas de rendez-vous et ne garantit pas la disponibilité des professionnels.";

function specialtyLabel(provider: Provider) {
  const category = categoryOf(provider.profession);
  if (category === "Imagerie médicale" && /centre|imagerie|radiolog/i.test(provider.name)) return "Imagerie médicale";
  return provider.profession;
}

function directionsUrl(provider: Provider) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${provider.name} ${provider.address} ${provider.postalCode} ${provider.city}`,
  )}`;
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

function AnnuairePage() {
  const { cabinet: cabinetId, profession, doctor, pro } = Route.useSearch();
  const { ready, ownerId, doctorLabel } = usePatient();
  const [searchOpen, setSearchOpen] = useState(Boolean(doctor));
  const hasSource = Boolean(cabinetId || ownerId);
  const cabinets = usePublicCabinets({ id: cabinetId, owner: cabinetId ? undefined : ownerId, enabled: ready && hasSource });
  const selected = cabinetId ? cabinets?.find((item) => item.id === cabinetId) ?? null : cabinets?.[0] ?? null;

  if (!ready || (hasSource && cabinets === null)) return <LoadingState />;

  if (!selected || !selected.providers.length) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <BackToHome />
          <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
            Aucun cabinet n&apos;est associé à votre parcours
          </h1>
          <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
            {cabinetId
              ? "Ce lien ne correspond à aucun cabinet disponible. Recherchez votre médecin pour afficher les professionnels qu'il recommande."
              : "Pour afficher les professionnels recommandés, utilisez le QR code remis par votre cabinet ou recherchez votre médecin."}
          </p>
        </div>
        <CabinetSearch profession={profession} doctor={doctor} />
      </div>
    );
  }

  const ownerName = selected.searchNames?.[0] ?? doctorLabel;
  const ownerPhrase = ownerName ? (ownerName.startsWith("Dr ") ? `du ${ownerName}` : `de ${ownerName}`) : undefined;
  const provider = pro ? selected.providers.find((item) => item.id === pro) : undefined;
  if (provider) return <ProviderDetail provider={provider} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackToHome />
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">Professionnels recommandés</h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Retrouvez les professionnels pouvant intervenir dans la suite de votre parcours.
        </p>
        {ownerPhrase ? (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-tone-green-text">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {`Coordonnées communiquées par le cabinet ${ownerPhrase}`}
          </p>
        ) : null}
      </div>

      <ProviderList providers={selected.providers} initialProfession={profession} />

      <p className="rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
      <aside className="text-xs leading-5 text-muted-foreground" aria-label="Information sur les coordonnées du réseau professionnel">
        Un professionnel référencé peut demander à tout moment la modification ou la suppression de ses données en écrivant à{" "}
        <a className="font-medium text-foreground underline underline-offset-2 hover:text-care" href="mailto:support@kivoir.fr">support@kivoir.fr</a>.
      </aside>

      {searchOpen ? (
        <CabinetSearch profession={profession} doctor={doctor} />
      ) : (
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Retrouver un autre cabinet
        </button>
      )}
    </div>
  );
}

function ProviderList({ providers, initialProfession }: { providers: Provider[]; initialProfession: Profession | undefined }) {
  const [filter, setFilter] = useState<string | null>(initialProfession ? categoryOf(initialProfession) : null);
  const categories = useMemo(() => {
    const ordered = professionOrder
      .filter((item) => providers.some((provider) => provider.profession === item))
      .map((item) => categoryOf(item));
    return Array.from(new Set(ordered));
  }, [providers]);
  const list = useMemo(
    () =>
      providers
        .filter((provider) => !filter || categoryOf(provider.profession) === filter)
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [providers, filter],
  );

  return (
    <section aria-label="Liste des professionnels">
      {categories.length > 1 ? (
        <label className="block max-w-md">
          <span className="sr-only">Filtrer par spécialité</span>
          <select
            value={filter ?? ""}
            onChange={(event) => setFilter(event.target.value || null)}
            className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Toutes les spécialités</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
      ) : null}

      {list.length ? (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {list.map((provider) => (
            <li key={provider.id}>
              <ProviderCard provider={provider} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState title="Aucun professionnel pour ce filtre" description="Choisissez une autre spécialité ou affichez tous les professionnels." />
        </div>
      )}
    </section>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  const tel = phoneHref(provider.phone);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-care">{specialtyLabel(provider)}</p>
      <h2 className="mt-1 text-base font-semibold leading-snug text-foreground">{provider.name}</h2>
      {provider.city ? (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          {provider.city}
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {tel ? (
          <a href={tel} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Appeler
          </a>
        ) : null}
        <a
          href={directionsUrl(provider)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-accent ${tel ? "" : "col-span-2"}`}
        >
          <Navigation className="h-4 w-4" aria-hidden="true" />
          Itin��raire
        </a>
      </div>
      <Link
        to="/annuaire"
        search={(prev: Search) => ({ ...prev, pro: provider.id })}
        className="mt-2 inline-flex min-h-11 items-center justify-center gap-1 rounded-xl text-sm font-medium text-care hover:bg-tone-blue"
      >
        Voir la fiche
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function ProviderDetail({ provider }: { provider: Provider }) {
  const tel = phoneHref(provider.phone);
  return (
    <article className="flex flex-col gap-6">
      <div>
        <Link
          to="/annuaire"
          search={(prev: Search) => ({ ...prev, pro: undefined })}
          className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux professionnels
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-care">{specialtyLabel(provider)}</p>
        <h1 className="mt-1 text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground">{provider.name}</h1>
      </div>

      <dl className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
        {provider.cabinetName ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Établissement</dt>
            <dd className="mt-0.5 text-base text-foreground">{provider.cabinetName}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Adresse</dt>
          <dd className="mt-0.5 text-base text-foreground">
            <address className="not-italic">
              {provider.address}
              <br />
              {[provider.postalCode, provider.city].filter(Boolean).join(" ")}
            </address>
          </dd>
        </div>
        {tel ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Téléphone</dt>
            <dd className="mt-0.5 text-base text-foreground">{formatPhone(provider.phone)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="grid gap-2 sm:grid-cols-2">
        {tel ? (
          <a href={tel} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90">
            <Phone className="h-5 w-5" aria-hidden="true" />
            Appeler
          </a>
        ) : null}
        <a
          href={directionsUrl(provider)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent"
        >
          <Navigation className="h-5 w-5" aria-hidden="true" />
          {"Itin\u00e9raire"}
        </a>
      </div>

      <p className="rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
    </article>
  );
}

function CabinetSearch({ profession, doctor }: { profession: Profession | undefined; doctor: string | undefined }) {
  const navigate = useNavigate({ from: "/annuaire" });
  const publicCabinets = usePublicCabinets({});
  const sourceCabinets = publicCabinets ?? [];
  const [query, setQuery] = useState(doctor ?? "");
  const [submittedQuery, setSubmittedQuery] = useState(doctor ?? "");
  const trimmed = query.trim();
  const matches = useMemo(
    () => (submittedQuery.length >= 2 ? sourceCabinets.filter((cabinet) => cabinetMatchesQuery(cabinet, submittedQuery)) : []),
    [sourceCabinets, submittedQuery],
  );
  const doctorSuggestions = useMemo(
    () =>
      sourceCabinets
        .flatMap((cabinet) => cabinet.searchNames ?? [cabinet.name.replace(/^Cabinet du\s+/i, "")])
        .filter((name, index, names) => names.indexOf(name) === index),
    [sourceCabinets],
  );
  const hasSearched = submittedQuery.length >= 2;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = sourceCabinets.filter((cabinet) => cabinetMatchesQuery(cabinet, trimmed));
    if (found.length === 1) {
      navigate({ search: { cabinet: found[0]!.id, profession } as Search, resetScroll: false });
      return;
    }
    setSubmittedQuery(trimmed);
    navigate({ search: { doctor: trimmed, profession } as Search, resetScroll: false });
  }

  return (
    <section aria-labelledby="cabinet-search-title" className="rounded-2xl border border-border bg-card p-4">
      <h2 id="cabinet-search-title" className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Users className="h-5 w-5 text-care" aria-hidden="true" />
        Rechercher un cabinet
      </h2>
      <form className="mt-3" onSubmit={handleSubmit}>
        <label htmlFor="doctor-search" className="text-sm text-muted-foreground">
          Nom de votre médecin
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="doctor-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            list="doctor-name-suggestions"
            autoComplete="off"
            placeholder="Ex. Dr Martin"
            className="min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-care/60 focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            disabled={trimmed.length < 2}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rechercher
          </button>
        </div>
        <datalist id="doctor-name-suggestions">
          {doctorSuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {hasSearched && matches.length === 0 ? (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            {`Aucun médecin ne correspond à « ${submittedQuery} ». Vérifiez l'orthographe ou essayez seulement le nom de famille.`}
          </p>
        ) : null}
        {matches.map((cabinet) => (
          <Link
            key={cabinet.id}
            to="/annuaire"
            search={{ cabinet: cabinet.id, profession }}
            className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 hover:bg-accent"
          >
            <span className="min-w-0">
              <span className="block font-medium text-foreground">{cabinet.name}</span>
              <span className="block text-sm text-muted-foreground">
                {`${cabinet.providers.length} professionnel${cabinet.providers.length > 1 ? "s" : ""}`}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-care" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
