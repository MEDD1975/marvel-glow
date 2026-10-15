import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { Condition, Zone } from "@/lib/conditions";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/doctor/states";

const zones: Array<Zone | "Toutes"> = ["Toutes", "Hanche", "Genou", "Cheville", "Pied"];

function normalize(value: string) {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function PathwayCard({ condition, selected, onSelect }: { condition: Condition; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-[4.5rem] w-full flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-care bg-care/10 shadow-sm ring-1 ring-care" : "border-border bg-card hover:border-care/50 hover:bg-care/5",
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{condition.zone}</span>
      <span className="mt-0.5 pr-7 text-sm font-semibold leading-snug text-foreground">{condition.name}</span>
      {selected ? (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-care text-care-foreground">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Sélectionné</span>
        </span>
      ) : null}
    </button>
  );
}

export function PathwaySelector({ conditions, selectedId, onSelect }: { conditions: Condition[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<Zone | "Toutes">("Toutes");

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return conditions.filter((condition) => {
      if (zone !== "Toutes" && condition.zone !== zone) return false;
      if (!needle) return true;
      return [condition.name, condition.zone, condition.summary].some((value) => normalize(value).includes(needle));
    });
  }, [conditions, query, zone]);

  return (
    <section aria-labelledby="pathway-selector-title" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="pathway-selector-title" className="text-base font-semibold text-foreground">1. Choisissez l’atteinte</h2>
        <label className="relative block sm:w-64">
          <span className="sr-only">Rechercher une atteinte</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une atteinte"
            className="min-h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer par zone">
        {zones.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setZone(item)}
            aria-pressed={zone === item}
            className={cn(
              "min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
              zone === item ? "border-care bg-care text-care-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((condition) => (
            <PathwayCard key={condition.id} condition={condition} selected={condition.id === selectedId} onSelect={() => onSelect(condition.id)} />
          ))}
        </div>
      ) : (
        <EmptyState className="mt-4" title="Aucune atteinte trouvée" description="Modifiez votre recherche ou choisissez une autre zone." />
      )}
    </section>
  );
}
