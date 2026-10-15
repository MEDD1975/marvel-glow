import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { Condition, Zone } from "@/lib/conditions";
import { zoneOrder, zoneVisuals } from "@/lib/zone-visuals";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/doctor/states";

function normalize(value: string) {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function PathwayCard({ condition, selected, onSelect }: { condition: Condition; selected: boolean; onSelect: () => void }) {
  const visual = zoneVisuals[condition.zone];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-2xl border-2 bg-card p-1.5 text-left shadow-[0_1px_2px_rgba(16,35,72,0.06)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "border-care bg-care-muted/60 shadow-[0_4px_14px_-6px_rgba(11,99,206,0.45)]" : "border-transparent ring-1 ring-border hover:ring-care/40 hover:shadow-md",
      )}
    >
      <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-care-muted">
        <img src={visual.src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full scale-[1.35] object-cover" />
        {selected ? (
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-care text-care-foreground shadow-sm ring-2 ring-card">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col px-1.5 pb-1 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{condition.zone}</span>
        <span className="mt-0.5 text-pretty text-sm font-semibold leading-snug text-foreground">{condition.name}</span>
        {selected ? (
          <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-care px-2 py-0.5 text-[11px] font-semibold text-care-foreground">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            Sélectionnée
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function PathwaySelector({ conditions, selectedId, onSelect }: { conditions: Condition[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<Zone | "Toutes">("Toutes");

  const zones = useMemo<Array<Zone | "Toutes">>(() => {
    const present = new Set(conditions.map((condition) => condition.zone));
    return ["Toutes", ...zoneOrder.filter((item) => present.has(item))];
  }, [conditions]);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return conditions.filter((condition) => {
      if (zone !== "Toutes" && condition.zone !== zone) return false;
      if (!needle) return true;
      return [condition.name, condition.zone, condition.summary].some((value) => normalize(value).includes(needle));
    });
  }, [conditions, query, zone]);

  return (
    <section aria-labelledby="pathway-selector-title" className="@container flex flex-col gap-3">
      <h2 id="pathway-selector-title" className="sr-only">Choisissez l’atteinte</h2>
      <label className="relative block">
        <span className="sr-only">Rechercher une atteinte</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une atteinte"
          className="min-h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-[0_1px_2px_rgba(16,35,72,0.04)] outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:px-0" role="group" aria-label="Filtrer par zone">
        {zones.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setZone(item)}
            aria-pressed={zone === item}
            className={cn(
              "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
              zone === item ? "border-care bg-care text-care-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length ? (
        <ul className="grid grid-cols-2 gap-2.5 @md:grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-5" aria-label="Atteintes disponibles">
          {visible.map((condition) => (
            <li key={condition.id}>
              <PathwayCard condition={condition} selected={condition.id === selectedId} onSelect={() => onSelect(condition.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucune atteinte trouvée" description="Modifiez votre recherche ou choisissez une autre zone." />
      )}
    </section>
  );
}
