import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProfessionals } from "@/components/patient/PatientProvider";
import { EmptyState, ErrorState, FreeChoiceNotice, ListGroup, ListRow, LoadingState, PageHeading } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/professionnels/")({
  component: ProfessionalsPage,
});

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function ProfessionalsPage() {
  const { isLoading, isError, retry, fromCabinet, professionals } = useProfessionals();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Tous");

  const categories = useMemo(() => ["Tous", ...Array.from(new Set(professionals.map((item) => item.category))).sort((a, b) => a.localeCompare(b, "fr"))], [professionals]);
  const filtered = professionals.filter((item) => {
    if (category !== "Tous" && item.category !== category) return false;
    if (!query.trim()) return true;
    return normalize(`${item.name} ${item.specialty} ${item.address ?? ""}`).includes(normalize(query.trim()));
  });

  return (
    <div>
      <PageHeading
        title="Professionnels recommandés"
        description={fromCabinet ? "Les professionnels que votre cabinet a choisi de vous communiquer." : "Annuaire de démonstration : votre cabinet n'a pas encore communiqué de professionnels."}
      />
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
      <div role="group" aria-label="Filtrer par catégorie" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
              category === item ? "border-care/30 bg-tone-blue text-care" : "border-border/70 bg-card text-foreground hover:bg-accent"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {isError ? (
          <div className="mb-4">
            <ErrorState message="Les professionnels de votre cabinet n'ont pas pu être chargés. L'annuaire de démonstration est affiché." onRetry={retry} />
          </div>
        ) : null}
        {isLoading ? (
          <LoadingState label="Chargement des professionnels…" />
        ) : filtered.length ? (
          <ListGroup label="Professionnels">
            {filtered.map((item) => (
              <li key={item.id}>
                <ListRow
                  to="/patient/professionnels/$proId"
                  params={{ proId: item.id }}
                  title={item.name}
                  description={item.specialty}
                  leading={
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tone-green text-sm font-semibold text-tone-green-text" aria-hidden="true">
                      {item.name.replace(/^(dr\.?|docteur)\s+/i, "").charAt(0).toUpperCase()}
                    </span>
                  }
                />
              </li>
            ))}
          </ListGroup>
        ) : (
          <EmptyState title="Aucun professionnel trouvé" description="Modifiez votre recherche ou le filtre." />
        )}
      </div>
      <FreeChoiceNotice />
      <p className="mt-3 text-sm text-muted-foreground">Kivoir ne prend pas de rendez-vous : contactez directement le professionnel.</p>
    </div>
  );
}
