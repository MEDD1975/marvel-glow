import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Search, UsersRound } from "lucide-react";
import { useDoctorResources, usePatient, useProfessionals } from "@/components/patient/PatientProvider";
import { EmptyState, ErrorState, FreeChoiceNotice, ListGroup, ListRow, LoadingState, PageHeading } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/professionnels/")({
  component: ProfessionalsPage,
});

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function specialtyBadge(specialty: string, category: string) {
  const value = normalize(`${specialty} ${category}`);
  if (value.includes("kines")) return { label: "K", className: "bg-[#E3F4ED] text-[#277A5D]" };
  if (value.includes("general")) return { label: "MG", className: "bg-[#E5EEFF] text-[#2868B8]" };
  if (value.includes("osteo")) return { label: "O", className: "bg-[#F2EAFE] text-[#7851A9]" };
  if (value.includes("sport")) return { label: "MS", className: "bg-[#FFF0D8] text-[#A66B16]" };
  if (value.includes("rhum")) return { label: "R", className: "bg-[#FDE8E8] text-[#B55454]" };
  if (value.includes("radiolog")) return { label: "RG", className: "bg-[#E8E6FB] text-[#6256A8]" };
  if (value.includes("podolog")) return { label: "P", className: "bg-[#FBE7F0] text-[#AA5275]" };
  return { label: specialty.trim().charAt(0).toUpperCase(), className: "bg-[#EEF2F7] text-[#526176]" };
}

function ProfessionalsPage() {
  const { guide } = usePatient();
  const { data: resources = [] } = useDoctorResources();
  const { isLoading, isError, retry, fromCabinet, professionals } = useProfessionals();
  const orientation = resources.find((resource) => resource.kind === "orientation" && resource.conditionId === guide?.id);
  const recommendedSpecialty = orientation?.title.replace(/^À voir ensuite\s*:\s*/i, "").trim();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Tous");
  const [showFullNetwork, setShowFullNetwork] = useState(false);
  const categories = useMemo(() => ["Tous", ...Array.from(new Set(professionals.map((item) => item.category))).sort((a, b) => a.localeCompare(b, "fr"))], [professionals]);
  const filtered = professionals.filter((item) => {
    if (recommendedSpecialty && !showFullNetwork && !normalize(`${item.specialty} ${item.category}`).includes(normalize(recommendedSpecialty))) return false;
    if (category !== "Tous" && item.category !== category) return false;
    if (!query.trim()) return true;
    return normalize(`${item.name} ${item.specialty} ${item.address ?? ""}`).includes(normalize(query.trim()));
  });
  const visibleProfessionals = [...filtered].sort((a, b) => {
    if (!recommendedSpecialty) return 0;
    return Number(normalize(`${b.specialty} ${b.category}`).includes(normalize(recommendedSpecialty))) - Number(normalize(`${a.specialty} ${a.category}`).includes(normalize(recommendedSpecialty)));
  });

  return (
    <div>
      <PageHeading
        title="Qui contacter ?"
        description={recommendedSpecialty ? "Les professionnels recommandés pour la suite de votre parcours." : "Retrouvez les coordonnées communiquées pour ce parcours."}
      />
      {recommendedSpecialty ? (
        <>
        <section className="mb-5 overflow-hidden rounded-3xl border border-[#C9DCF3] bg-gradient-to-br from-[#EDF5FF] via-white to-[#F2FBF7] shadow-[0_10px_30px_rgba(31,78,121,0.07)]">
          <div className="flex items-start gap-3 border-b border-[#D9E7F6] px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#DCEBFF] text-[#1769CF]" aria-hidden="true"><Check className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1769CF]">Orientation de votre professionnel</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#101C33]">Consulter un {recommendedSpecialty.toLowerCase()}</h2>
            </div>
          </div>
          <div className="px-5 py-3">
            <p className="text-sm leading-5 text-[#526176]">Votre professionnel vous recommande cette spécialité.</p>
          </div>
        </section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-[#526176]">Le professionnel recommandé est affiché en premier.</p>
          <button type="button" onClick={() => setShowFullNetwork((current) => !current)} className="shrink-0 rounded-full border border-[#1769CF] bg-white px-4 py-2 text-xs font-semibold text-[#1769CF] transition-colors hover:bg-[#1769CF] hover:text-white">
            {showFullNetwork ? "Voir la recommandation" : "Voir tout le réseau"}
          </button>
        </div>
        </>
      ) : null}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#101C33]"><UsersRound className="h-4 w-4 text-[#1769CF]" aria-hidden="true" />{recommendedSpecialty ? `Réseau partagé par votre professionnel` : "Professionnels du parcours"}</div>
        </div>
        {!isLoading ? <span className="text-xs text-[#718096]">{visibleProfessionals.length} résultat{visibleProfessionals.length > 1 ? "s" : ""}</span> : null}
      </div>
      <label className="relative block">
        <span className="sr-only">Rechercher un professionnel</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, spécialité, ville…"
          className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="mt-3 block max-w-md">
        <span className="sr-only">Filtrer par spécialité</span>
        <select
          value={category === "Tous" ? "" : category}
          onChange={(event) => setCategory(event.target.value || "Tous")}
          className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Toutes les spécialités</option>
          {categories.filter((item) => item !== "Tous").map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className="mt-4">
        {isError ? (
          <div className="mb-4">
            <ErrorState message="Les professionnels de votre cabinet n'ont pas pu être chargés. L'annuaire de démonstration est affiché." onRetry={retry} />
          </div>
        ) : null}
        {isLoading ? (
          <LoadingState label="Chargement des professionnels…" />
        ) : visibleProfessionals.length ? (
          <ListGroup label="Professionnels">
            {visibleProfessionals.map((item) => {
              const badge = specialtyBadge(item.specialty, item.category);
              return (
              <li key={item.id}>
                <ListRow
                  to="/patient/professionnels/$proId"
                  params={{ proId: item.id }}
                  title={item.name}
                  description={item.specialty}
                  leading={
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold tracking-wide ${badge.className}`} aria-hidden="true">
                      {badge.label}
                    </span>
                  }
                />
              </li>
              );
            })}
          </ListGroup>
        ) : (
          <EmptyState
            title={recommendedSpecialty ? `Aucun ${recommendedSpecialty} trouvé dans le réseau` : "Aucun professionnel trouvé"}
            description={recommendedSpecialty ? "Votre professionnel de santé peut vous orienter vers une autre structure si nécessaire." : "Modifiez votre recherche ou le filtre."}
          />
        )}
      </div>
      <FreeChoiceNotice />
    </div>
  );
}
